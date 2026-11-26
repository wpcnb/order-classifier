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

气动搅拌演示参考[福彩公开的 Topaze 设备参数](https://www.szlottery.org/fcw/fcxw/csdt/content/post_752635.html)、[三仓结构、颜色对应和顶部出球位置](https://caipiao.people.com.cn/n1/2015/1231/c373276-27999921.html)及[福彩 3D 开奖规则](https://www.swlc.net.cn/games/3d.html)。画面布局、球路和时长用于演示。公开规格不足以复原当期现场气流和每一颗球的实际运动。运行 `node --test lottery-research/test_draw.mjs` 核对网页采样。

### 2026.11.26.1 · 按期号回放

在摇奖台「历史回放」中选择期号，点「回放本期」观察公告中的三个数字依次出球。回放沿用演示动画，仅随机摇奖写入最近模拟记录。完整记录的每一行都能跳转到[江苏福彩公告原文索引](https://www.jslottery.com/winning_history_a?locale=zh-CN&lottery_type_id=9)。

在发布环境运行 `python3 lottery-research/refresh_history.py` 核对官网最近 100 期。脚本取公告正文的开奖日期和号码，另存索引刊登日期；重查最新一期，新公告逐期验正文。使用 `--full` 重新读取所有正文。快照仅在窗口完整并发生变动时原子替换。官网不可用时保留已有文件；网页读不到发布快照时尝试显示本机最后一次成功缓存，并提示数据状态。上个发布提交为 `33bad18`。

### 2026.11.26.2 · 暂停观察出球

点「开始摇奖」或「回放本期」前，可将动画速度设为半速。混球或出球时点「暂停动画」可以查看球仓及已出的数字，再点「继续动画」从同一帧接着看。三仓共用演示时间；号码在动画开始前确定。启用系统减弱动态效果时直接显示结果。上个发布提交为 `46a0b23`。

### 2026.11.26.3 · 从头播放本次出球

在混球、暂停或出球结束后，点「从头播放」可用当前速度重看本次三个球依次出球。每次随机摇奖只在首次播完时写入一条模拟记录；历史回放始终使用原先选定的期号。播放结束后也可先选「半速」再从头看。上个发布提交为 `51e01c3`。
