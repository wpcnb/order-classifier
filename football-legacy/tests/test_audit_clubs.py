"""Targeted tests for the offline structural club audit; no live data required."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / "tools" / "audit_clubs.py"
SPEC = importlib.util.spec_from_file_location("audit_clubs", TOOL)
assert SPEC and SPEC.loader
audit_clubs = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit_clubs)


class ClubAuditTests(unittest.TestCase):
    def test_current_game_data_is_read_without_evaluating_game(self) -> None:
        raw = audit_clubs.read_clubs((ROOT / "game.js").read_text(encoding="utf-8"))
        result = audit_clubs.audit(raw)
        self.assertTrue(result["ok"], result["errors"])
        self.assertGreater(result["league_count"], 0)
        self.assertGreater(result["unique_clubs"], 0)
        self.assertEqual(result["club_entries"], result["unique_clubs"])
        self.assertIn("不核实", result["scope"])

    def test_literal_supports_comments_escapes_and_odd_size(self) -> None:
        source = '''
const RAW = {
  // A valid simulated league may have an odd number of clubs.
  AAA: ["League", "Country", ["A", "B", "Team \\\"C\\\"",]],
  BBB: ["Another", "Country", ["[D]", "E"]],
};
'''
        raw = audit_clubs.read_clubs(source)
        self.assertEqual(raw["AAA"][2][2], 'Team "C"')
        result = audit_clubs.audit(raw)
        self.assertTrue(result["ok"], result["errors"])
        self.assertEqual([entry["club_count"] for entry in result["leagues"]], [3, 2])

    def test_duplicate_club_empty_name_and_short_league_are_errors(self) -> None:
        raw = {"AAA": ["A", "C", ["A", "A", ""]],
               "BBB": ["B", "C", ["A"]]}
        result = audit_clubs.audit(raw)
        self.assertFalse(result["ok"])
        self.assertTrue({"duplicate_club_in_league", "duplicate_club_across_leagues",
                         "empty_name", "too_few_clubs"}.issubset(
                             {item["code"] for item in result["errors"]}))

    def test_duplicate_league_keys_are_rejected_before_overwrite(self) -> None:
        source = 'const RAW={ABC:["A","C",["1","2"]],ABC:["B","C",["3","4"]]};'
        with self.assertRaisesRegex(audit_clubs.DataParseError, "联赛代码重复"):
            audit_clubs.read_clubs(source)

    def test_executable_syntax_is_never_run(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            marker = Path(directory) / "should-not-exist"
            source = 'const RAW={AAA:process.mainModule.require("fs").writeFileSync(' + json.dumps(str(marker)) + ',"bad")};'
            with self.assertRaises(audit_clubs.DataParseError):
                audit_clubs.read_clubs(source)
            self.assertFalse(marker.exists())

    def test_cli_emits_json_and_distinct_exit_codes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "fixture.js"
            cases = [
                ('const RAW={ABC:["联赛","国家",["甲","乙"]]};', 0, None),
                ('const RAW={ABC:["联赛","国家",["甲","甲"]]};', 1, "duplicate_club_in_league"),
                ('const RAW={ABC:alert(1)};', 2, "parse_error"),
            ]
            for body, exit_code, code in cases:
                with self.subTest(exit_code=exit_code):
                    source.write_text(body, encoding="utf-8")
                    proc = subprocess.run([sys.executable, str(TOOL), "--source", str(source), "--json"],
                                          capture_output=True, text=True, check=False)
                    self.assertEqual(proc.returncode, exit_code, proc.stderr)
                    report = json.loads(proc.stdout)
                    self.assertEqual(report["ok"], exit_code == 0)
                    if code:
                        self.assertIn(code, [item["code"] for item in report["errors"]])


if __name__ == "__main__":
    unittest.main()
