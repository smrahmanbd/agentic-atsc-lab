"""Go 3 · R2 — LLM hallucination and the value of a safety shield.

A mock LLM controller gives a bad answer with probability h. With the shield,
bad answers are caught and replaced; without it, they reach the signal.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import LLMAgent
from agentic_atsc.plots import lines
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import out, single

o = out("go3", "r2")
net, rou = single(seed=3)
H = [0.0, 0.1, 0.2, 0.4]
rows = []
for sh in (True, False):
    for h in H:
        c = LLMAgent(hallucination=h, shield=sh)
        m = run(net, rou, c, o, f"h{int(h*100)}_{'on' if sh else 'off'}", seed=3)
        m.update({"h": h, "shield": sh, "bad": c.bad, "blocked": len(c.shield.blocked), "violations": len(c.shield.violations)}); rows.append(m)
        print("shield" if sh else "no shield", h, m["delay"], m["wait_max"], c.bad, len(c.shield.blocked), len(c.shield.violations))
save(rows, f"{o}/summary.json")
for f, lab in [("delay", "mean delay (s/veh)"), ("wait_max", "longest wait (s)"), ("violations", "unsafe commands reaching the signal")]:
    lines([int(h * 100) for h in H], {"with shield": [r[f] for r in rows if r["shield"]], "no shield": [r[f] for r in rows if not r["shield"]]},
          f"R2 · {lab} vs bad-answer rate", lab, "bad LLM answers (%)", f"{o}/{f}.png")
