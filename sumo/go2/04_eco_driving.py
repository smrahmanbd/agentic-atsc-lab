"""Go 2 · Lab 4 — Eco-driving: signals talk to connected vehicles (GLOSA).

The signal agent broadcasts SPaT; connected vehicles (CAVs) choose a speed
that reaches the stop line on green. Penetration 0-100 %, with a fixed plan
(fully predictable) and with the agent committing its changes 8 s ahead.

    python go2/04_eco_driving.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import AgenticController, FixedTime
from agentic_atsc.plots import lines
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import corridor, out

o = out("go2", "lab4")
pens = [0, 0.25, 0.5, 1.0]
rows = []
for p in pens:
    net, rou = corridor(seed=1, cav_share=p)
    for name, mk in [("Fixed + GLOSA", lambda: FixedTime()), ("Agent (8 s commit) + GLOSA", lambda: AgenticController(commit_horizon=8))]:
        m = run(net, rou, mk(), o, f"{name.split()[0]}_{int(p*100)}", glosa=True, seed=1)
        m.update({"name": name, "penetration": p}); rows.append(m)
        print(f"{name:28s} CAV {p:4.0%}  CO2 {m['co2_g']:.0f} g  stops {m['stops']:.2f}  delay {m['delay']:.1f}")
save(rows, f"{o}/summary.json")
for f, lab in [("co2_g", "CO2 per vehicle (g)"), ("stops", "stops per vehicle"), ("delay", "delay (s/veh)")]:
    ser = {n: [r[f] for r in rows if r["name"] == n] for n in ("Fixed + GLOSA", "Agent (8 s commit) + GLOSA")}
    lines([int(p * 100) for p in pens], ser, f"Lab 4 · {lab} vs connected-vehicle share", lab, "connected vehicles (%)", f"{o}/{f}.png")
