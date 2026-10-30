"""
Test networks for the Agentic ATSC lab.

`build(outdir, n)` makes an east-west arterial with `n` signalised junctions
(J1..Jn, 300 m apart by default) and a north and south side street at each.
Every approach has two lanes. Signals run two stages:

    stage 0  EW  (arterial, all movements)
    stage 1  NS  (side streets, all movements)

Turning vehicles yield to opposing traffic (permitted turns), which keeps the
signal logic simple so the lab can focus on the *agent*, not phase design.
"""
from __future__ import annotations

import os
import subprocess
from typing import Dict, List

from sumolib import checkBinary

SPEED = 13.89  # 50 km/h


def _w(path: str, text: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def build(outdir: str, n: int = 1, spacing: float = 300.0, side_len: float = 250.0,
          end_len: float = 400.0) -> Dict:
    os.makedirs(outdir, exist_ok=True)
    xs = [i * spacing for i in range(n)]
    nodes = {"W": (-end_len, 0, "dead_end"), "E": (xs[-1] + end_len, 0, "dead_end")}
    for i, x in enumerate(xs, 1):
        nodes[f"J{i}"] = (x, 0, "traffic_light")
        nodes[f"N{i}"] = (x, side_len, "dead_end")
        nodes[f"S{i}"] = (x, -side_len, "dead_end")
    art = ["W"] + [f"J{i}" for i in range(1, n + 1)] + ["E"]
    edges = []
    for a, b in zip(art[:-1], art[1:]):
        edges += [(f"{a}_{b}", a, b), (f"{b}_{a}", b, a)]
    for i in range(1, n + 1):
        for s in "NS":
            edges += [(f"{s}{i}_J{i}", f"{s}{i}", f"J{i}"), (f"J{i}_{s}{i}", f"J{i}", f"{s}{i}")]
    _w(f"{outdir}/net.nod.xml", "<nodes>\n" + "\n".join(
        f'  <node id="{k}" x="{x}" y="{y}" type="{t}"/>' for k, (x, y, t) in nodes.items()) + "\n</nodes>\n")
    _w(f"{outdir}/net.edg.xml", "<edges>\n" + "\n".join(
        f'  <edge id="{e}" from="{a}" to="{b}" numLanes="2" speed="{SPEED}"/>' for e, a, b in edges) + "\n</edges>\n")
    net = f"{outdir}/net.net.xml"
    subprocess.run([checkBinary("netconvert"), "-n", f"{outdir}/net.nod.xml", "-e", f"{outdir}/net.edg.xml",
                    "-o", net, "--no-turnarounds", "true", "--tls.default-type", "static",
                    "--no-warnings", "true"], check=True, stdout=subprocess.DEVNULL)
    return {"net": net, "n": n, "xs": xs, "spacing": spacing, "junctions": [f"J{i}" for i in range(1, n + 1)],
            "outdir": outdir}


def routes(n: int) -> Dict[str, List[str]]:
    """Origin-destination edge lists, keyed by a readable name."""
    art = ["W"] + [f"J{i}" for i in range(1, n + 1)] + ["E"]
    eb = [f"{a}_{b}" for a, b in zip(art[:-1], art[1:])]
    wb = [f"{b}_{a}" for a, b in zip(art[:-1], art[1:])][::-1]
    r = {"EB": eb, "WB": wb}
    for i in range(1, n + 1):
        r[f"NB{i}"] = [f"S{i}_J{i}", f"J{i}_N{i}"]
        r[f"SB{i}"] = [f"N{i}_J{i}", f"J{i}_S{i}"]
        # side-street vehicles turning onto the arterial
        r[f"S{i}E"] = [f"S{i}_J{i}"] + eb[i:]
        r[f"N{i}W"] = [f"N{i}_J{i}"] + wb[n - i + 1:]
    return r


def write_demand(outdir: str, n: int, end: int, profile: List[tuple], seed: int = 1,
                 cav_share: float = 0.0, bus_headway: int = 0, extra: str = "", extra_veh=None) -> str:
    """Write a .rou.xml with Poisson arrivals.

    profile: list of (t_start, t_end, ew_vph_per_direction, ns_vph_per_direction)
    cav_share: fraction of cars that are connected/automated (type "cav")
    bus_headway: seconds between eastbound buses (0 = none)
    """
    import random
    rnd = random.Random(seed)
    R = routes(n)
    out = ['<routes>',
           '  <vType id="car" accel="2.6" decel="4.5" sigma="0.5" length="4.5" minGap="2.5" maxSpeed="16.7" color="0.85,0.85,0.85" emissionClass="HBEFA3/PC_G_EU4"/>',
           '  <vType id="cav" accel="2.6" decel="4.5" sigma="0.1" length="4.5" minGap="2.0" maxSpeed="16.7" color="0.2,0.6,1" emissionClass="HBEFA3/PC_G_EU4"/>',
           '  <vType id="bus" vClass="bus" accel="1.2" decel="4.0" sigma="0.3" length="12" minGap="3" maxSpeed="13.9" color="1,0.75,0" emissionClass="HBEFA3/Bus"/>',
           '  <vType id="ambulance" vClass="emergency" accel="3" decel="5" sigma="0.1" length="6" maxSpeed="19" color="1,0,0" emissionClass="HBEFA3/PC_D_EU4"/>']
    for k, edges in R.items():
        out.append(f'  <route id="r_{k}" edges="{" ".join(edges)}"/>')
    veh = []
    for k in R:
        if k in ("EB", "WB"):
            kind = "ew"
        elif k.startswith(("NB", "SB")):
            kind = "ns"
        else:
            kind = "turn"
        for (t0, t1, ew, ns) in profile:
            rate = {"ew": ew, "ns": ns * 0.8, "turn": ns * 0.2}[kind] / 3600.0
            t = t0 + rnd.expovariate(rate) if rate > 0 else t1
            while t < t1:
                vt = "cav" if rnd.random() < cav_share else "car"
                veh.append((t, vt, k))
                t += rnd.expovariate(rate)
    if bus_headway:
        t = 60
        while t < end:
            veh.append((t, "bus", "EB"))
            t += bus_headway
    veh += list(extra_veh or [])          # (depart, vType, route key), e.g. ambulances
    veh.sort()
    for i, (t, vt, k) in enumerate(veh):
        out.append(f'  <vehicle id="{vt}{i}" type="{vt}" route="r_{k}" depart="{t:.1f}" departLane="best" departSpeed="max"/>')
    out.append(extra)
    out.append('</routes>')
    tag = f"_b{bus_headway}" if bus_headway else ""
    tag += f"_x{len(extra_veh)}" if extra_veh else ""
    path = f"{outdir}/demand_s{seed}_c{int(cav_share * 100)}{tag}.rou.xml"
    _w(path, "\n".join(out))
    return path
