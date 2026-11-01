# 绿茵传奇：冠军之路 (v2.0)

一个**中文、单文件、移动端优先、无需后端**的原创足球球员生涯模拟游戏。

## 游戏特性

- 从 2026 年 16 岁青年球员起步，最高模拟至约 40 岁退役
- 自定义姓名、国籍、位置及游戏难度
- 五级生涯阶梯：青年联赛、中超、欧洲成长联赛、欧洲精英联赛、世界顶级联赛
- 每赛季压缩为 14 场比赛，支持逐场互动或快速模拟 3 场
- 位置区别：前锋、边锋、中场、后卫、门将的成长权重、进攻产出和关键时刻选择均不同
- 六项球员属性、体能、士气、状态、教练信任、名气、伤病风险
- 每轮一次专项训练或恢复训练；多类互动随机剧情
- 赛季积分、联赛冠军、杯赛、金靴、赛季最佳、金球奖、国家队征召（均为虚构模型）
- 转会报价、续约、薪资、合同和球员身价
- 职业生涯履历、重大事件日志、退役传奇指数
- localStorage 自动存档、JSON 手动导出与导入
- 不调用外部 API，没有依赖、广告、第三方脚本或账号系统

## 游玩

1. 下载或打开仓库根目录的 `index.html`。
2. 在手机或电脑浏览器中直接打开。
3. 建立球员，进入生涯概览并进行赛前训练、比赛与赛季结算。
4. 推荐在“存档”页定期导出 JSON，避免浏览器清缓存导致记录丢失。

也可通过任意静态文件服务器运行，无需打包和编译。

## GitHub Pages 发布

本仓库的 GitHub Pages 需要仓库管理员**首次手动启用**：

`Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → /(root) → Save`

随后（若 GitHub Pages 已部署成功）通常可访问：
https://wpcnb.github.io/order-classifier/

仓库已有旧版备份分支：`backup-order-classifier-2026-11-01`。

## 开源机制研究参考

以下项目仅作为机制设计参考，本项目为独立实现，**未直接复制其源代码、美术素材或球员数据**：

- https://github.com/RandomProjects1234/career-legend — MIT
- https://github.com/LiangLeoFC/football-career-cn — MIT
- https://github.com/ecrou-exact/Global-Soccer-Manager — Apache-2.0
- https://github.com/ShawnZhang0318/Soccer_The_Road_of_the_King

## 关于真实性

这是虚构游戏系统，而非真实比赛预测工具。真实球队名称仅用于识别模拟中的俱乐部。所有虚拟能力、模拟赛事、球员薪资、转会报价和奖项不代表真实数据；游戏与球队、联赛、虎扑均无关联。