"""
Connected and automated vehicles (CAVs): eco-driving with GLOSA.

GLOSA = Green Light Optimal Speed Advisory. The signal broadcasts SPaT
(Signal Phase and Timing): which stage is green and, when known, how many
seconds until it changes. A CAV within range picks a speed that lets it
arrive on green instead of stopping at red. Fewer stops means less fuel,
less CO2 and smoother traffic.

Human-driven cars (type "car") ignore the advice; only type "cav" follows it.
"""
from __future__ import annotations

from typing import Dict, Set

import traci

from .junction import ALL_RED, YELLOW, Junction

V_MIN = 5.0
RANGE = 300.0


class GLOSA:
    def __init__(self, controller, junctions: Dict[str, Junction], expected_green: float = 25.0):
        self.c, self.J, self.exp_g = controller, junctions, expected_green
        self.lane_owner = {}
        for jid, j in junctions.items():
            for s in ("EW", "NS"):
                for l in j.in_lanes[s]:
                    self.lane_owner[l] = (jid, s)
        self.advised: Set[str] = set()
        self.advice_count = 0

    def step(self, t: float) -> None:
        active = set()
        for lane, (jid, stage) in self.lane_owner.items():
            L = traci.lane.getLength(lane)
            for v in traci.lane.getLastStepVehicleIDs(lane):
                if traci.vehicle.getTypeID(v) != "cav":
                    continue
                d = L - traci.vehicle.getLanePosition(v)
                if d > RANGE or d < 15:
                    continue
                vmax = traci.vehicle.getAllowedSpeed(v)
                green, rem = self.c.spat(jid, t)
                target = self.advise(d, vmax, stage, green, rem)
                if target is None:
                    continue
                active.add(v)
                traci.vehicle.slowDown(v, target, 2.0)
                self.advice_count += 1
        for v in self.advised - active:
            try:
                traci.vehicle.setSpeed(v, -1)
            except traci.TraCIException:
                pass
        self.advised = active

    def advise(self, d, vmax, stage, green, rem):
        """Return an advisory speed (m/s), or None to drive normally."""
        t_free = d / vmax
        if green == stage:
            if rem is None or t_free <= rem - 1:
                return None                       # will make it, or end unknown
            t_next = rem + 2 * (YELLOW + ALL_RED) + self.exp_g   # wait out the other stage
        elif green is not None:                   # the other stage is green
            if rem is None:
                return None                       # cannot predict: no advice
            t_next = rem + YELLOW + ALL_RED
        else:
            return None                           # mid-change: no advice
        if t_free >= t_next:
            return None
        return max(V_MIN, min(vmax, d / t_next))
