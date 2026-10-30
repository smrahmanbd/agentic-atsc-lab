"""Go 2 · Lab 3 — A learning agent: tabular Q-learning at one junction.

Trains keep/switch decisions from reward = -(vehicles waiting), then tests
the greedy policy on unseen arrivals against actuated and agentic control.

    python go2/03_learning_agent.py [--episodes 30]
"""
import argparse, json, os, statistics as st, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agentic_atsc.controllers import Actuated, AgenticController, QLearningAgent
from agentic_atsc.plots import bars, lines
from agentic_atsc.runner import run, save
from agentic_atsc.scenarios import out, single

ap = argparse.ArgumentParser(); ap.add_argument("--episodes", type=int, default=30); a = ap.parse_args()
o = out("go2", "lab3")
SHORT = [(0, 600, 450, 220), (600, 1500, 650, 300), (1500, 1800, 450, 220)]
Q, curve = {}, []
for ep in range(a.episodes):
    net, rou = single(seed=100 + ep, profile=SHORT, end=1800)
    eps = max(0.02, 0.3 * (1 - ep / a.episodes))
    agent = QLearningAgent(q=Q, epsilon=eps, seed=ep)
    m = run(net, rou, agent, o, "train", end=1800, seed=100 + ep)
    curve.append({"episode": ep + 1, "delay": m["delay"], "reward": round(st.mean(agent.rewards), 2), "states": len(Q)})
    print(f"episode {ep + 1:2d}  eps {eps:.2f}  delay {m['delay']:6.2f}  states {len(Q)}")
json.dump(Q, open(f"{o}/q_table.json", "w"))
save(curve, f"{o}/training.json")
net, rou = single(seed=1)
rows = []
for name, c in [("Actuated", Actuated()), ("Agentic (rules)", AgenticController()), ("Q-learning (greedy)", QLearningAgent(q=Q, learn=False))]:
    m = run(net, rou, c, o, name.split()[0], seed=1); m["name"] = name; rows.append(m)
    print(f"{name:20s} delay {m['delay']:.2f}  max wait {m['wait_max']}")
save(rows, f"{o}/summary.json")
lines([c["episode"] for c in curve], {"mean delay (s/veh)": [c["delay"] for c in curve]}, "Lab 3 · Q-learning training curve", "s / veh", "episode", f"{o}/training.png", markers=False)
bars([r["name"] for r in rows], [r["delay"] for r in rows], "Lab 3 · test on unseen arrivals (1 h)", "s / veh", f"{o}/test.png", highlight=2)
