# 离线球队数据检查

这是开发用的 Python 3 标准库工具。玩家使用 GitHub Pages 游戏不需要安装 Python；工具不会上传数据、修改游戏或读取存档。

在仓库根目录运行：

```bash
python3 football-legacy/tools/audit_clubs.py
python3 football-legacy/tools/audit_clubs.py --json
python3 -m unittest discover -s football-legacy/tests -p 'test_audit_clubs.py' -v
```

工具从历史测试样本 `tests/_fixtures/legacy-engine.txt` 的 `const RAW` 静态数据中读取联赛名称、国家和球队列表，检查空名称、重复联赛代码、重复球队、无效的数据结构和球队数量，并列出各联赛的球队数量。球队名称在游戏中用于查找，跨联赛重名也会报告，供人工判断。

退出码 `0` 表示结构检查通过；`1` 表示检查到数据问题；`2` 表示文件无法读取或数据语法无法解析。`--json` 会输出机器可读报告。

工具仅解析当前使用的对象、数组、双引号字符串及注释语法，**不会执行 JavaScript**。如果未来将 `RAW` 改成导入或计算表达式，工具会报错，需先更新解析方式，不会猜测数据。

**检查通过不代表球队确实参加了当前赛季。** 现实联赛名单、规则和冠军等事实仍需另行核对权威来源。
