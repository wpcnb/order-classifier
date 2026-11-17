#!/usr/bin/env python3
"""Audit the game's static club data without running the game or editing saves.

Only the literal syntax currently used by ``const RAW`` is accepted. New JS
expressions, imports or executable code fail closed instead of being executed.
This is a developer tool; players do not need Python or Node to use the game.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys
from typing import Any

DEFAULT_SOURCE = Path(__file__).resolve().parents[1] / "game.js"
_RAW = re.compile(r"(?m)^\s*const\s+RAW\s*=\s*")
_IDENTIFIER = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")


class DataParseError(ValueError):
    """The league literal does not use the supported safe data syntax."""


class LiteralReader:
    """Read objects, arrays and double-quoted JSON strings; never execute JS."""

    def __init__(self, text: str, pos: int):
        self.text = text
        self.pos = pos
        self.decoder = json.JSONDecoder()

    def fail(self, message: str) -> None:
        line = self.text.count("\n", 0, self.pos) + 1
        raise DataParseError(f"第 {line} 行：{message}")

    def space(self) -> None:
        while self.pos < len(self.text):
            if self.text[self.pos].isspace():
                self.pos += 1
            elif self.text.startswith("//", self.pos):
                end = self.text.find("\n", self.pos + 2)
                self.pos = len(self.text) if end < 0 else end + 1
            elif self.text.startswith("/*", self.pos):
                end = self.text.find("*/", self.pos + 2)
                if end < 0:
                    self.fail("注释未闭合")
                self.pos = end + 2
            else:
                return

    def consume(self, char: str) -> None:
        self.space()
        if not self.text.startswith(char, self.pos):
            self.fail(f"预期 {char!r}")
        self.pos += len(char)

    def string(self) -> str:
        self.space()
        if self.pos >= len(self.text) or self.text[self.pos] != '"':
            self.fail("球队和联赛名称必须使用双引号字符串")
        try:
            value, end = self.decoder.raw_decode(self.text, self.pos)
        except json.JSONDecodeError as error:
            raise DataParseError(f"字符串语法错误：{error}") from error
        if not isinstance(value, str):
            self.fail("预期字符串")
        self.pos = end
        return value

    def value(self) -> Any:
        self.space()
        if self.pos >= len(self.text):
            self.fail("数据未闭合")
        token = self.text[self.pos]
        if token == '"':
            return self.string()
        if token == "[":
            return self.array()
        if token == "{":
            return self.object()
        self.fail("不支持表达式或非字面量，请更新审计工具后重试")

    def array(self) -> list[Any]:
        self.consume("[")
        items: list[Any] = []
        while True:
            self.space()
            if self.text.startswith("]", self.pos):
                self.pos += 1
                return items
            if items:
                self.consume(",")
                self.space()
                if self.text.startswith("]", self.pos):
                    self.pos += 1
                    return items
            items.append(self.value())

    def object(self) -> dict[str, Any]:
        self.consume("{")
        values: dict[str, Any] = {}
        while True:
            self.space()
            if self.text.startswith("}", self.pos):
                self.pos += 1
                return values
            if values:
                self.consume(",")
                self.space()
                if self.text.startswith("}", self.pos):
                    self.pos += 1
                    return values
            if self.text.startswith('"', self.pos):
                key = self.string()
            else:
                match = _IDENTIFIER.match(self.text, self.pos)
                if not match:
                    self.fail("联赛代码不是有效标识符")
                key = match.group()
                self.pos = match.end()
            if key in values:
                self.fail(f"联赛代码重复：{key}")
            self.consume(":")
            values[key] = self.value()


def read_clubs(source: str) -> dict[str, Any]:
    matches = list(_RAW.finditer(source))
    if len(matches) != 1:
        raise DataParseError("应恰好找到一份 const RAW 联赛数据")
    reader = LiteralReader(source, matches[0].end())
    result = reader.object()
    reader.consume(";")
    return result


def audit(raw: dict[str, Any]) -> dict[str, Any]:
    errors: list[dict[str, str]] = []
    leagues: list[dict[str, Any]] = []
    seen: dict[str, str] = {}
    count = 0

    def issue(code: str, league: str, message: str) -> None:
        errors.append({"code": code, "league": league, "message": message})

    def text(value: Any, label: str, league: str) -> str | None:
        if not isinstance(value, str) or not value.strip():
            issue("empty_name", league, f"{label}为空或不是字符串")
            return None
        if value != value.strip():
            issue("surrounding_whitespace", league, f"{label}含首尾空格：{value!r}")
        return value

    if not raw:
        issue("empty_database", "", "没有找到联赛")
    for league_id, entry in raw.items():
        if not isinstance(entry, list) or len(entry) != 3:
            issue("invalid_league", league_id, "联赛需包含名称、国家和球队列表")
            continue
        name = text(entry[0], "联赛名称", league_id)
        country = text(entry[1], "国家", league_id)
        clubs = entry[2]
        if not isinstance(clubs, list):
            issue("invalid_clubs", league_id, "球队列表不是数组")
            continue
        if len(clubs) < 2:
            issue("too_few_clubs", league_id, "联赛至少需要两支球队")
        local: set[str] = set()
        for index, value in enumerate(clubs, start=1):
            club = text(value, f"第 {index} 支球队", league_id)
            if club is None:
                continue
            count += 1
            if club in local:
                issue("duplicate_club_in_league", league_id, f"联赛内球队重复：{club}")
            elif club in seen:
                issue("duplicate_club_across_leagues", league_id, f"球队 {club} 已在 {seen[club]}；游戏按名称查找可能混淆")
            local.add(club)
            seen.setdefault(club, league_id)
        leagues.append({"id": league_id, "name": name, "country": country, "club_count": len(clubs)})
    return {"ok": not errors, "league_count": len(raw), "club_entries": count,
            "unique_clubs": len(seen), "leagues": leagues, "errors": errors,
            "scope": "只检查游戏数据结构与重复项，不核实现实赛季参赛名单。"}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="离线检查足球游戏联赛和球队数据结构")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="game.js 文件路径")
    parser.add_argument("--json", action="store_true", help="以 JSON 输出，适合自动检查")
    args = parser.parse_args(argv)
    try:
        result = audit(read_clubs(args.source.read_text(encoding="utf-8")))
    except (OSError, UnicodeError, DataParseError) as error:
        result = {"ok": False, "errors": [{"code": "parse_error", "message": str(error)}],
                  "scope": "未完成数据审计；不核实现实赛季参赛名单。"}
        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(f"读取失败：{error}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"联赛 {result['league_count']} 个，球队条目 {result['club_entries']} 个，唯一球队 {result['unique_clubs']} 支。")
        for league in result["leagues"]:
            print(f"  {league['id']}: {league['name']}（{league['country']}）{league['club_count']} 支")
        for error in result["errors"]:
            print(f"  错误 [{error['league']}]: {error['message']}", file=sys.stderr)
        print(result["scope"])
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
