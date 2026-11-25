# 福彩3D概率研究

研究目的：用全部1000种等概率结果校验概率、回报和风险；用固定随机基准评估任何历史模型，不声称能预测随机开奖。

## 上游项目（固定 Git 子模块）

- LotteryCN: https://github.com/UlionTse/lotterycn/tree/d257be395076b6caf77e365d802e4864fb73f11f
- LottoLab: https://github.com/LeilaoMi/LottoLab/tree/2a63529ad3a3c042e62b8783bf7d0ff63aedd2ec
- LotteryAnalysisV5: https://github.com/saqinghui-huaian/lottery-analysis-smart-V5/tree/434c3cb3b199b4fa1ba4d64164fc2bd224110141
- JackpotPredict: https://github.com/chendok/jackpot-preditct/tree/e1cbda064e073f27e585c7f918232ab4b17308e5

执行 `git submodule update --init --recursive` 获取外部源码。各项目保留独立许可、作者及依赖；先审查再执行，尤其不要在含凭据环境直接运行上游代码。仅固定引用，尚未实现四套算法统一接口或完成回测。

## 本地基线

`python -m unittest discover -s lottery-research -p 'test_*.py'`

`python lottery-research/probability.py`

采用每注2元，直选1040元、组选三346元、组选六173元、猜1D按出现次数为2/12/230元的示例口径；其他规则需按最新当地官方公告核实。开奖假设为独立均匀。中奖不等于盈利。

## 模拟摇奖机

在[公开首页](https://wpcnb.github.io/order-classifier/)点「开始摇奖」，或运行 `python lottery-research/probability.py --draw` 生成一组三位号码。三个位置各自从 0–9 等概率抽取，保留前导零和重复数字。网页使用 Web Crypto，对字节 250–255 重抽以消除取模偏差。Python 返回可直接交给 `payout` 的数字元组。网页记录仅保留本页最近十次模拟。

气动搅拌演示参考[福彩公开的 Topaze 设备参数](https://www.szlottery.org/fcw/fcxw/csdt/content/post_752635.html)及[福彩 3D 开奖规则](https://www.swlc.net.cn/games/3d.html)。画面布局、球路和时长用于演示。公开规格不足以复原当期现场气流和每一颗球的实际运动。运行 `node --test lottery-research/test_draw.mjs` 核对网页采样。
