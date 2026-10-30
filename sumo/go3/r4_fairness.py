"""Go 3 · R4 — Efficiency vs fairness: the weight on the longest wait.

Sweeps the agent's fairness weight; reports mean delay against the 95th
percentile and the maximum wait. Max-pressure is shown for reference.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import AgenticController, Goals, MaxPressure
from agentic_atsc.plots import lines
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import out, single

o = out("go3", "r4")
heavy = [(0, 900, 550, 200), (900, 2700, 750, 260), (2700, 3600, 550, 200)]
net, rou = single(seed=5, profile=heavy)
W = [0.0, 0.15, 0.5, 1.0]
rows = []
for w in W:
    m = run(net, rou, AgenticController(goals=Goals(w_wait=w, max_wait_cap=1e9)), o, f"w{int(w*100)}", seed=5)
    m["w"] = w; rows.append(m); print(w, m["delay"], m["wait_p95"], m["wait_max"])
mp = run(net, rou, MaxPressure(), o, "mp", seed=5)
save({"agent": rows, "max_pressure": mp}, f"{o}/summary.json")
lines(W, {"mean delay": [r["delay"] for r in rows], "95th-percentile wait": [r["wait_p95"] for r in rows], "longest wait": [r["wait_max"] for r in rows]},
      "R4 · raising the fairness weight", "seconds", "weight on longest wait", f"{o}/tradeoff.png")
