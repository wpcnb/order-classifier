import unittest
from fractions import Fraction
from probability import draw_number, evaluate, OUTCOMES, payout

class ProbabilityTests(unittest.TestCase):
    def test_machine_outcomes(self):
        for result in OUTCOMES:
            digits = iter(result)
            def sample(size):
                self.assertEqual(size, 10)
                return next(digits)
            drawn = draw_number(sample)
            self.assertEqual(drawn, result)
            self.assertEqual(payout("direct", result, drawn), 1040)

    def test_space(self):
        self.assertEqual(len(set(OUTCOMES)), 1000)
    def test_baseline(self):
        for kind, pick, hits, total in [
            ("direct",(1,2,3),1,1040),
            ("group3",(1,1,2),3,1038),
            ("group6",(1,2,3),6,1038),
            ("guess1",(1,),271,1040),
        ]:
            result = evaluate(kind,pick)
            self.assertEqual(result["hit"], Fraction(hits,1000))
            self.assertEqual(result["expected_return"], Fraction(total,1000))
            self.assertLess(result["expected_net"],0)
    def test_guess1_profit(self):
        self.assertEqual(evaluate("guess1",(1,))["profit"],Fraction(28,1000))

if __name__ == "__main__":
    unittest.main()
