"""Unit tests that run without SUMO: reasoning, shield, messages, GLOSA advice."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agentic_atsc.cav import GLOSA
from agentic_atsc.controllers import (MAX_GREEN, MIN_GREEN, AgenticController, Goals, Message,
                                      MessageBus, SafetyShield)


def obs(**kw):
    o = {"t": 100, "stage": "EW", "green_for": 20, "platoon_EW": 0}
    for s in ("EW", "NS"):
        o.update({f"queue_{s}": 0, f"wait_{s}": 0, f"arriving_{s}": 0, f"spill_{s}": 0.0, f"priority_{s}": []})
    o.update(kw)
    return o


def test_keep_when_current_busier():
    a = AgenticController()
    act, why = a.reason(obs(queue_EW=8, queue_NS=2))
    assert act == "keep" and "keep EW" in why


def test_switch_when_other_clearly_busier():
    act, why = AgenticController().reason(obs(queue_EW=1, queue_NS=9, wait_NS=30))
    assert act == "switch" and "switch to NS" in why


def test_priority_request_wins():
    act, why = AgenticController().reason(obs(queue_EW=6, queue_NS=0, priority_NS=["ambulance:a1"]))
    assert act == "switch" and "ambulance" in why


def test_platoon_holds_green():
    a = AgenticController()
    assert a.reason(obs(queue_EW=0, queue_NS=4))[0] == "switch"
    assert a.reason(obs(queue_EW=0, queue_NS=4, platoon_EW=8))[0] == "keep"


def test_spillback_penalty():
    a = AgenticController()
    assert a.score(obs(queue_NS=6, spill_NS=1.0), "NS") < a.score(obs(queue_NS=6), "NS")


class FakeJ:
    def __init__(self, g, other_count=3, wait=0):
        self.phase, self._g, self.stage, self._c, self._w = "green", g, "EW", other_count, wait

    def green_time(self, t):
        return self._g

    def count(self, s):
        return self._c

    def max_wait(self, s):
        return self._w


def test_shield_blocks_early_switch_and_unknown_actions():
    sh = SafetyShield()
    assert sh.check(FakeJ(MIN_GREEN - 2), "switch", 0, 90)[0] == "keep"
    assert sh.check(FakeJ(20), "green_NE", 0, 90)[0] == "keep"
    assert sh.check(FakeJ(MAX_GREEN + 1), "keep", 0, 90)[0] == "switch"
    assert sh.check(FakeJ(20, wait=120), "keep", 0, 90)[0] == "switch"
    assert sh.check(FakeJ(20), "switch", 0, 90) == ("switch", None)


def test_shield_off_passes_everything():
    assert SafetyShield(False).check(FakeJ(1), "switch", 0, 90) == ("switch", None)


def test_message_latency_and_loss():
    b = MessageBus(latency=5)
    b.send(Message(10, "J1", "J2", "platoon", {"eta": 30, "size": 4}))
    assert b.inbox("J2", 12) == [] and len(b.inbox("J2", 15)) == 1
    lossy = MessageBus(loss=1.0)
    lossy.send(Message(0, "J1", "J2", "platoon", {}))
    assert lossy.dropped == 1 and lossy.inbox("J2", 100) == []


def test_glosa_advice():
    g = GLOSA.__new__(GLOSA)
    g.exp_g = 25
    assert g.advise(100, 14, "EW", "EW", 20) is None          # makes it on green
    v = g.advise(200, 14, "EW", "NS", 20)                     # red now, green in 24 s
    assert v is not None and abs(v - 200 / 24) < 1e-6
    assert g.advise(100, 14, "EW", "EW", None) is None         # unknown end: no advice
