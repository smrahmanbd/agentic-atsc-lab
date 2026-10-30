"""Go 3 · R5 — Adaptivity vs predictability for eco-driving.

GLOSA needs to know when the light will change. The agent can commit to its
next change H seconds ahead (H = 0: fully adaptive, unpredictable).
50 % connected vehicles on the corridor.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import AgenticController, FixedTime
from agentic_atsc.plots import lines
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import corridor, out

o = out("go3", "r5")
net, rou = corridor(seed=6, cav_share=0.5)
Hs = [0, 4, 8, 12, 16]
rows = []
for H in Hs:
    m = run(net, rou, AgenticController(commit_horizon=H), o, f"H{H}", glosa=True, seed=6)
    m["H"] = H; rows.append(m); print(H, m["delay"], m["co2_g"], m["stops"])
fx = run(net, rou, FixedTime(), o, "fixed", glosa=True, seed=6)
save({"agent": rows, "fixed": fx}, f"{o}/summary.json")
lines(Hs, {"CO2 per vehicle (g)": [r["co2_g"] for r in rows], "fixed plan + GLOSA": [fx["co2_g"]] * len(Hs)},
      "R5 · CO2 vs commitment horizon (50 % CAVs)", "g CO2 / veh", "agent commits changes H s ahead", f"{o}/co2.png")
lines(Hs, {"delay (s/veh)": [r["delay"] for r in rows], "fixed plan + GLOSA": [fx["delay"]] * len(Hs)},
      "R5 · delay vs commitment horizon", "s / veh", "agent commits changes H s ahead", f"{o}/delay.png")
