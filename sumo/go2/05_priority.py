"""Go 2 · Lab 5 — Tools for priority: buses and an ambulance.

The agent's `priority_requests` tool sees buses and emergency vehicles up to
200 m away. Compare the agent with priority switched on and off.

    python go2/05_priority.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import Actuated, AgenticController, Goals
from agentic_atsc.plots import bars
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import corridor, out

o = out("go2", "lab5")
amb = [(float(t), "ambulance", "N2W") for t in range(600, 3600, 300)]
net, rou = corridor(seed=1, bus_headway=180, extra_veh=amb)
rows = []
for name, c in [("Actuated", Actuated()), ("Agent, no priority", AgenticController(goals=Goals(w_priority=0))), ("Agent, priority tool", AgenticController())]:
    m = run(net, rou, c, o, name.split()[0] + name[-4:], seed=1); m["name"] = name; rows.append(m)
    print(f"{name:22s} all {m['delay']:.1f}  bus {m.get('delay_bus')}  ambulance {m.get('delay_ambulance')}")
save(rows, f"{o}/summary.json")
lab = [r["name"] for r in rows]
bars(lab, [r.get("delay_bus", 0) for r in rows], "Lab 5 · bus delay", "s / bus", f"{o}/bus.png", highlight=2)
bars(lab, [r.get("delay_ambulance", 0) for r in rows], "Lab 5 · ambulance delay", "s / trip", f"{o}/ambulance.png", highlight=2)
bars(lab, [r["delay"] for r in rows], "Lab 5 · everyone else (mean delay)", "s / veh", f"{o}/all.png", highlight=2)
