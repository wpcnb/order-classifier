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