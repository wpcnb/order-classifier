"""Exact enumeration, no prediction or betting interface."""
from itertools import product
from fractions import Fraction

OUTCOMES = tuple(product(range(10), repeat=3))

def payout(kind, pick, draw):
    if kind == "direct":
        return 1040 if tuple(pick) == draw else 0
    if kind == "group3":
        return 346 if len(set(pick)) == 2 and sorted(pick) == sorted(draw) else 0
    if kind == "group6":
        return 173 if len(set(pick)) == 3 and sorted(pick) == sorted(draw) else 0
    if kind == "guess1":
        return (0, 2, 12, 230)[draw.count(pick[0])]
    raise ValueError(kind)

def evaluate(kind, pick):
    if kind not in ("direct", "group3", "group6", "guess1"):
        raise ValueError(kind)
    if len(pick) != (1 if kind == "guess1" else 3) or any(type(x) is not int or not 0 <= x <= 9 for x in pick):
        raise ValueError("invalid digits")
    if kind in ("group3", "group6") and len(set(pick)) != (2 if kind == "group3" else 3):
        raise ValueError("invalid group")
    prizes = [payout(kind, pick, d) for d in OUTCOMES]
    n = len(prizes)
    return {"hit": Fraction(sum(x > 0 for x in prizes), n),
            "break_even_or_better": Fraction(sum(x >= 2 for x in prizes), n),
            "profit": Fraction(sum(x > 2 for x in prizes), n),
            "expected_return": Fraction(sum(prizes), n),
            "expected_net": Fraction(sum(prizes), n) - 2}

if __name__ == "__main__":
    for kind, pick in [("direct",(1,2,3)),("group3",(1,1,2)),("group6",(1,2,3)),("guess1",(1,))]:
        print(kind, evaluate(kind,pick))
