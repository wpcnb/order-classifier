from datetime import date
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from refresh_history import FILE, list_page, read_notice, refresh, validate_order


class HistoryTests(unittest.TestCase):
    def test_body_date_wins_over_posting_date_and_columns_are_strict(self):
        row = {"issue": "2026270", "publishedOn": "2026-10-12"}
        notice = ('中国福利彩票“3D”江苏省开奖公告第2026270期 开奖日期：2026年10月11日 '
                  '开奖号码：<table><tr><th>百位</th><th>十位</th><th>个位</th></tr>'
                  '<tr><td>0</td><td>8</td><td>4</td></tr></table>四、中奖情况')
        self.assertEqual(read_notice(notice, row), {**row, "date": "2026-10-11", "number": "084"})
        for bad in (notice.replace("百位", "个位"), notice.replace("<td>0</td><td>8", "<td></td><td>08"),
                    notice.replace("2026270", "2026271"), notice.replace("10月11日", "10月13日")):
            with self.assertRaises(ValueError):
                read_notice(bad, row)

    def test_older_layout(self):
        body = ('中国福利彩票“3D”江苏省开奖公告第2026216期 本期“3D”电脑福利彩票于8月14日开奖。'
                '<table><tr><td>中奖号码:</td><td>9</td><td>3</td><td>5</td></tr></table>江苏省中奖情况')
        row = {"issue": "2026216", "publishedOn": "2026-08-14"}
        self.assertEqual(read_notice(body, row)["number"], "935")

    def test_published_window_and_failure_preserves_bytes(self):
        rows = json.loads(FILE.read_text())["records"]
        checked_on = date.fromisoformat(json.loads(FILE.read_text())["updatedAt"][:10])
        validate_order(rows, checked_on)
        self.assertEqual(len({r["source"] for r in rows}), 100)
        for r in rows:
            self.assertRegex(r["number"], r"^[0-9]{3}$")
        for bad in (rows[:-1], rows[:1] + rows[:99], rows[:2] + rows[3:] + rows[-1:]):
            with self.assertRaises(ValueError):
                validate_order(bad, checked_on)
        with TemporaryDirectory() as d:
            path = Path(d) / "snapshot.json"
            path.write_bytes(FILE.read_bytes())
            original = path.read_bytes()
            with self.assertRaises(ValueError):
                refresh(path, load=lambda url: "<html>暂时无法读取</html>")
            self.assertEqual(path.read_bytes(), original)
        with self.assertRaises(ValueError):
            list_page('<li><a href="/winning_detail?id=1">尚未开奖</a></li>')
