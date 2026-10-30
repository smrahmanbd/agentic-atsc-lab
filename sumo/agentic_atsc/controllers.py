"""
Signal controllers, from classic to agentic.

    FixedTime        a stored plan (cycle, split, offsets for a green wave)
    Actuated         extends green while vehicles keep arriving (gap-out)
    MaxPressure      serves the stage with the largest in-minus-out pressure
    AgenticController  one agent per junction: perceive -> reason -> act,
                     with tools, memory, goals, messages to neighbours,
                     an explanation for every decision, and a safety shield
    QLearningAgent   learns keep/switch from reward (Go 2, Lab 3)
    LLMAgent         a language-model policy behind a safety shield (Lab 6)

All controllers see junctions only through `Junction` tools and change
signals only through `Junction.request`, so the yellow / all-red / minimum
green rules are identical for everyone.
"""
from __future__ import annotations

import json
import math
import random
from collections import deque
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional

from .junction import ALL_RED, YELLOW, Junction

MIN_GREEN = 8
MAX_GREEN = 60
LOST = YELLOW + ALL_RED


class Controller:
    name = "base"

    def setup(self, junctions: Dict[str, Junction], ctx: Dict) -> None:
        self.J, self.ctx = junctions, ctx
        self.log: List[Dict] = []

    def step(self, t: float) -> None:  # called once per simulated second
        raise NotImplementedError

    # Signal Phase and Timing (SPaT) for connected vehicles: (stage_green, seconds_to_change or None)
    def spat(self, jid: str, t: float):
        j = self.J[jid]
        return (j.stage if j.phase == "green" else None), None


# ===================================================================== classic
class FixedTime(Controller):
    name = "fixed"

    def __init__(self, cycle: int = 60, ew_share: float = 0.6, wave_speed: Optional[float] = 13.0):
        self.cycle, self.ew_share, self.wave_speed = cycle, ew_share, wave_speed

    def setup(self, junctions, ctx):
        super().setup(junctions, ctx)
        xs = ctx.get("xs", [0.0] * len(junctions))
        self.offset = {jid: ((x / self.wave_speed) if self.wave_speed else 0.0) % self.cycle
                       for jid, x in zip(junctions, xs)}
        self.g_ew = self.ew_share * (self.cycle - 2 * LOST)

    def _want(self, jid, t):
        tc = (t - self.offset[jid]) % self.cycle
        return "EW" if tc < self.g_ew + LOST else "NS"

    def step(self, t):
        for jid, j in self.J.items():
            if j.phase == "green" and self._want(jid, t) != j.stage:
                j.request(self._want(jid, t), t)

    def spat(self, jid, t):
        j = self.J[jid]
        if j.phase != "green":
            return None, None
        tc = (t - self.offset[jid]) % self.cycle
        end_ew = self.g_ew + LOST
        rem = (end_ew - tc) if j.stage == "EW" else (self.cycle - tc)
        return j.stage, max(0.0, rem)


class Actuated(Controller):
    name = "actuated"

    def __init__(self, max_green: int = 45, gap_zone: float = 40.0):
        self.max_green, self.gap_zone = max_green, gap_zone

    def step(self, t):
        for j in self.J.values():
            if j.phase != "green":
                continue
            g, other = j.green_time(t), Junction.other(j.stage)
            if g < MIN_GREEN or j.queue(other) == 0 and j.count(other) == 0:
                continue
            if g >= self.max_green or j.approaching(j.stage, self.gap_zone) == 0:
                j.request(other, t)


class MaxPressure(Controller):
    name = "max_pressure"

    def __init__(self, interval: int = 5):
        self.interval = interval

    def step(self, t):
        if int(t) % self.interval:
            return
        for j in self.J.values():
            if j.phase != "green" or j.green_time(t) < MIN_GREEN:
                continue
            other = Junction.other(j.stage)
            if j.pressure(other) > j.pressure(j.stage) + 1:
                j.request(other, t)


# ===================================================================== agentic
@dataclass
class Goals:
    """What the agent is trying to achieve; weights turn goals into a score."""
    w_queue: float = 1.0        # efficiency: serve queues
    w_wait: float = 0.15        # fairness: per second of the longest wait
    w_arrive: float = 0.7       # efficiency: moving vehicles about to reach the stop line
    w_platoon: float = 0.8      # coordination: per vehicle in an announced platoon
    w_priority: float = 25.0    # transit / emergency requests
    w_spill: float = 12.0       # avoid sending cars into a full downstream link
    hysteresis: float = 2.0     # switching costs lost time; demand a clear advantage
    max_wait_cap: float = 90.0  # fairness guardrail: never let anyone wait longer


@dataclass
class Message:
    t_sent: float
    sender: str
    to: str
    kind: str
    data: Dict


class MessageBus:
    """Agent-to-agent messages with optional latency and loss (Go 3, R1)."""

    def __init__(self, latency: float = 0.0, loss: float = 0.0, seed: int = 0):
        self.latency, self.loss, self.rnd = latency, loss, random.Random(seed)
        self.queue: List[Message] = []
        self.sent = self.dropped = 0

    def send(self, m: Message):
        self.sent += 1
        if self.rnd.random() < self.loss:
            self.dropped += 1
            return
        self.queue.append(m)

    def inbox(self, jid: str, t: float) -> List[Message]:
        got = [m for m in self.queue if m.to == jid and t - m.t_sent >= self.latency]
        self.queue = [m for m in self.queue if m not in got]
        return got


class SafetyShield:
    """Checks every proposed action against hard rules before it reaches the signal."""

    def __init__(self, enabled: bool = True):
        self.enabled = enabled
        self.blocked: List[str] = []      # unsafe proposals the shield stopped
        self.violations: List[str] = []   # unsafe proposals that reached the signal (shield off)

    def check(self, j: Junction, action: str, t: float, max_wait_cap: float) -> (str, Optional[str]):
        if not self.enabled:   # still record what *would* have been unsafe
            safe, why = self._rules(j, action, t, max_wait_cap)
            if why:
                self.violations.append(f"{t:.0f} {j.jid if hasattr(j, 'jid') else ''}: {why}")
            return action, None
        return self._rules(j, action, t, max_wait_cap)

    def _rules(self, j, action, t, max_wait_cap):
        if action not in ("keep", "switch"):
            return "keep", f"unknown action '{action}'"
        g = j.green_time(t)
        if j.phase != "green":
            return "keep", None
        if action == "switch" and g < MIN_GREEN:
            return "keep", f"switch before minimum green ({g:.0f} < {MIN_GREEN} s)"
        if action == "keep" and g >= MAX_GREEN and j.count(Junction.other(j.stage)) > 0:
            return "switch", f"maximum green {MAX_GREEN} s reached"
        if action == "keep" and j.max_wait(Junction.other(j.stage)) > max_wait_cap:
            return "switch", f"fairness cap: someone waited > {max_wait_cap:.0f} s"
        return action, None


class AgenticController(Controller):
    """One agent per junction running an explicit perceive -> reason -> act loop.

    perceive():  calls tools (queues, longest wait, downstream occupancy,
                 priority requests, messages from neighbours)
    reason():    scores 'keep' vs 'switch' against the goals and writes a
                 plain-language rationale
    act():       passes the choice through the safety shield, then actuates
    communicate(): tells the downstream neighbour when a platoon is released
    """
    name = "agentic"

    def __init__(self, goals: Goals = None, communicate: bool = True, bus: MessageBus = None,
                 perception: str = "loop", penetration: float = 1.0, shield: bool = True,
                 interval: int = 2, commit_horizon: float = 0.0, travel_speed: float = 12.0):
        self.goals = goals or Goals()
        self.communicate_on, self.bus = communicate, bus or MessageBus()
        self.perception, self.penetration = perception, penetration
        self.shield = SafetyShield(shield)
        self.interval, self.commit_h, self.vt = interval, commit_horizon, travel_speed

    def setup(self, junctions, ctx):
        super().setup(junctions, ctx)
        ids = list(junctions)
        self.down = {}   # jid -> {stage_dir: neighbour}
        for i, jid in enumerate(ids):
            self.down[jid] = {"EB": ids[i + 1] if i + 1 < len(ids) else None,
                              "WB": ids[i - 1] if i > 0 else None}
        self.memory = {jid: deque(maxlen=30) for jid in ids}
        self.expected = {jid: [] for jid in ids}      # announced platoons (eta, size)
        self.scheduled = {}                            # jid -> (t_switch, stage) committed changes
        self.travel = ctx.get("spacing", 300.0) / self.vt

    # ---------------------------------------------------------- perceive
    def perceive(self, jid: str, t: float) -> Dict:
        j = self.J[jid]
        obs = {"t": t, "stage": j.stage, "green_for": round(j.green_time(t), 1)}
        for s in ("EW", "NS"):
            if self.perception == "cav":
                q = j.cav_estimate(s, self.penetration)
            else:
                q = j.queue(s)
            obs[f"queue_{s}"] = round(q, 1)
            obs[f"wait_{s}"] = round(j.max_wait(s), 1)
            obs[f"arriving_{s}"] = j.approaching(s, 50.0)
            obs[f"spill_{s}"] = round(j.downstream_occupancy(s), 2)
            obs[f"priority_{s}"] = j.priority_requests(s)
        msgs = [m for m in self.bus.inbox(jid, t) if m.kind == "platoon"]
        if msgs:   # newest snapshot from each sender replaces the old one
            latest = {}
            for m in msgs:
                latest.setdefault(m.sender, []).append(m)
            keep = [e for e in self.expected[jid] if e[2] not in latest]
            for snd, ms in latest.items():
                tmax = max(m.t_sent for m in ms)
                keep += [(m.data["eta"], m.data["size"], snd) for m in ms if m.t_sent == tmax]
            self.expected[jid] = keep
        self.expected[jid] = [e for e in self.expected[jid] if e[0] > t - 3]
        obs["platoon_EW"] = sum(n for eta, n, _ in self.expected[jid] if eta <= t + 12)
        self.memory[jid].append(obs)
        return obs

    # ---------------------------------------------------------- reason
    def score(self, obs: Dict, s: str) -> float:
        g = self.goals
        sc = g.w_queue * obs[f"queue_{s}"] + g.w_wait * obs[f"wait_{s}"] + g.w_arrive * obs[f"arriving_{s}"]
        if s == "EW":
            sc += g.w_platoon * obs["platoon_EW"]
        if obs[f"priority_{s}"]:
            sc += g.w_priority
        if obs[f"spill_{s}"] > 0.6:
            sc -= g.w_spill * (obs[f"spill_{s}"] - 0.6) / 0.4
        return sc

    def reason(self, obs: Dict) -> (str, str):
        cur, oth = obs["stage"], Junction.other(obs["stage"])
        s_cur, s_oth = self.score(obs, cur), self.score(obs, oth)
        why = []
        if obs[f"priority_{oth}"]:
            why.append(f"priority request on {oth} ({obs[f'priority_{oth}'][0].split(':')[0]})")
        if obs[f"priority_{cur}"]:
            why.append(f"priority vehicle still on {cur}")
        if cur == "EW" and obs["platoon_EW"]:
            why.append(f"platoon of {obs['platoon_EW']} arriving from upstream")
        if obs[f"spill_{oth}"] > 0.6:
            why.append(f"{oth} exit is {obs[f'spill_{oth}']:.0%} full")
        if s_oth > s_cur + self.goals.hysteresis:
            act = "switch"
            lead = f"switch to {oth}: score {s_oth:.1f} vs {s_cur:.1f} (queue {obs[f'queue_{oth}']:.0f}, longest wait {obs[f'wait_{oth}']:.0f} s)"
        else:
            act = "keep"
            lead = (f"keep {cur}: score {s_cur:.1f} vs {s_oth:.1f} ({obs[f'queue_{cur}']:.0f} queued, "
                    f"{obs.get(f'arriving_{cur}', 0)} arriving on {cur}; {oth} not clearly busier)")
        return act, lead + ("; " + "; ".join(why) if why else "")

    # ---------------------------------------------------------- act
    def act(self, jid: str, t: float, action: str, rationale: str) -> None:
        j = self.J[jid]
        safe, reason = self.shield.check(j, action, t, self.goals.max_wait_cap)
        if reason:
            self.shield.blocked.append(f"{t:.0f} {jid}: {reason}")
            rationale += f"  [shield: {reason} -> {safe}]"
        if safe == "switch":
            target = Junction.other(j.stage)
            if self.commit_h > 0:
                if jid not in self.scheduled:
                    self.scheduled[jid] = (t + self.commit_h, target)
                    rationale += f"  [committed: change at t={t + self.commit_h:.0f}]"
            else:
                j.request(target, t)
                self._announce(jid, t, target)
        if len(self.log) < 20000:
            self.log.append({"t": t, "jid": jid, "action": safe, "why": rationale})

    def _announce(self, jid: str, t: float, new_stage: str) -> None:
        """Called when EW turns green (kept for compatibility)."""
        return

    def communicate(self, jid: str, t: float) -> None:
        """Tell each downstream neighbour how many vehicles are on the way and when they arrive.

        The upstream agent sees vehicles leave its own stop line long before the
        downstream agent can detect them, so this extends the neighbour's horizon.
        """
        if not self.communicate_on:
            return
        import traci
        for d, nb in self.down[jid].items():
            if not nb:
                continue
            edge = f"{jid}_{nb}"
            try:
                L = traci.lane.getLength(edge + "_0")
                ids = traci.edge.getLastStepVehicleIDs(edge)
            except traci.TraCIException:
                continue
            groups = {}
            for v in ids:
                rem = L - traci.vehicle.getLanePosition(v)
                if rem < 60:          # already inside the neighbour's own detection zone
                    continue
                eta = t + rem / self.vt
                k = int((eta - t) // 5)
                groups.setdefault(k, []).append(eta)
            for k, etas in groups.items():
                self.bus.send(Message(t, jid, nb, "platoon", {"eta": sum(etas) / len(etas), "size": len(etas)}))

    def step(self, t):
        for jid, (ts, target) in list(self.scheduled.items()):
            if t >= ts:
                if self.J[jid].request(target, t):
                    self._announce(jid, t, target)
                del self.scheduled[jid]
        if int(t) % self.interval:
            return
        for jid in self.J:
            self.communicate(jid, t)
        for jid, j in self.J.items():
            if j.phase != "green" or jid in self.scheduled:
                continue
            obs = self.perceive(jid, t)
            action, why = self.reason(obs)
            self.act(jid, t, action, why)

    def spat(self, jid, t):
        j = self.J[jid]
        if j.phase != "green":
            return None, None
        if jid in self.scheduled:
            return j.stage, max(0.0, self.scheduled[jid][0] - t)
        return j.stage, None      # adaptive and uncommitted: end time unknown


# ===================================================================== learning
class QLearningAgent(Controller):
    """Tabular Q-learning: state = (stage, queue bins, green bin), action = keep/switch."""
    name = "q_learning"

    def __init__(self, q: Dict = None, epsilon: float = 0.1, alpha: float = 0.2, gamma: float = 0.9,
                 interval: int = 5, learn: bool = True, seed: int = 0):
        self.Q = q if q is not None else {}
        self.eps, self.alpha, self.gamma, self.interval, self.learn = epsilon, alpha, gamma, interval, learn
        self.rnd = random.Random(seed)
        self.prev = {}
        self.rewards = []

    @staticmethod
    def _bin(q):
        return min(int(q // 3), 5)

    def state(self, j: Junction, t):
        g = j.green_time(t)
        gb = 0 if g < MIN_GREEN else 1 if g < 20 else 2 if g < 40 else 3
        return f"{j.stage}|{self._bin(j.queue('EW'))}|{self._bin(j.queue('NS'))}|{gb}"

    def _q(self, s):
        return self.Q.setdefault(s, [0.0, 0.0])

    def step(self, t):
        if int(t) % self.interval:
            return
        for jid, j in self.J.items():
            if j.phase != "green":
                continue
            s = self.state(j, t)
            r = -(j.queue("EW") + j.queue("NS"))
            if self.learn and jid in self.prev:
                ps, pa = self.prev[jid]
                q = self._q(ps)
                q[pa] += self.alpha * (r + self.gamma * max(self._q(s)) - q[pa])
            self.rewards.append(r)
            if self.learn and self.rnd.random() < self.eps:
                a = self.rnd.randint(0, 1)
            else:
                qs = self._q(s)
                a = 0 if qs[0] >= qs[1] else 1
            if a == 1 and j.green_time(t) < MIN_GREEN:
                a = 0
            if a == 1:
                j.request(Junction.other(j.stage), t)
            self.prev[jid] = (s, a)


# ===================================================================== LLM agent
class LLMAgent(AgenticController):
    """A language-model policy: observation -> prompt -> JSON action -> shield -> signal.

    backend="mock" (default) imitates an LLM: it follows the agentic reasoning but
    with probability `hallucination` it returns an unsafe or malformed answer, the
    failure modes reported for LLM controllers (invalid actions, ignoring minimum
    green, never switching). backend="anthropic" calls a real model if the
    `anthropic` package and ANTHROPIC_API_KEY are available.
    """
    name = "llm"

    PROMPT = ("You control one traffic signal with two stages, EW and NS.\n"
              "Observation: {obs}\n"
              "Goals: minimise delay, never let anyone wait more than {cap:.0f} s, "
              "serve buses/ambulances first, avoid sending cars into a full exit.\n"
              'Reply with JSON only: {{"action": "keep" | "switch", "reason": "<one sentence>"}}')

    def __init__(self, backend: str = "mock", hallucination: float = 0.0, model: str = "claude-haiku-4-5",
                 decision_interval: int = 5, **kw):
        kw.setdefault("interval", decision_interval)
        super().__init__(**kw)
        self.backend, self.h, self.model = backend, hallucination, model
        self.rnd = random.Random(7)
        self.calls = self.bad = 0
        self._client = None
        if backend == "anthropic":
            try:
                import anthropic
                self._client = anthropic.Anthropic()
            except Exception:  # no package or key: fall back
                self.backend = "mock"

    def ask(self, obs: Dict) -> Dict:
        self.calls += 1
        prompt = self.PROMPT.format(obs=json.dumps({k: v for k, v in obs.items() if k != "t"}),
                                    cap=self.goals.max_wait_cap)
        if self.backend == "anthropic" and self._client:
            try:
                msg = self._client.messages.create(model=self.model, max_tokens=120,
                                                   messages=[{"role": "user", "content": prompt}])
                txt = msg.content[0].text
                return json.loads(txt[txt.find("{"): txt.rfind("}") + 1])
            except Exception as e:  # malformed reply counts as a bad answer
                self.bad += 1
                return {"action": "???", "reason": f"unparseable reply ({e.__class__.__name__})"}
        act, why = AgenticController.reason(self, obs)
        if self.rnd.random() < self.h:
            self.bad += 1
            return self.rnd.choice([
                {"action": "switch", "reason": "switching now to be responsive"},
                {"action": "keep", "reason": "the current stage looks busy"},
                {"action": "all_red_30s", "reason": "clear the junction"},
                {"action": "green_NE", "reason": "serve the northeast stage"},
            ])
        return {"action": act, "reason": why}

    def step(self, t):
        if int(t) % self.interval:
            return
        for jid, j in self.J.items():
            if j.phase != "green":
                continue
            obs = self.perceive(jid, t)
            ans = self.ask(obs)
            act = ans.get("action", "???")
            if not self.shield.enabled and act == "all_red_30s":
                # an unchecked command really does hold the junction all-red
                j.phase, j.target, j.since = "allred", j.stage, t + 29
                j.switches += 1
                j.set_state()
            self.act(jid, t, act, f"LLM: {ans.get('reason', '')}")
