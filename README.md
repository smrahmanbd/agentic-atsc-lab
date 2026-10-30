# Agentic AI for Adaptive Traffic Signal Control

A three-part course, with an interactive website and runnable SUMO code, on how AI **agents** can run adaptive traffic signals: they perceive the junction through tools, reason against goals, act through a safety shield, remember, and talk to neighbouring agents and connected vehicles.

**Website:** https://smrahmanbd.github.io/agentic-atsc-lab/

| Go | What you learn | Interactive elements | Code |
|---|---|---|---|
| **1 · Principles** (beginner) | A plain-language start; what makes AI agentic (perceive, reason, act, memory, tools, goals, messages, autonomy; the four agent properties and five kinds of agent); LLM-based agents in depth (how LLMs work, tools and function calling, memory and RAG, ReAct, design patterns, fast vs slow control, LLM traffic-signal research, extra guardrails); signal basics (cycle, split, capacity); how adaptive signals work; linkages to efficiency, coordination, eco-driving, ITS, AVs and CAVs; guardrails and autonomy levels | word flip-cards, agent ladder, "is it an agent?" sorter, next-word (temperature) demo, build-an-agent, ReAct trace stepper (ambulance, broken detector, hallucination, prompt injection), LLM speed ladder, share-the-cycle calculator, a live agent you steer by its goals, a controller race, pressure explorer, green-wave diagram, GLOSA advisor, ITS layers, CAV visibility | runs in the browser |
| **2 · Build in SUMO** (hands-on) | Six step-by-step labs: first agent, talking agents on a corridor, Q-learning, eco-driving CAVs with SPaT/GLOSA, priority tools for buses and ambulances, an LLM agent behind a safety shield | decision inspector, training curve, prompt-and-shield playground | `sumo/go2/` |
| **3 · Research** | The landscape from max-pressure to LLM traffic agents; eleven gaps with verified evidence; five experiments; layered future architectures; open research questions | gap explorer, experiment charts, reference browser (40 verified sources), research-question builder | `sumo/go3/` |

Also included: an explorable **mind map**, a **memory route** (the whole course as 23 places on one walk, with a test-yourself mode), a **question bank** of 116 questions with explanations (one set per Go plus a 50-question set on agentic AI and LLM agents), and a **lecture deck and beginner-friendly study guide for each Go**, which open inside the website.

## Lectures and study guides

| Go | Lecture | Study guide |
|---|---|---|
| 1 | [AATSC_Go1_Lecture.pptx](docs/materials/AATSC_Go1_Lecture.pptx) | [AATSC_Go1_Study_Guide.pdf](docs/materials/AATSC_Go1_Study_Guide.pdf) |
| 2 | [AATSC_Go2_Lecture.pptx](docs/materials/AATSC_Go2_Lecture.pptx) | [AATSC_Go2_Study_Guide.pdf](docs/materials/AATSC_Go2_Study_Guide.pdf) |
| 3 | [AATSC_Go3_Lecture.pptx](docs/materials/AATSC_Go3_Lecture.pptx) | [AATSC_Go3_Study_Guide.pdf](docs/materials/AATSC_Go3_Study_Guide.pdf) |

## Run the SUMO code

```bash
git clone https://github.com/smrahmanbd/agentic-atsc-lab.git
cd agentic-atsc-lab/sumo
python -m pip install -r requirements.txt     # installs SUMO itself via eclipse-sumo
python -m pytest tests -q
python go2/01_first_agent.py --gui            # watch the agent in sumo-gui
python run_all.py                             # every lab and experiment (30-60 min)
python tools/export_site.py                   # refresh the website's figures and numbers
```

See [`sumo/README.md`](sumo/README.md) for the package design.

## Honesty note

All results are from small synthetic SUMO scenarios (one junction or a four-junction corridor, one hour, Poisson demand) and are illustrative. Several are negative on purpose: on the short corridor, well-tuned actuated control still has the lowest delay; tabular Q-learning does not yet beat good rules; committing to signal changes for eco-driving costs adaptivity. The LLM agent uses a mock model by default; a real model can be plugged in.

## Website locally

```bash
cd docs && python -m http.server 8000      # http://localhost:8000
```

MIT licensed.
