"""Run one simulation and return the metrics every lab reports."""
from __future__ import annotations

import json
import os
import statistics as st
import xml.etree.ElementTree as ET
from typing import Callable, Dict, Optional

import traci
from sumolib import checkBinary

from .cav import GLOSA
from .controllers import Controller
from .junction import Junction


def run(net: Dict, routes: str, controller: Controller, out: str, label: str, end: int = 3600,
        gui: bool = False, glosa: bool = False, seed: int = 1, on_step: Optional[Callable] = None,
        port: Optional[int] = None) -> Dict:
    os.makedirs(out, exist_ok=True)
    trip = os.path.join(out, f"tripinfo_{label}.xml")
    cmd = [checkBinary("sumo-gui" if gui else "sumo"), "-n", net["net"], "-r", routes,
           "--tripinfo-output", trip, "--device.emissions.probability", "1",
           "--seed", str(seed), "--no-step-log", "true", "--no-warnings", "true",
           "--time-to-teleport", "300", "--end", str(end + 1200)]
    traci.start(cmd, port=port, label=label)
    try:
        J = {jid: Junction.from_sumo(jid) for jid in net["junctions"]}
        controller.setup(J, {"xs": net["xs"], "spacing": net["spacing"]})
        g = GLOSA(controller, J) if glosa else None
        t = 0.0
        while True:
            traci.simulationStep()
            t = traci.simulation.getTime()
            for j in J.values():
                j.tick(t)
            controller.step(t)
            if g:
                g.step(t)
            if on_step:
                on_step(t, J, controller)
            if t >= end and traci.simulation.getMinExpectedNumber() == 0:
                break
            if t >= end + 1200:
                break
        switches = sum(j.switches for j in J.values())
    finally:
        traci.close()
    m = metrics(trip)
    m.update({"label": label, "controller": controller.name, "switches": switches})
    if g:
        m["glosa_advice"] = g.advice_count
    return m


def metrics(trip: str) -> Dict:
    rows = []
    for e in ET.parse(trip).getroot().iter("tripinfo"):
        em = e.find("emissions")
        rows.append({"type": e.get("vType"), "loss": float(e.get("timeLoss")),
                     "wait": float(e.get("waitingTime")), "stops": int(e.get("waitingCount")),
                     "co2": float(em.get("CO2_abs")) / 1000.0 if em is not None else 0.0,
                     "fuel": float(em.get("fuel_abs")) / 1000.0 if em is not None else 0.0,
                     "route": e.get("departLane", "")[:2]})
    if not rows:
        return {"vehicles": 0}
    waits = sorted(r["wait"] for r in rows)
    out = {"vehicles": len(rows),
           "delay": round(st.mean(r["loss"] for r in rows), 2),
           "stops": round(st.mean(r["stops"] for r in rows), 3),
           "co2_g": round(st.mean(r["co2"] for r in rows), 1),
           "fuel_g": round(st.mean(r["fuel"] for r in rows), 1),
           "wait_p95": round(waits[int(0.95 * (len(waits) - 1))], 1),
           "wait_max": round(waits[-1], 1)}
    for vt in ("cav", "car", "bus", "ambulance"):
        sub = [r for r in rows if r["type"] == vt]
        if sub:
            out[f"delay_{vt}"] = round(st.mean(r["loss"] for r in sub), 2)
            out[f"stops_{vt}"] = round(st.mean(r["stops"] for r in sub), 3)
            out[f"co2_{vt}"] = round(st.mean(r["co2"] for r in sub), 1)
    return out


def save(rows, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(rows, f, indent=1)
