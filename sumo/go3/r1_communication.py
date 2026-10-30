"""Go 3 · R1 — How fragile is coordination? Message latency and loss.

Talking agents on the corridor while messages arrive late (0-10 s) or are
lost (0-60 %). Gap: most multi-agent studies assume perfect V2I/I2I links.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import AgenticController, MessageBus
from agentic_atsc.plots import lines
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import corridor, out

o = out("go3", "r1")
net, rou = corridor(seed=2)
base = run(net, rou, AgenticController(communicate=False), o, "nomsg", seed=2)
rows = [{"case": "no messages", "latency": None, "loss": None, **base}]
lat, loss = [0, 3, 6, 10], [0.0, 0.3, 0.6]
for L in lat:
    m = run(net, rou, AgenticController(bus=MessageBus(latency=L)), o, f"lat{L}", seed=2)
    rows.append({"case": f"latency {L} s", "latency": L, "loss": 0, **m}); print("latency", L, m["delay"])
for p in loss[1:]:
    m = run(net, rou, AgenticController(bus=MessageBus(loss=p, seed=3)), o, f"loss{int(p*100)}", seed=2)
    rows.append({"case": f"loss {p:.0%}", "latency": 0, "loss": p, **m}); print("loss", p, m["delay"])
save(rows, f"{o}/summary.json")
print("no messages", base["delay"])
lines(lat, {"talking agents": [r["delay"] for r in rows if r["loss"] == 0 and r["latency"] is not None][:len(lat)],
            "no messages (reference)": [base["delay"]] * len(lat)},
      "R1 · delay vs message latency", "s / veh", "message latency (s)", f"{o}/latency.png")
lines([0, 30, 60], {"talking agents": [rows[1]["delay"]] + [r["delay"] for r in rows if r["loss"]],
                    "no messages (reference)": [base["delay"]] * 3},
      "R1 · delay vs message loss", "s / veh", "messages lost (%)", f"{o}/loss.png")
