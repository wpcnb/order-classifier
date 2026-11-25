"""Refresh the published, offline-readable 100-draw snapshot from Jiangsu Welfare Lottery."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
import fcntl
from html import unescape
import json
import os
from pathlib import Path
import re
import sys
from tempfile import NamedTemporaryFile
from urllib.request import Request, urlopen

ORIGIN = "https://www.jslottery.com"
LIST = ORIGIN + "/winning_history_a?locale=zh-CN&lottery_type_id=9"
FILE = Path(__file__).with_name("official-draws.json")
BEIJING = timezone(timedelta(hours=8))


def fetch(url):
    with urlopen(Request(url, headers={"User-Agent": "FC3D public notice reader"}), timeout=20) as res:
        return res.read().decode("utf-8")


def list_page(document):
    rows = []
    for item in re.findall(r"<li\b[^>]*>(.*?)</li>", document, re.S):
        if 'winning_detail?' not in item:
            continue
        link = re.search(r'href="(/winning_detail\?id=[0-9]+&amp;locale=zh-CN)"[^>]*>\s*中国福利彩票"福彩3D"第([0-9]{7})期开奖公告</a>', item)
        stamp = re.search(r'class="articleDate"\s*>\s*([0-9-]+)\s*</span>', item)
        if not link or not stamp:
            raise ValueError("公告索引格式异常")
        rows.append({"issue": link[2], "publishedOn": date.fromisoformat(stamp[1]).isoformat(),
                     "source": ORIGIN + unescape(link[1])})
    if not rows:
        raise ValueError("官方索引没有已发布的 3D 公告")
    return rows


def validate_order(rows, today):
    if len(rows) != 100:
        raise ValueError("历史窗口不足 100 期")
    for idx, row in enumerate(rows):
        issue = row["issue"]
        day = date.fromisoformat(row["date"])
        if not re.fullmatch(r"[0-9]{7}", issue) or int(issue[:4]) != day.year or int(issue[4:]) < 1 or day > today:
            raise ValueError(f"无效期号或开奖日期 {issue}")
        if idx:
            newer = rows[idx-1]
            if issue[:4] == newer["issue"][:4]:
                consecutive = int(newer["issue"]) == int(issue) + 1
            else:
                # These are adjacent published entries in the official paginated list.
                consecutive = int(newer["issue"][:4]) == day.year + 1 and newer["issue"].endswith("001")
            if not consecutive or newer["date"] <= row["date"]:
                raise ValueError(f"期号不连续或开奖日期倒序 {issue}")


def read_notice(document, row):
    marked = re.sub(r"</t[dh]\s*>", "|", document, flags=re.I)
    text = re.sub(r"\s+", "", unescape(re.sub(r"<[^>]+>", " ", marked)))
    title = re.search(r'中国福利彩票[“"]3D[”"]江苏省开奖公告第([0-9]{7})期', text)
    if not title or title[1] != row["issue"]:
        raise ValueError("公告期号不符 " + row["issue"])
    body = text[title.end():]
    posted = date.fromisoformat(row["publishedOn"])
    modern = re.search(r"开奖日期[:：]([0-9]+)年([0-9]+)月([0-9]+)日", body)
    if modern:
        published = date(*map(int, modern.groups()))
        result = re.search(r"开奖号码[:：]百位\|十位\|个位\|([0-9])\|([0-9])\|([0-9])\|(?=四、|中奖情况)", body)
    else:
        old = re.search(r"电脑福利彩票于([0-9]+)月([0-9]+)日开奖", body)
        published = date(int(row["issue"][:4]), int(old[1]), int(old[2])) if old else None
        result = re.search(r"中奖号码[:：]\|([0-9])\|([0-9])\|([0-9])\|江苏省中奖情况", body)
    if not published or published > posted or not result:
        raise ValueError("公告日期或三位号码无法核验 " + row["issue"])
    return {**row, "date": published.isoformat(), "number": "".join(result.groups())}


def collect(previous, load, today, full=False):
    previous_rows = previous["records"] if previous else []
    by_issue = {r["issue"]: r for r in previous_rows}
    listed = {}
    for page in range(1, 11):
        for r in list_page(load(LIST + "&page=" + str(page))):
            old = listed.setdefault(r["issue"], r)
            if old != r:
                raise ValueError("索引中出现冲突期号 " + r["issue"])
        if len(listed) >= 100:
            break
    rows = list(listed.values())[:100]
    if len(rows) != 100 or any(date.fromisoformat(r["publishedOn"]) > today for r in rows):
        raise ValueError("官方索引期数不足或包含未来公告")
    if previous_rows and rows[0]["issue"] < previous_rows[0]["issue"]:
        raise ValueError("上游返回了更早的窗口")
    def verify(r):
        old = by_issue.get(r["issue"])
        if not full and r is not rows[0] and old and all(old[k] == v for k,v in r.items()) and re.fullmatch(r"[0-9]{3}", old["number"]):
            return old
        return read_notice(load(r["source"]), r)
    with ThreadPoolExecutor(max_workers=4) as pool:
        result = list(pool.map(verify, rows))
    validate_order(result, today)
    return result


def refresh(path, load=fetch, full=False):
    # Serialize concurrent local refreshes. The existing snapshot stays readable throughout.
    lock_fd = os.open(path.parent, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        previous = json.loads(path.read_text()) if path.exists() else None
        now = datetime.now(BEIJING)
        records = collect(previous, load, now.date(), full)
        if previous and previous["records"] == records:
            return False
        payload = {"updatedAt": now.isoformat(timespec="seconds"), "records": records}
        with NamedTemporaryFile("w", dir=path.parent, delete=False, encoding="utf-8") as tmp:
            try:
                json.dump(payload, tmp, indent=2, ensure_ascii=False)
                tmp.write("\n")
                tmp.flush()
                os.fchmod(tmp.fileno(), 0o644)
                os.replace(tmp.name, path)
            finally:
                Path(tmp.name).unlink(missing_ok=True)
        return True
    finally:
        os.close(lock_fd)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--full", action="store_true", help="Recheck all 100 notice bodies")
    args = parser.parse_args()
    try:
        print("已更新官方快照" if refresh(FILE, full=args.full) else "核验通过，快照无变化")
    except (OSError, ValueError, KeyError) as exc:
        sys.exit(f"核验未完成，保留原快照：{exc}")
