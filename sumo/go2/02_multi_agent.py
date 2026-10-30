"""Go 2 · Lab 2 — Many agents: coordination along a four-junction corridor.

Independent agents vs agents that message their downstream neighbour about
platoons on the way, against a fixed green wave, actuation and max-pressure.
Three random seeds; the mean is reported.

    python go2/02_multi_agent.py [--seeds 3]
"""
import argparse, os, statistics as st, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import Actuated, AgenticController, FixedTime, MaxPressure
from agentic_atsc.plots import bars
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import corridor, out

ap = argparse.ArgumentParser(); ap.add_argument("--seeds", type=int, default=3); a = ap.parse_args()
o = out("go2", "lab2")
make = {"Fixed green wave": lambda: FixedTime(), "Actuated": lambda: Actuated(), "Max-pressure": lambda: MaxPressure(),
        "Agents, no talk": lambda: AgenticController(communicate=False), "Agents, talking": lambda: AgenticController(communicate=True)}
res = {k: [] for k in make}
for s in range(1, a.seeds + 1):
    net, rou = corridor(seed=s)
    for k, f in make.items():
        m = run(net, rou, f(), o, f"{k.replace(' ', '_').replace(',', '')}_s{s}", seed=s)
        res[k].append(m); print(s, k, m["delay"], m["stops"])
summary = {k: {f: round(st.mean(m[f] for m in v), 2) for f in ("delay", "stops", "co2_g", "wait_p95", "wait_max")} for k, v in res.items()}
save(summary, f"{o}/summary.json")
for k, v in summary.items():
    print(f"{k:18s} delay {v['delay']:6.2f}  stops {v['stops']:.2f}  CO2 {v['co2_g']:.0f} g")
bars(list(summary), [v["delay"] for v in summary.values()], "Lab 2 · corridor mean delay (4 junctions, mean of seeds)", "s / veh", f"{o}/delay.png", highlight=4)
bars(list(summary), [v["stops"] for v in summary.values()], "Lab 2 · stops per vehicle", "stops / veh", f"{o}/stops.png", highlight=4, fmt="{:.2f}")
