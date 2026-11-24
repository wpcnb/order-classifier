/* Season snapshots for the playable eleven-player world. Sources are shown in both game entries. */
(function(root){
  "use strict";
  // Each senior pool contains independent first teams from the indicated division.
  const senior={
    中超:"上海海港 上海申花 成都蓉城 北京国安 山东泰山 天津津门虎 浙江职业 云南玉昆 青岛西海岸 河南 大连英博 深圳新鹏城 武汉三镇 青岛海牛 辽宁铁人 重庆铜梁龙",
    中甲:"广东广州豹 延边龙鼎 石家庄功夫 定南赣联 南通支云 大连鲲城 陕西联合 南京城市 佛山南狮 深圳青年人 广西恒宸 无锡吴钩 苏州东吴 宁波职业 梅州客家 长春亚泰",
    中乙:"厦门飞鹭 湖北青年星 杭州临平吴越 江西庐山 温州 贵州贵阳竞技 赣州瑞狮 广州蒲公英 广东铭途 深圳二零二八 青岛红狮 长春喜都 北京理工 大连可为 泰安天贶 上海赛更达",
    英超:"阿森纳 曼城 曼联 阿斯顿维拉 利物浦 伯恩茅斯 桑德兰 布莱顿 布伦特福德 切尔西 富勒姆 纽卡斯尔联 埃弗顿 利兹联 水晶宫 诺丁汉森林 托特纳姆热刺 西汉姆联 伯恩利 狼队",
    英冠:"考文垂 伊普斯维奇 米尔沃尔 南安普顿 米德尔斯堡 赫尔城 雷克瑟姆 德比郡 诺维奇 伯明翰城 斯旺西 布里斯托尔城 谢菲尔德联 普雷斯顿 女王公园巡游者 沃特福德",
    英甲:"林肯城 卡迪夫城 斯托克港 布拉德福德城 博尔顿 斯蒂夫尼奇 卢顿 普利茅斯 哈德斯菲尔德 曼斯菲尔德 韦康比流浪者 雷丁 布莱克浦 唐卡斯特 巴恩斯利 维冈竞技",
    西甲:"巴塞罗那 皇家马德里 比利亚雷亚尔 马德里竞技 皇家贝蒂斯 塞尔塔 赫塔费 巴列卡诺 瓦伦西亚 皇家社会 西班牙人 毕尔巴鄂竞技 塞维利亚 阿拉维斯 埃尔切 莱万特 奥萨苏纳 马略卡 赫罗纳 皇家奥维耶多",
    西乙:"桑坦德竞技 拉科鲁尼亚 阿尔梅里亚 马拉加 拉斯帕尔马斯 卡斯特利翁 布尔戈斯 埃瓦尔 科尔多瓦 希洪竞技 休达 阿尔巴塞特 安道尔FC 格拉纳达 莱加内斯 巴拉多利德",
    西班牙第三级:"特内里费 萨莫拉 蓬费拉迪纳 庞特韦德拉 巴拉卡尔多 卢戈 梅里达竞技 费罗尔竞技 埃登斯 萨瓦德尔 卡塔赫纳 阿尔赫西拉斯 皇家穆尔西亚 阿尔科孔 伊维萨 马贝拉",
    法甲:"巴黎圣日耳曼 朗斯 里尔 里昂 马赛 雷恩 摩纳哥 斯特拉斯堡 图卢兹 洛里昂 巴黎FC 布雷斯特 昂热 勒阿弗尔 欧塞尔 尼斯 南特 梅斯",
    法乙:"特鲁瓦 勒芒 圣埃蒂安 巴黎红星 罗德兹 兰斯 昂纳西 蒙彼利埃 波城 敦刻尔克 甘冈 格勒诺布尔 克莱蒙 南锡 巴斯蒂亚 亚眠",
    法国第三级:"第戎 索肖 鲁昂 弗勒里91 凡尔赛 奥尔良 勒皮 卡昂 孔卡诺 瓦朗谢讷 欧巴涅 维尔弗朗什 奎维利鲁昂 巴黎十三区竞技 沙托鲁 圣布里厄",
    葡超:"波尔图 葡萄牙体育 本菲卡 布拉加 法马利康 吉尔维森特 莫雷拉人 阿罗卡 吉马良斯 埃斯托里尔 阿尔韦卡 里奥阿维 圣克拉拉 马德拉国民 阿马多拉之星 卡萨皮亚 通德拉 AVS",
    葡甲:"马里迪莫 维塞乌学院 托伦斯 维泽拉 莱里亚 雷克索斯 费伦斯 沙维斯 费尔盖拉什 卢罗萨 佩纳菲耶尔 波尔蒂芒人 法鲁人 费雷拉 奥利韦拉人",
    葡萄牙第三级:"阿马兰特 泰罗芬斯 瓦尔津 帕雷德斯 法费 马尔科09 圣若昂德韦尔 桑若安嫩塞 贝伦人 马夫拉 科英布拉大学 圣塔伦 葡萄牙竞技 阿莫拉 卡尔达斯 科维良",
    德甲:"拜仁慕尼黑 多特蒙德 RB莱比锡 斯图加特 霍芬海姆 勒沃库森 弗赖堡 法兰克福 奥格斯堡 美因茨 柏林联合 门兴格拉德巴赫 汉堡 科隆 云达不来梅 沃尔夫斯堡 海登海姆 圣保利",
    德乙:"沙尔克04 埃尔弗斯贝格 帕德博恩 汉诺威96 达姆施塔特 凯泽斯劳滕 柏林赫塔 纽伦堡 波鸿 卡尔斯鲁厄 德累斯顿迪纳摩 荷尔斯泰因基尔 比勒费尔德 马格德堡 不伦瑞克 菲尔特",
    德丙:"奥斯纳布吕克 科特布斯 红白埃森 杜伊斯堡 罗斯托克 费尔 亚琛 慕尼黑1860 韦恩威斯巴登 曼海姆 科隆胜利 因戈尔施塔特 雷根斯堡 萨尔布吕肯 哈费尔泽 奥厄",
    意甲:"国际米兰 那不勒斯 罗马 科莫 AC米兰 尤文图斯 亚特兰大 博洛尼亚 拉齐奥 乌迪内斯 萨索洛 都灵 帕尔马 卡利亚里 佛罗伦萨 热那亚 莱切 克雷莫纳 维罗纳 比萨",
    荷甲:"PSV埃因霍温 费耶诺德 奈梅亨 特温特 阿贾克斯 乌得勒支 阿尔克马尔 海伦芬 格罗宁根 鹿特丹斯巴达 锡塔德幸运 前进之鹰 鹿特丹精英 特尔斯达 兹沃勒 福伦丹 布雷达 赫拉克勒斯",
    比甲:"圣吉罗斯联合 布鲁日 圣图尔登 根特 梅赫伦 安德莱赫特 亨克 标准列日 韦斯特洛 安特卫普 沙勒罗瓦 旧海弗莱鲁汶 聚尔特瓦雷赫姆 色格拉布鲁日 拉卢维耶 登德尔",
    土超:"加拉塔萨雷 费内巴切 特拉布宗体育 贝西克塔斯 巴萨克赛尔 哥兹塔比 萨姆松体育 里泽体育 科尼亚体育 科贾埃利体育 阿兰亚体育 加济安泰普 卡斯帕萨 根克勒比利吉 埃于普体育 安塔利亚体育 开塞利体育 卡拉古鲁克",
    苏超:"凯尔特人 哈茨 流浪者 马瑟韦尔 希伯尼安 福尔柯克 邓迪联 阿伯丁 邓迪 圣米伦 基尔马诺克 利文斯顿",
    瑞士超:"图恩 圣加仑 卢加诺 巴塞尔 锡永 年轻人 卢塞恩 塞尔维特 洛桑体育 苏黎世 草蜢 温特图尔",
    奥甲:"格拉茨风暴 萨尔茨堡红牛 林茨LASK 奥地利维也纳 维也纳快速 哈特贝格 WSG蒂罗尔 阿尔塔赫 里德 沃尔夫斯贝格 格拉茨AK 林茨蓝白",
    丹超:"奥胡斯AGF 中日德兰 桑德捷斯基 布隆德比 维堡 北西兰 哥本哈根 欧登塞 兰讷斯 弗雷德里西亚 锡尔克堡 瓦埃勒",
    希腊超:"雅典AEK 奥林匹亚科斯 塞萨洛尼基PAOK 帕纳辛奈科斯 莱瓦贾科斯 OFI克里特 沃洛斯 阿里斯 阿特罗米托斯 基菲萨 帕纳托利克斯 拉里萨 潘塞莱科斯 特里波利斯星",
    波兰超:"波兹南莱赫 扎布热矿工 雅盖隆 拉库夫 卡托维兹 华沙莱吉亚 卢宾扎格勒比 普沃茨克维斯瓦 什切青波贡 拉多米亚克 凯尔采科罗纳 卢布林莫托 克拉科维亚 维泽夫罗兹 皮亚斯特 格但斯克莱吉亚 格丁尼亚阿尔卡 涅切查",
    捷甲:"布拉格斯拉维亚 布拉格斯巴达 比尔森胜利 亚布洛内茨 赫拉德茨克拉洛韦 利贝雷茨 奥洛穆茨 帕尔杜比采 卡尔维纳 波希米亚人1905 博莱斯拉夫 兹林 特普利采 布拉格杜克拉 斯洛瓦茨科 俄斯特拉发矿工",
    罗甲:"克拉约瓦大学 布加勒斯特快速 克卢日大学 克卢日CFR 布加勒斯特迪纳摩 阿尔杰什 FCSB 阿拉德联队 博托沙尼 加拉茨钢铁 康斯坦察灯塔 佩特罗鲁尔 米耶尔库雷亚丘克 斯洛博齐亚 赫曼施塔特 布加勒斯特梅塔洛格洛布斯",
    塞尔超:"贝尔格莱德红星 伏伊伏丁那 贝尔格莱德游击队 潘切沃铁路工人 诺维帕扎尔 OFK贝尔格莱德 丘卡里奇 苏尔杜利察工人 IMT贝尔格莱德 克拉古耶瓦茨工人1923 伊万尼察亚沃尔 托波拉TSC 尼什工人 卢查尼青年 苏博蒂察斯巴达 克鲁舍瓦茨进步",
    日本J1:"鹿岛鹿角 柏太阳神 京都不死鸟 广岛三箭 神户胜利船 町田泽维亚 浦和红钻 川崎前锋 大阪钢巴 大阪樱花 FC东京 福冈黄蜂 冈山绿雉 清水心跳 横滨水手 名古屋鲸八",
    韩国K1:"全北现代 金泉尚武 大田韩亚市民 浦项铁人 首尔FC 江原FC 安养FC 光州FC 蔚山HD 水原FC 济州SK 大邱FC",
    韩国K2:"仁川联 水原三星 富川1995 首尔衣恋 城南FC 全南天龙 金浦FC 釜山偶像 忠南牙山 华城FC 庆南FC 忠北清州 天安市民 安山绿人"
  };
  // Lower-division first teams, eligible for the simulated national cup only.
  const cupReserves={
  "苏格兰": "圣约翰斯通 帕尔蒂克 阿布罗斯 邓弗姆林",
  "瑞士": "阿劳 伊韦尔东 乌契体育 纳沙泰尔萨马克斯",
  "奥地利": "奥地利卢斯特瑙 圣珀尔滕 阿德米拉 弗洛里茨多夫",
  "丹麦": "林比 哈维德夫 希勒勒 埃斯比约",
  "希腊": "伊拉克里斯 尼基沃洛斯"
};
  const youth={
    中国:["U17","上海海港 山东泰山 浙江 辽宁铁人 江苏 大连可为 长沙麓山国际 恒大足校 郑州二中 上海申花 合肥体校城市 重庆凤鸣山中学 北京人大附三高 长春亚泰 河南足球俱乐部"],
    英格兰:["U18","曼城 阿森纳 利物浦 曼联 纽卡斯尔联 埃弗顿 诺丁汉森林 桑德兰 米德尔斯堡 斯托克城 利兹联 德比郡 切尔西 水晶宫 雷丁 富勒姆"],
    西班牙:["U19","巴塞罗那 皇家马德里 皇家社会 塞尔塔 毕尔巴鄂竞技 奥萨苏纳 埃瓦尔 阿拉维斯 西班牙人 萨拉戈萨 马略卡 赫罗纳 皇家贝蒂斯 格拉纳达 塞维利亚 马德里竞技"],
    法国:["U19","里昂 雷恩 摩纳哥 巴黎圣日耳曼 亚眠 勒阿弗尔 里尔 巴黎FC 卡昂 欧塞尔 第戎 梅斯 南特 昂热 洛里昂 马赛"],
    葡萄牙:["U19","本菲卡 葡萄牙体育 波尔图 布拉加 吉马良斯 法马利康 吉尔维森特 维泽拉 莫雷拉人 里奥阿维 费雷拉 沙维斯 维塞乌学院 通德拉 莱里亚 圣克拉拉"],
    德国:["U19","拜仁慕尼黑 因戈尔施塔特 翁特哈兴 雷根斯堡 慕尼黑1860 斯图加特 奥格斯堡 卡尔斯鲁厄 弗赖堡 霍芬海姆 美因茨 科隆 多特蒙德 沙尔克04 马格德堡 汉堡"]
  };
  const divisions={
    中国:["中乙","中甲","中超"],英格兰:["英甲","英冠","英超"],西班牙:["西班牙第三级","西乙","西甲"],
    法国:["法国第三级","法乙","法甲"],葡萄牙:["葡萄牙第三级","葡甲","葡超"],德国:["德丙","德乙","德甲"],
    意大利:["意甲"],荷兰:["荷甲"],比利时:["比甲"],日本:["日本J1"],韩国:["韩国K2","韩国K1"],
    土耳其:["土超"],苏格兰:["苏超"],瑞士:["瑞士超"],奥地利:["奥甲"],丹麦:["丹超"],希腊:["希腊超"],波兰:["波兰超"],捷克:["捷甲"],罗马尼亚:["罗甲"],塞尔维亚:["塞尔超"]
  };
  const teams=new Map(Object.entries(senior).map(([league,names])=>[league,names.split(" ")]));
  for(const [country,[suffix,names]] of Object.entries(youth)){
    teams.set(country+"青训联赛",names.split(" ").map(name=>name+suffix));
  }
  const byCountry=new Map(),byLeague=new Map();
  for(const [country,leagues] of Object.entries(divisions)){
    byCountry.set(country,[...new Set(leagues.flatMap(league=>teams.get(league)).concat(cupReserves[country]?.split(" ")||[]))]);
    leagues.forEach(league=>byLeague.set(league,country));
  }
  function academy(country,club){
    return (club==="浙江职业"?"浙江":club)+youth[country][0];
  }
  const sources=[
    ["中国职业联赛准入 · 2026","https://news.bjd.com.cn/2026/02/02/11561539.shtml"],
    ["中甲 · 2026","https://qidian.sxtvs.com/timing/share/content/10716800"],
    ["中乙南区 · 2026","https://xm.fjsen.com/2026-03/11/content_32147401.htm"],
    ["中乙北区 · 2026","https://tyj.shanxi.gov.cn/syxw/qyhz/202603/t20260313_10079372.shtml"],
    ["中国 U17 · 2026","https://www.zqjjh.org.cn/zx/xwdt/2026/0825/706137.html"],
    ["英格兰 U18 · 2025/26","https://resources.premierleague.pulselive.com/premierleague/document/2026/05/12/f815c9cf-fdfa-45bd-be6d-79130d4bbb05/U18-Weekly-Bulletin-35.pdf"],
    ["西班牙 U19 · 2025/26","https://rfef.es/es/noticias/definidos-los-grupos-y-calendarios-de-division-de-honor-juvenil"],
    ["法国 U19 · 2025/26","https://media.fff.fr/uploads/documents/groupes-cn-u19-2025-2026.pdf"],
    ["葡萄牙 U19 · 2025/26","https://www.fpf.pt/DownloadDocument.ashx?id=31028"],
    ["德国 U19 · 2026/27","https://www.dfb.de/news/vorrundengruppen-in-dfb-nachwuchsligen-stehen-fest"],
    ...[["英格兰","e/eng2026"],["西班牙","s/span2026"],["法国","f/fran2026"],["葡萄牙","p/port2026"],
      ["德国","d/duit2026"],["意大利","i/ital2026"],["荷兰","n/ned2026"],["比利时","b/belg2026"],
      ["日本","j/jpn2025"],["韩国","s/skor2025"]].map(([country,path])=>
      [country+"联赛 · "+(path.endsWith("2025")?"2025":"2025/26"),"https://www.rsssf.org/tables"+path+".html"]),
    ["土耳其联赛 · 2025/26","https://www.tff.org/default.aspx?pageID=1768"],
    ["苏格兰联赛 · 2025/26","https://www.rsssf.org/tabless/scot2026.html"],
    ["瑞士联赛 · 2025/26","https://www.rsssf.org/tablesz/zwit2026.html"],
    ["奥地利联赛 · 2025/26","https://www.rsssf.org/tableso/oost2026.html"],
    ["丹麦联赛 · 2025/26","https://www.rsssf.org/tablesd/den2026.html"],
    ["希腊联赛 · 2025/26","https://www.rsssf.org/tablesg/grk2026.html"],
    ["波兰联赛 · 2025/26","https://www.rsssf.org/tablesp/pol2026.html"],
    ["捷克联赛 · 2025/26","https://www.rsssf.org/tablest/tsje2026.html"],
    ["罗马尼亚联赛 · 2025/26","https://www.rsssf.org/tablesr/roem2026.html"],
    ["塞尔维亚联赛 · 2025/26","https://www.rsssf.org/tabless/serv2026.html"],
    ["国家队 · FIFA 会员协会","https://inside.fifa.com/associations"]
  ];
  const europeLeagues=Object.freeze(["土超","苏超","瑞士超","奥甲","丹超","希腊超","波兰超","捷甲","罗甲","塞尔超"]);
  const api={divisions,sources,academy,europeLeagues,leagueTeams:league=>teams.get(league)||[],cupTeams:country=>byCountry.get(country)||[],
    domesticAssociation:league=>byLeague.get(league)};
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.ElevenClubs=api;
})(typeof window!=="undefined"?window:globalThis);
