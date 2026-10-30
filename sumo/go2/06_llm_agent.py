"""Go 2 · Lab 6 — A language-model agent behind a safety shield.

Each decision becomes a prompt (observation + goals); the model answers in
JSON; a safety shield checks the answer before it reaches the signal.
By default a *mock* model is used, so the lab runs offline and repeatably.
With `--backend anthropic` and ANTHROPIC_API_KEY set, a real model decides.

    python go2/06_llm_agent.py [--backend anthropic] [--minutes 10]
"""
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import Actuated, LLMAgent
from agentic_atsc.plots import bars
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import out, single

ap = argparse.ArgumentParser(); ap.add_argument("--backend", default="mock"); ap.add_argument("--minutes", type=int, default=60)
a = ap.parse_args()
o = out("go2", "lab6")
end = a.minutes * 60
net, rou = single(seed=1, end=end)
rows = []
for name, c in [("Actuated", Actuated()), ("LLM agent (reliable)", LLMAgent(backend=a.backend, hallucination=0.0)),
                ("LLM agent, 20% bad answers + shield", LLMAgent(backend=a.backend, hallucination=0.2, shield=True))]:
    m = run(net, rou, c, o, name.split()[0] + str(len(rows)), end=end, seed=1); m["name"] = name
    if isinstance(c, LLMAgent):
        m.update({"llm_calls": c.calls, "bad_answers": c.bad, "blocked": len(c.shield.blocked)})
        save(c.log[:40], f"{o}/decisions_{len(rows)}.json")
        save(c.shield.blocked[:40], f"{o}/blocked_{len(rows)}.json")
    rows.append(m); print(name, {k: m.get(k) for k in ("delay", "wait_max", "llm_calls", "bad_answers", "blocked")})
save(rows, f"{o}/summary.json")
print("\nExample prompt:\n" + LLMAgent.PROMPT.format(obs='{"stage": "EW", "green_for": 14, "queue_EW": 3, "queue_NS": 7, ...}', cap=90))
bars([r["name"].replace(" + shield", "\n+ shield") for r in rows], [r["delay"] for r in rows], "Lab 6 · LLM agent with a safety shield", "s / veh", f"{o}/delay.png", highlight=2)
