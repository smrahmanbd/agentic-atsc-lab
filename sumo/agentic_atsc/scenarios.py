"""Shared scenarios so every lab uses the same networks and demand."""
from __future__ import annotations

import os

from .network import build, write_demand

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS = os.path.join(HERE, "results")

# (t0, t1, EW veh/h per direction, NS veh/h per direction): off-peak, peak, off-peak
PROFILE = [(0, 900, 450, 220), (900, 2700, 650, 300), (2700, 3600, 450, 220)]
END = 3600


def single(seed=1, cav_share=0.0, bus_headway=0, end=END, profile=PROFILE, extra="", extra_veh=None):
    net = build(os.path.join(RESULTS, "nets", "single"), n=1)
    return net, write_demand(net["outdir"], 1, end, profile, seed, cav_share, bus_headway, extra, extra_veh)


def corridor(seed=1, cav_share=0.0, bus_headway=0, end=END, profile=PROFILE, extra="", extra_veh=None):
    net = build(os.path.join(RESULTS, "nets", "corridor"), n=4)
    return net, write_demand(net["outdir"], 4, end, profile, seed, cav_share, bus_headway, extra, extra_veh)


def out(*parts):
    p = os.path.join(RESULTS, *parts)
    os.makedirs(p, exist_ok=True)
    return p
