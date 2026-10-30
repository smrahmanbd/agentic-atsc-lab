"""Go 2 · Lab 1 — Your first agent: perceive -> reason -> act at one junction.

Compares a fixed plan, actuated control, max-pressure and the agentic
controller on the same arrivals, and prints the agent's first decisions
with its reasons.

    python go2/01_first_agent.py            # add --gui to watch in sumo-gui
"""
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import Actuated, AgenticController, FixedTime, MaxPressure
from agentic_atsc.plots import bars
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import out, single

ap = argparse.ArgumentParser(); ap.add_argument("--gui", action="store_true"); ap.add_argument("--seed", type=int, default=1)
a = ap.parse_args()
net, rou = single(seed=a.seed)
o = out("go2", "lab1")
rows = []
agent = AgenticController()
for c in [FixedTime(), Actuated(), MaxPressure(), agent]:
    m = run(net, rou, c, o, c.name, gui=a.gui and c is agent, seed=a.seed)
    rows.append(m); print(f"{c.name:13s} delay {m['delay']:6.2f} s  stops {m['stops']:.2f}  p95 wait {m['wait_p95']:5.1f} s  max wait {m['wait_max']:5.1f} s")
save(rows, f"{o}/summary.json")
save([d for d in agent.log if 1500 <= d["t"] <= 1700], f"{o}/decisions.json")   # a peak-hour window
print("\nFirst decisions of the agent:")
for d in [d for d in agent.log if d["t"] >= 1500][:10]:
    print(f"  t={d['t']:5.0f}  {d['action']:6s} {d['why']}")
names = ["Fixed", "Actuated", "Max-pressure", "Agentic"]
bars(names, [r["delay"] for r in rows], "Lab 1 · mean delay per vehicle (one junction, 1 h)", "s / veh", f"{o}/delay.png", highlight=3)
bars(names, [r["wait_max"] for r in rows], "Lab 1 · longest single wait at a red", "s", f"{o}/maxwait.png", highlight=3)
