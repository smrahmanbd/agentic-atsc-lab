"""Go 3 · R3 — Detector-free control: perceiving traffic only through CAVs.

The agent sees only connected vehicles and scales their count by the
penetration rate. How low can penetration go before control degrades?
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import AgenticController
from agentic_atsc.plots import lines
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import out, single

o = out("go3", "r3")
P = [0.1, 0.25, 0.5, 1.0]
rows = []
for p in P:
    net, rou = single(seed=4, cav_share=p)
    loop = run(net, rou, AgenticController(), o, f"loop{int(p*100)}", seed=4)
    cav = run(net, rou, AgenticController(perception="cav", penetration=p), o, f"cav{int(p*100)}", seed=4)
    rows.append({"p": p, "loop": loop, "cav": cav}); print(p, loop["delay"], cav["delay"])
save(rows, f"{o}/summary.json")
lines([int(p * 100) for p in P], {"loop detectors": [r["loop"]["delay"] for r in rows], "CAV data only": [r["cav"]["delay"] for r in rows]},
      "R3 · delay when the agent sees only connected vehicles", "s / veh", "connected-vehicle penetration (%)", f"{o}/delay.png")
