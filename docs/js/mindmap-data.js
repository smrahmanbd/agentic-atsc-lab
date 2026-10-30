/* Mind map of the course: lv = Go where the idea is taught (0 = root). */
window.MINDMAP = {
 "name": "Agentic ATSC",
 "lv": "0",
 "d": "Adaptive traffic signal control run by AI agents that perceive, reason and act toward goals inside hard safety rules.",
 "children": [
  {
   "name": "Agentic AI",
   "lv": "1",
   "d": "A program that loops perceive, reason, act and remember to reach a goal with some autonomy.",
   "children": [
    {
     "name": "Perceive",
     "lv": "1",
     "d": "Read the world through tools such as detectors, cameras, messages and connected-car data."
    },
    {
     "name": "Reason",
     "lv": "1",
     "d": "Compare options against goals using rules, a learned policy or a language model."
    },
    {
     "name": "Act",
     "lv": "1",
     "d": "Change the world, here by keeping the green or switching stage."
    },
    {
     "name": "Remember & talk",
     "lv": "1",
     "d": "Keep a memory of what happened and send messages to other agents."
    },
    {
     "name": "Tools",
     "lv": "1",
     "d": "Functions the agent can call, such as queue(\"NS\") or priority_requests()."
    },
    {
     "name": "Goals as weights",
     "lv": "1",
     "d": "What good means, written as weights, e.g. 1 point per queued car and 0.15 per second of longest wait."
    },
    {
     "name": "Policy",
     "lv": "1",
     "d": "The rule that turns observations into actions: hand-written, learned or produced by an LLM."
    },
    {
     "name": "Four properties",
     "lv": "1",
     "d": "Wooldridge & Jennings (1995): autonomy, reactivity, proactiveness, social ability."
    },
    {
     "name": "Five kinds of agent",
     "lv": "1",
     "d": "Russell & Norvig: simple reflex (actuated gap-out), model-based, goal-based, utility-based (weighted score), learning (Q-learning)."
    }
   ]
  },
  {
   "name": "LLM-based agents",
   "lv": "1",
   "d": "An agent whose reasoning core is a large language model, wrapped with instructions, tools, memory, a loop and guardrails.",
   "children": [
    {
     "name": "Next-token prediction",
     "lv": "1",
     "d": "An LLM writes by predicting the next token (about 3/4 of a word) again and again."
    },
    {
     "name": "Context window",
     "lv": "1",
     "d": "Everything the model can see at once: its working memory for this task."
    },
    {
     "name": "Temperature",
     "lv": "1",
     "d": "Randomness in choosing tokens; low for control so answers repeat."
    },
    {
     "name": "Hallucination",
     "lv": "1",
     "d": "A fluent, confident but false answer; caught by fact checks and the shield."
    },
    {
     "name": "Function calling",
     "lv": "1",
     "d": "The model asks for a tool in a JSON format; code runs it and returns the result. MCP is an open standard for this."
    },
    {
     "name": "Memory & RAG",
     "lv": "1",
     "d": "Short-term = context; long-term = a searchable store fetched into the prompt (retrieval-augmented generation)."
    },
    {
     "name": "ReAct loop",
     "lv": "1",
     "d": "Thought, Action (tool call), Observation, repeated, then an answer (Yao et al., 2023)."
    },
    {
     "name": "Patterns",
     "lv": "1",
     "d": "Single call, prompt chain, router, ReAct, plan-and-execute, reflection, orchestrator-workers, human approval. Use the simplest that works."
    },
    {
     "name": "Fast vs slow",
     "lv": "1",
     "d": "LLM calls take ~0.5 to several seconds: rules or RL run the 1-2 s loop, the LLM supervises incidents and plans."
    },
    {
     "name": "Prompt injection",
     "lv": "1",
     "d": "Instructions hidden in data (messages, reports) that try to take over the model; treat data as data."
    },
    {
     "name": "LLM signal research",
     "lv": "1",
     "d": "LLMLight (decider), LA-Light (tool user + RL), iLLM-TSC (checker), CoLLMLight (cooperative), VLMLight (vision), Open-TI/TrafficGPT (analyst)."
    },
    {
     "name": "LLM guardrails",
     "lv": "1",
     "d": "Strict JSON, allowed actions only, fact check against tools, safe fallback plan, full logging."
    }
   ]
  },
  {
   "name": "ATSC principles",
   "lv": "1",
   "d": "How a signal shares road space between conflicting streams and how controllers are judged.",
   "children": [
    {
     "name": "Cycle, split, offset",
     "lv": "1",
     "d": "One round of all stages, how it is shared, and its start relative to the neighbour."
    },
    {
     "name": "Intergreen",
     "lv": "1",
     "d": "Yellow plus all-red between greens; lost time when no one is served."
    },
    {
     "name": "Fixed time",
     "lv": "1",
     "d": "A stored plan, the same every cycle: cheap and predictable but blind to today's traffic."
    },
    {
     "name": "Actuated",
     "lv": "1",
     "d": "Stop-line detectors extend the green while cars arrive and end it after a gap."
    },
    {
     "name": "SCOOT and SCATS",
     "lv": "1",
     "d": "Adaptive systems that re-optimise cycle, split and offset from measured demand."
    },
    {
     "name": "Max-pressure",
     "lv": "1",
     "d": "A decentralised rule serving the stage with the largest waiting-minus-exit count."
    },
    {
     "name": "Performance metrics",
     "lv": "1",
     "d": "Delay, stops, queue length, longest wait (fairness) and emissions."
    }
   ]
  },
  {
   "name": "Linkages",
   "lv": "1",
   "d": "How agentic control links to the wider goals of traffic engineering.",
   "children": [
    {
     "name": "Efficiency",
     "lv": "1",
     "d": "Moving the most people with the least delay by measuring instead of guessing.",
     "children": [
      {
       "name": "Pressure",
       "lv": "1",
       "d": "Cars waiting to enter minus cars already on the exit road."
      },
      {
       "name": "Spill-back",
       "lv": "1",
       "d": "Queues that back up from a full exit road into the junction upstream."
      },
      {
       "name": "Measure, not guess",
       "lv": "1",
       "d": "Use live queues, arrivals and exit occupancy rather than a stored plan."
      }
     ]
    },
    {
     "name": "Coordination",
     "lv": "1",
     "d": "Neighbouring junctions acting together rather than alone.",
     "children": [
      {
       "name": "Green wave",
       "lv": "1",
       "d": "Greens staggered by travel time so a platoon rides through on green."
      },
      {
       "name": "Platoon forecasts",
       "lv": "1",
       "d": "Messages such as 'about 8 cars will reach you in 15 s'."
      },
      {
       "name": "Central offsets",
       "lv": "1",
       "d": "The classic approach: a centre sets the offsets between junctions."
      }
     ]
    },
    {
     "name": "Eco-driving",
     "lv": "1",
     "d": "Saving fuel and emissions by avoiding stops at signals.",
     "children": [
      {
       "name": "SPaT",
       "lv": "1",
       "d": "Signal Phase and Timing messages saying which stage is green and when it changes."
      },
      {
       "name": "GLOSA",
       "lv": "1",
       "d": "Green Light Optimal Speed Advisory: speed = distance / time to green."
      },
      {
       "name": "Predictability catch",
       "lv": "1",
       "d": "An agent that keeps changing its mind cannot promise when green comes."
      }
     ]
    },
    {
     "name": "ITS",
     "lv": "1",
     "d": "The intelligent transport system chain the agent sits inside.",
     "children": [
      {
       "name": "Sensing",
       "lv": "1",
       "d": "Detectors, cameras and connected-vehicle data that feed the agent."
      },
      {
       "name": "V2X communication",
       "lv": "1",
       "d": "Data links between vehicles, infrastructure and other agents."
      },
      {
       "name": "Edge controller",
       "lv": "1",
       "d": "The safe controller in the street that actually switches the lights."
      },
      {
       "name": "Control centre",
       "lv": "1",
       "d": "People who set goals, watch the agents and can overrule them."
      }
     ]
    },
    {
     "name": "AVs & CAVs",
     "lv": "1",
     "d": "Connected and automated vehicles and what they mean for signal agents.",
     "children": [
      {
       "name": "CV, AV and CAV",
       "lv": "1",
       "d": "Connected exchanges data, automated drives itself (SAE 0-5), a CAV is both."
      },
      {
       "name": "New eyes",
       "lv": "1",
       "d": "CAVs report position and speed; queue estimate = seen / penetration."
      },
      {
       "name": "New hands",
       "lv": "1",
       "d": "CAVs can follow speed advice or platoon through on green."
      },
      {
       "name": "Mixed traffic",
       "lv": "1",
       "d": "Humans and CAVs will share roads for decades, so agents must work at any penetration."
      }
     ]
    }
   ]
  },
  {
   "name": "Safety & autonomy",
   "lv": "1",
   "d": "Hard rules outside the agent and levels of freedom an engineer can certify.",
   "children": [
    {
     "name": "Safety shield",
     "lv": "1",
     "d": "Rules checked after the agent decides and before the signal changes."
    },
    {
     "name": "Min and max green",
     "lv": "1",
     "d": "In the course code every green lasts at least 8 s and at most 60 s."
    },
    {
     "name": "Fairness cap",
     "lv": "1",
     "d": "A limit on how long anyone may wait before the other stage is served."
    },
    {
     "name": "Levels of autonomy",
     "lv": "1",
     "d": "From 0 manual, 1 advisory, 2 supervised, 3 collaborative to 4 autonomous."
    }
   ]
  },
  {
   "name": "SUMO implementation",
   "lv": "2",
   "d": "Six Python labs that drive Eclipse SUMO through TraCI.",
   "children": [
    {
     "name": "Setup",
     "lv": "2",
     "d": "pip install -r requirements.txt brings SUMO and packages; tests run without SUMO."
    },
    {
     "name": "network.py",
     "lv": "2",
     "d": "Builds a 1-junction or 4-junction corridor network with Poisson demand."
    },
    {
     "name": "junction.py",
     "lv": "2",
     "d": "One signal with EW and NS stages, yellow 3 s, all-red 1 s, and the perception tools.",
     "children": [
      {
       "name": "Junction.request",
       "lv": "2",
       "d": "The only way any controller changes a signal, so rules are equal for all."
      },
      {
       "name": "Perception tools",
       "lv": "2",
       "d": "queue, max_wait, approaching, downstream_occupancy, pressure, priority_requests, cav_estimate."
      }
     ]
    },
    {
     "name": "controllers.py",
     "lv": "2",
     "d": "FixedTime, Actuated, MaxPressure, AgenticController, QLearningAgent and LLMAgent.",
     "children": [
      {
       "name": "Goals dataclass",
       "lv": "2",
       "d": "Weights for queue, wait, arrivals, platoons, priority, spill, plus hysteresis and wait cap."
      },
      {
       "name": "SafetyShield",
       "lv": "2",
       "d": "Blocks unknown actions, early switches, overlong greens and fairness-cap breaches."
      },
      {
       "name": "MessageBus",
       "lv": "2",
       "d": "Agent-to-agent messages with optional latency and loss."
      }
     ]
    },
    {
     "name": "cav.py",
     "lv": "2",
     "d": "GLOSA eco-driving advice for connected vehicles within 300 m, from SPaT."
    },
    {
     "name": "runner.py",
     "lv": "2",
     "d": "Runs SUMO, steps the controller every second and returns delay, stops, CO2 and waits."
    },
    {
     "name": "Lab 1: first agent",
     "lv": "2",
     "d": "One junction: the perceive-reason-act loop matched actuation with the shortest longest wait.",
     "children": [
      {
       "name": "Score keep vs switch",
       "lv": "2",
       "d": "Each stage is scored from goals; switch only if better by the hysteresis."
      },
      {
       "name": "Max-pressure starves",
       "lv": "2",
       "d": "Without fairness, max-pressure left one car waiting 301 s."
      }
     ]
    },
    {
     "name": "Lab 2: corridor agents",
     "lv": "2",
     "d": "Neighbours exchange platoon forecasts on a 4-junction corridor.",
     "children": [
      {
       "name": "Platoon messages",
       "lv": "2",
       "d": "Platoons due within 12 s add w_platoon x size to the EW score."
      },
      {
       "name": "Fewer stops",
       "lv": "2",
       "d": "Talking cut stops by about 7 %, but actuation kept the lowest delay."
      }
     ]
    },
    {
     "name": "Lab 3: Q-learning",
     "lv": "2",
     "d": "A tabular learner choosing keep or switch every 5 s from reward.",
     "children": [
      {
       "name": "State and reward",
       "lv": "2",
       "d": "Stage, queue bins of 3 cars and green time; reward is minus total queue."
      },
      {
       "name": "Needs more",
       "lv": "2",
       "d": "Reached 11.7 s vs 9.6 s for rules: needs richer state and more training."
      }
     ]
    },
    {
     "name": "Lab 4: eco-driving",
     "lv": "2",
     "d": "Signals publish SPaT and connected cars glide in on green with GLOSA.",
     "children": [
      {
       "name": "Commit horizon",
       "lv": "2",
       "d": "The agent knows its change time only once it commits, e.g. 8 s ahead."
      },
      {
       "name": "Advice rule",
       "lv": "2",
       "d": "Speed = distance / (remaining + yellow + all-red), at least 5 m/s."
      }
     ]
    },
    {
     "name": "Lab 5: priority",
     "lv": "2",
     "d": "A tool lists buses and ambulances within 200 m; w_priority = 25.",
     "children": [
      {
       "name": "Bus delay cut",
       "lv": "2",
       "d": "Bus delay fell by about three-quarters, ambulances barely stopped."
      },
      {
       "name": "Tiny general cost",
       "lv": "2",
       "d": "Everyone else lost about 0.2 s."
      }
     ]
    },
    {
     "name": "Lab 6: LLM agent",
     "lv": "2",
     "d": "Observation, prompt, JSON answer, shield, signal; mock or real model.",
     "children": [
      {
       "name": "Mock hallucinations",
       "lv": "2",
       "d": "Bad answers: switch too early, never switch, invented stage, hold all-red."
      },
      {
       "name": "All caught",
       "lv": "2",
       "d": "With 20 % bad answers the shield caught all 165; delay rose to 11.6 s."
      }
     ]
    }
   ]
  },
  {
   "name": "Research landscape",
   "lv": "3",
   "d": "Waves of signal-control research, each keeping the last as a baseline.",
   "children": [
    {
     "name": "Adaptive systems",
     "lv": "3",
     "d": "From the 1980s: measure demand and re-optimise cycle, split and offset."
    },
    {
     "name": "Max-pressure theory",
     "lv": "3",
     "d": "From 2013: provable maximum throughput; now at hardware-in-the-loop."
    },
    {
     "name": "Deep RL / MARL",
     "lv": "3",
     "d": "From 2019: learned policies such as PressLight, CoLight and MPLight."
    },
    {
     "name": "LLM as tool user",
     "lv": "3",
     "d": "An LLM orchestrates simulators and controllers, e.g. TrafficGPT, Open-TI."
    },
    {
     "name": "LLM as controller",
     "lv": "3",
     "d": "The LLM reads the state and picks the phase, e.g. LLMLight, LA-Light."
    },
    {
     "name": "Hybrids",
     "lv": "3",
     "d": "Fast RL or rules for routine cases, LLM reasoning or critique for hard ones."
    },
    {
     "name": "Signals + CAVs",
     "lv": "3",
     "d": "CV data as a sensor, eco-driving, GLOSA and mixed autonomy."
    },
    {
     "name": "Fair evaluation",
     "lv": "3",
     "d": "Strong baselines, same rules, several seeds, many metrics, stress tests, ablations.",
     "children": [
      {
       "name": "Strong baselines",
       "lv": "3",
       "d": "Compare with tuned actuated control and max-pressure, not just fixed time."
      },
      {
       "name": "Stress tests",
       "lv": "3",
       "d": "Sensor faults, message latency and loss, demand shifts, bad model outputs."
      },
      {
       "name": "Ablation",
       "lv": "3",
       "d": "Turn one component off at a time to show what actually helps."
      }
     ]
    }
   ]
  },
  {
   "name": "Gaps",
   "lv": "3",
   "d": "Eleven obstacles between today's research and real deployment.",
   "children": [
    {
     "name": "Sim-to-real transfer",
     "lv": "3",
     "d": "Controllers are tested only in simulators; field failures cost real delay and risk."
    },
    {
     "name": "Safety and guardrails",
     "lv": "3",
     "d": "Minimum greens and conflict rules are not respected by learning or LLMs by default."
    },
    {
     "name": "LLM hallucination",
     "lv": "3",
     "d": "An LLM can answer with an invalid phase or a confident but wrong reason."
    },
    {
     "name": "Explainability",
     "lv": "3",
     "d": "Operators must understand why a phase was chosen before approving a controller."
    },
    {
     "name": "Faults and comms delay",
     "lv": "3",
     "d": "Detectors fail and V2X links drop packets; benchmarks assume perfection."
    },
    {
     "name": "Scalability and latency",
     "lv": "3",
     "d": "Thousands of signals deciding every few seconds make LLM reasoning costly."
    },
    {
     "name": "Fairness and equity",
     "lv": "3",
     "d": "Throughput-optimal control can starve side streets, pedestrians and transit."
    },
    {
     "name": "Mixed autonomy and V2X",
     "lv": "3",
     "d": "Benefits depend on how many vehicles are connected."
    },
    {
     "name": "Adaptivity vs predictability",
     "lv": "3",
     "d": "Eco-driving needs to know when the light changes; full adaptivity cannot promise it."
    },
    {
     "name": "Data and benchmarks",
     "lv": "3",
     "d": "Results rest on a few datasets and simulator settings, hindering comparison."
    },
    {
     "name": "Human factors & rules",
     "lv": "3",
     "d": "Compliance, operator trust and certification decide what gets deployed."
    }
   ]
  },
  {
   "name": "Future solutions",
   "lv": "3",
   "d": "A layered agentic controller rather than one big model.",
   "children": [
    {
     "name": "Fast base policy",
     "lv": "3",
     "d": "Max-pressure, actuated logic or a small RL policy deciding every few seconds."
    },
    {
     "name": "Slow reasoning agent",
     "lv": "3",
     "d": "An LLM consulted only for unusual cases or to audit the base policy."
    },
    {
     "name": "Critic and verifier",
     "lv": "3",
     "d": "A second model or rule checker reviews every proposal for bad actions."
    },
    {
     "name": "Formal safety shield",
     "lv": "3",
     "d": "Hard constraints in the signal cabinet that are never bypassed."
    },
    {
     "name": "Digital twin",
     "lv": "3",
     "d": "A calibrated simulation where new policies run in shadow mode first."
    },
    {
     "name": "V2X with commitment",
     "lv": "3",
     "d": "SPaT with commitment windows, CAV trajectories as a sensor, platoons."
    },
    {
     "name": "Operator in the loop",
     "lv": "3",
     "d": "Engineers set goals in plain language, approve autonomy and read explanations."
    }
   ]
  },
  {
   "name": "Open questions",
   "lv": "3",
   "d": "Research questions suited to MSc and PhD projects.",
   "children": [
    {
     "name": "Verified LLM supervision",
     "lv": "3",
     "d": "Can an LLM supervisor be guaranteed never to break minimum green?"
    },
    {
     "name": "Faithful explanations",
     "lv": "3",
     "d": "Do an LLM's stated reasons match what actually drove the decision?"
    },
    {
     "name": "Dominant sim-to-real gap",
     "lv": "3",
     "d": "Is the observation, action, transition or reward gap the biggest?"
    },
    {
     "name": "Combined-fault robustness",
     "lv": "3",
     "d": "Detector outages, V2X latency and noisy prompts in one stress test."
    },
    {
     "name": "When to escalate",
     "lv": "3",
     "d": "When should a cheap local policy call expensive reasoning under a budget?"
    },
    {
     "name": "Equity-aware control",
     "lv": "3",
     "d": "Compile plain-language people-centric goals safely into constraints."
    },
    {
     "name": "Low-penetration co-control",
     "lv": "3",
     "d": "Below about 25 % CAVs, can joint signal and eco-driving beat actuation?"
    },
    {
     "name": "Path to certification",
     "lv": "3",
     "d": "What evidence would a road authority need to approve such a controller?"
    }
   ]
  }
 ]
};
