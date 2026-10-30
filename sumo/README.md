# `agentic_atsc`: signal agents for Eclipse SUMO

```
agentic_atsc/
  network.py      networks (1 junction or an n-junction corridor) and Poisson demand with CAVs, buses, ambulances
  junction.py     one signal: stages EW/NS, yellow 3 s, all-red 1 s; perception tools
  controllers.py  FixedTime, Actuated, MaxPressure, AgenticController, QLearningAgent, LLMAgent,
                  Goals, MessageBus (latency, loss), SafetyShield
  cav.py          GLOSA speed advice for connected vehicles from SPaT
  runner.py       run(net, routes, controller, ...) -> delay, stops, CO2, fuel, waits per vehicle type
  scenarios.py    the shared scenarios used by every lab
  plots.py        figures
go2/   01_first_agent  02_multi_agent  03_learning_agent  04_eco_driving  05_priority  06_llm_agent
go3/   r1_communication  r2_hallucination_shield  r3_cav_perception  r4_fairness  r5_predictability
tests/ unit tests (no SUMO needed)
tools/export_site.py   copies figures and summaries into ../docs
```

## The agent loop

```python
class AgenticController(Controller):
    def step(self, t):
        for jid in self.J: self.communicate(jid, t)        # platoon forecasts to neighbours
        for jid, j in self.J.items():
            obs = self.perceive(jid, t)                    # tools: queue, max_wait, approaching, spill, priority, messages
            action, why = self.reason(obs)                 # goals as weights -> keep/switch + reason
            self.act(jid, t, action, why)                  # SafetyShield.check, then Junction.request
```

Every controller changes signals only through `Junction.request(stage)`, so yellow, all-red and minimum green are identical for all of them.

## Plugging in your own idea

* a new **tool**: add a method to `Junction` and read it in `perceive()`;
* a new **goal**: add a weight to `Goals` and use it in `score()`;
* a new **policy**: subclass `Controller` (see `QLearningAgent`) or override `reason()`;
* a real **LLM**: `LLMAgent(backend="anthropic")` with `ANTHROPIC_API_KEY` set; any other model can be wired into `LLMAgent.ask()`.

Parameter values (weights, horizons, demand) are illustrative teaching values.
