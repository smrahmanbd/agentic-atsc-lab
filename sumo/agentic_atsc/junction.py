"""
A signalised junction as the agent sees it: two stages (EW, NS), a safe
stage-change sequence, and *perception tools* that read SUMO through TraCI.

Every controller in the lab (fixed time, actuated, max-pressure, agentic,
learning, LLM) drives junctions through this one class, so comparisons are
fair: same yellow, same all-red, same minimum green.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

import traci

YELLOW = 3
ALL_RED = 1
STAGES = ("EW", "NS")


def _is_arterial(edge: str) -> bool:
    return not (edge.startswith("N") or edge.startswith("S"))


@dataclass
class Junction:
    jid: str
    in_lanes: Dict[str, List[str]] = field(default_factory=dict)   # stage -> incoming lanes
    out_lanes: Dict[str, List[str]] = field(default_factory=dict)  # stage -> outgoing lanes
    states: Dict[str, str] = field(default_factory=dict)           # stage -> green state string
    stage: str = "EW"
    phase: str = "green"        # green | yellow | allred
    since: float = 0.0          # time the current phase started
    green_since: float = 0.0    # time the current green started
    target: Optional[str] = None
    switches: int = 0

    @classmethod
    def from_sumo(cls, jid: str) -> "Junction":
        j = cls(jid)
        links = traci.trafficlight.getControlledLinks(jid)
        logic = traci.trafficlight.getAllProgramLogics(jid)[0]
        for ph in logic.phases:
            st = ph.state
            if "y" in st or "G" not in st:
                continue
            idx = [i for i, c in enumerate(st) if c in "Gg"]
            lane = links[idx[0]][0][0]
            stage = "EW" if _is_arterial(lane.split("_")[0]) else "NS"
            j.states[stage] = st
            j.in_lanes[stage] = sorted({links[i][0][0] for i in idx})
            j.out_lanes[stage] = sorted({links[i][0][1] for i in idx})
        j.set_state()
        return j

    # ------------------------------------------------------------ actuation
    def _yellow(self) -> str:
        return "".join("y" if c in "Gg" else c for c in self.states[self.stage])

    def set_state(self) -> None:
        if self.phase == "green":
            s = self.states[self.stage]
        elif self.phase == "yellow":
            s = self._yellow()
        else:
            s = "r" * len(self.states[self.stage])
        traci.trafficlight.setRedYellowGreenState(self.jid, s)

    def request(self, stage: str, t: float) -> bool:
        """Ask to change to `stage`. Starts yellow; returns True if accepted."""
        if self.phase != "green" or stage == self.stage:
            return False
        self.target, self.phase, self.since = stage, "yellow", t
        self.switches += 1
        self.set_state()
        return True

    def tick(self, t: float) -> None:
        """Advance yellow -> all-red -> next green on schedule."""
        if self.phase == "yellow" and t - self.since >= YELLOW:
            self.phase, self.since = "allred", t
            self.set_state()
        elif self.phase == "allred" and t - self.since >= ALL_RED:
            self.stage, self.phase, self.since, self.green_since = self.target, "green", t, t
            self.target = None
            self.set_state()

    def green_time(self, t: float) -> float:
        return t - self.green_since if self.phase == "green" else 0.0

    @staticmethod
    def other(stage: str) -> str:
        return "NS" if stage == "EW" else "EW"

    # ------------------------------------------------------------ perception tools
    def queue(self, stage: str) -> int:
        """Halting vehicles on the approaches served by `stage` (loop/camera view)."""
        return sum(traci.lane.getLastStepHaltingNumber(l) for l in self.in_lanes[stage])

    def count(self, stage: str) -> int:
        return sum(traci.lane.getLastStepVehicleNumber(l) for l in self.in_lanes[stage])

    def max_wait(self, stage: str) -> float:
        """Longest waiting time among vehicles on the approaches (fairness signal)."""
        w = 0.0
        for l in self.in_lanes[stage]:
            for v in traci.lane.getLastStepVehicleIDs(l):
                w = max(w, traci.vehicle.getWaitingTime(v))
        return w

    def downstream_occupancy(self, stage: str) -> float:
        """Mean occupancy (0-1) of the exit lanes: >0.6 means spill-back risk."""
        occ = [traci.lane.getLastStepOccupancy(l) / 100.0 for l in self.out_lanes[stage]]
        return sum(occ) / max(1, len(occ))

    def pressure(self, stage: str) -> float:
        """Max-pressure: vehicles waiting to enter minus vehicles on the exit lanes."""
        out = sum(traci.lane.getLastStepVehicleNumber(l) for l in self.out_lanes[stage])
        return self.count(stage) - out * 0.5

    def approaching(self, stage: str, within: float = 40.0) -> int:
        """Moving vehicles within `within` m of the stop line (gap-out signal)."""
        n = 0
        for l in self.in_lanes[stage]:
            L = traci.lane.getLength(l)
            for v in traci.lane.getLastStepVehicleIDs(l):
                if L - traci.vehicle.getLanePosition(v) < within and traci.vehicle.getSpeed(v) > 1.0:
                    n += 1
        return n

    def priority_requests(self, stage: str, within: float = 200.0) -> List[str]:
        """Buses and emergency vehicles approaching on this stage's lanes."""
        req = []
        for l in self.in_lanes[stage]:
            L = traci.lane.getLength(l)
            for v in traci.lane.getLastStepVehicleIDs(l):
                vt = traci.vehicle.getTypeID(v)
                if vt in ("bus", "ambulance") and L - traci.vehicle.getLanePosition(v) < within:
                    req.append(f"{vt}:{v}")
        return req

    def cav_estimate(self, stage: str, penetration: float) -> float:
        """Queue estimate from connected vehicles only, scaled by penetration."""
        if penetration <= 0:
            return 0.0
        n = 0
        for l in self.in_lanes[stage]:
            for v in traci.lane.getLastStepVehicleIDs(l):
                if traci.vehicle.getTypeID(v) == "cav" and traci.vehicle.getSpeed(v) < 0.5:
                    n += 1
        return n / penetration
