#!/usr/bin/env node
/**
 * 🦐 学习虾 - 添加鲍哥错题到左左和右右题库
 * 将鲍哥的 11 道题分别添加到左左和右右的题库中
 */

const fs = require('fs');
const path = require('path');

const QUESTION_BANK_FILE = '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/apps/quiz-app/question-bank.json';

// 鲍哥的 11 道题目数据
const baogeQuestions = {
  chemistry: [
    {
      id: 101,
      question: "铁的一种配合物的化学式为 [Fe(Htrz)₃](ClO₄)₂，其中 Htrz 为 1,2,4-三氮唑。配离子中阴离子空间构型为______，阴离子的中心原子的杂化方式是______，Htrz 分子中含σ键数为______个，其与 Fe²⁺ 形成配位键的原子是______",
      options: ["填空题"],
      answer: "正四面体形,sp³,8,N",
      analysis: "ClO₄⁻中 Cl 是 sp³杂化，4 个 O 呈正四面体排布。Htrz（1,2,4-三氮唑）五元环 5σ + C-H 2σ + N-H 1σ = 8 个 σ 键。N 原子有孤对电子，可与 Fe²⁺配位。",
      isFill: true,
      source: "鲍哥 -2026-04-07"
    },
    {
      id: 102,
      question: "当一个碳原子连接四个不同的原子或原子团时，该碳原子叫手性碳原子。下列化合物中含有两个手性碳原子的是（ ）",
      options: [
        "A. CH₂OH-CHOH-CHO",
        "B. CH₂Br-CHBr-Cl",
        "C. COOH-CHOH-CH₂-CHBrCl",
        "D. C₆H₅-C(OH)(CH₃)-CH₂Cl"
      ],
      answer: "C",
      analysis: "C 选项中上方 CHOH 碳连接-H、-OH、-COOH、-CH₂CHBrCl 四个不同基团，下方 CHBrCl 碳连接-H、-Br、-Cl、-CH₂CHOHCOOH 四个不同基团，共 2 个手性碳。D 选项中心碳连接两个相同的-CH₃，不是手性碳。",
      source: "鲍哥 -2026-04-07"
    },
    {
      id: 103,
      question: "下列说法不正确的是（ ）",
      options: [
        "A. BF₃和 SO₃中 B、S 杂化轨道类型相同，二者价层电子对互斥模型均为平面三角形",
        "B. CH₄、CCl₄都是含有极性键的非极性分子",
        "C. C₂²⁻与 O₂²⁺互为等电子体，1 mol O₂²⁺中含有的π键数目为 2N_A",
        "D. AB₂的空间结构为 V 形，则 A 为 sp³杂化"
      ],
      answer: "D",
      analysis: "A 正确：BF₃和 SO₃都是 sp²杂化，平面三角形。B 正确：CH₄、CCl₄都是正四面体对称结构，极性抵消。C 正确：C₂²⁻与 O₂²⁺都是 10 价电子，与 N₂是等电子体，含 2 个π键。D 错误：V 形结构可以是 sp²（如 SO₂）或 sp³（如 H₂O）。",
      source: "鲍哥 -2026-04-07"
    },
    {
      id: 104,
      question: "理论化学模拟得到一种 N₁₃⁺离子，结构为中心 N 连接 4 个-N=N=N 基团。下列说法错误的是（ ）",
      options: [
        "A. 所有原子均满足 8 电子结构",
        "B. N 原子的杂化方式有 2 种",
        "C. 空间结构为四面体形",
        "D. 1 个 N₁₃⁺ 离子中含有 12 个 σ 键"
      ],
      answer: "B",
      analysis: "N 原子的杂化方式有 3 种：中心 N 是 sp³，支链连接 N 是 sp²，支链中间 N（两个双键）是 sp。A 正确：所有 N 都满足 8 电子。C 正确：中心 N 是 sp³杂化，4 个支链呈四面体。D 正确：中心 4 个单键σ + 4 个支链各 2 个双键σ = 4+8=12 个 σ 键。",
      source: "鲍哥 -2026-04-07"
    }
  ],
  biology: [
    {
      id: 201,
      question: "实验小鼠皮肤细胞培养的基本过程：实验小鼠→甲→皮肤组织→乙→皮肤细胞→丙→培养细胞 1→丁→培养细胞 2。下列叙述错误的是（ ）",
      options: [
        "A. 甲过程需要对实验小鼠进行消毒",
        "B. 乙过程对皮肤组织可用胰蛋白酶处理",
        "C. 丙过程得到的细胞大多具有异常染色体组型",
        "D. 丁过程得到的部分细胞失去贴壁黏附性"
      ],
      answer: "C",
      analysis: "丙过程是原代培养，原代培养的细胞遗传物质稳定，染色体组型正常。只有传代培养后期（10 代以后），部分细胞才可能发生遗传物质改变。A、B 正确：取材需要消毒，用胰蛋白酶分散组织。D 正确：传代培养过程中部分细胞可能癌变，失去贴壁黏附性。",
      source: "鲍哥 -2026-04-07"
    },
    {
      id: 202,
      question: "动物细胞培养过程中，下列叙述错误的是（ ）",
      options: [
        "A. 制备肝细胞悬液时先用剪刀剪碎肝组织，再用胃蛋白酶处理",
        "B. 肝细胞培养过程中向培养液中通入 5% 的 CO₂刺激细胞呼吸",
        "C. 为了防止培养过程中杂菌的污染，可向培养液中加入适量的干扰素",
        "D. 肿瘤细胞和正常细胞在原代培养过程中，正常细胞会出现停止增殖的现象"
      ],
      answer: "ABC",
      analysis: "A 错：应该用胰蛋白酶或胶原蛋白酶，胃蛋白酶最适 pH 为 1.5-2.0，在培养条件下会失活。B 错：5% CO₂的作用是维持培养液 pH，不是刺激细胞呼吸。C 错：防止细菌污染应该用抗生素，干扰素是抗病毒的。D 正确：正常细胞有接触抑制，肿瘤细胞无接触抑制。",
      source: "鲍哥 -2026-04-07"
    },
    {
      id: 203,
      question: "下列动物细胞培养过程中，属于原代培养的是（ ）",
      options: [
        "A. 用胰蛋白酶使组织分散成单个细胞的过程",
        "B. 从机体取得细胞后立即进行培养的过程",
        "C. 出现接触抑制现象后接下来的细胞培养过程",
        "D. 哺乳动物细胞在培养基中的悬浮生长过程"
      ],
      answer: "B",
      analysis: "原代培养的定义是从机体取出组织或细胞后，第一次进行的培养。A 是培养前的准备工作，C 是传代培养的定义，D 描述的是生长方式与培养代数无关。",
      source: "鲍哥 -2026-04-07"
    }
  ],
  physics: [
    {
      id: 301,
      question: "如图所示，实线和虚线分别表示振幅和频率均相同的两列简谐横波的波峰和波谷，此时 M 点是波峰与波峰的相遇点。设两列波的振幅均为 A，则（ ）",
      options: [
        "A. M 点的振幅为 2A",
        "B. Q 点（波谷与波谷相遇）的振幅为 0",
        "C. P 点（波峰与波谷相遇）始终静止不动",
        "D. M 点的位移始终为 2A"
      ],
      answer: "AC",
      analysis: "A 正确：M 点是波峰与波峰相遇，振动加强，振幅=A+A=2A。B 错误：Q 点是波谷与波谷相遇，也是振动加强点，振幅=2A，此时位移=-2A。C 正确：P 点是波峰与波谷相遇，振动减弱，振幅=0，始终静止。D 错误：M 点振幅是 2A，但位移随时间变化（-2A 到 +2A）。",
      source: "鲍哥 -2026-04-07"
    },
    {
      id: 302,
      question: "两列简谐横波分别沿 x 轴正方向和负方向传播，波源分别位于 x₁=-0.2m 和 x₂=1.2m 处，波速均为 v=0.4m/s，振幅均为 A=2cm。t=0 时刻 P 点 (x=0.2m) 和 Q 点 (x=0.8m) 刚开始振动，M 点位于 x=0.5m。t=2s 时刻，质点 M 的纵坐标为（ ）",
      options: [
        "A. -2cm",
        "B. -4cm",
        "C. 0cm",
        "D. 2cm"
      ],
      answer: "B",
      analysis: "M 点到两波源距离相等，是振动加强点，合振幅=2+2=4cm。波传到 M 点需 0.75s，t=2s 时 M 已振动 1.25T。起振方向向下，1.25T 后到达波谷，y=-4cm。注意要用合振幅 4cm 计算，不是单波振幅 2cm。",
      source: "鲍哥 -2026-04-07"
    },
    {
      id: 303,
      question: "B 超检测仪可以通过探头发送和接收超声波信号。已知超声波在人体内的传播速度为 1200m/s，波长λ=8mm。下列说法正确的是（ ）",
      options: [
        "A. 此超声波的频率为 1.2×10⁵Hz",
        "B. 图中质点 B 在此后的 1×10⁻⁴s 内运动的路程为 0.12m",
        "C. 图中质点 A 此时沿 y 轴正方向运动",
        "D. 图中质点 A、B 两点的加速度大小相等、方向相同"
      ],
      answer: "CD",
      analysis: "A 错：f=v/λ=1200/0.008=1.5×10⁵Hz。B 错：T=1/f≈6.67×10⁻⁶s，1×10⁻⁴s≈15T，路程=15×4A=15×16mm=0.24m。C 正确：波向右传，A 点在\"下坡\"，向上运动。D 正确：A、B 都在波峰，位移相同，加速度 a=-ω²y 大小相等、方向相同（都指向平衡位置）。",
      source: "鲍哥 -2026-04-07"
    }
  ]
};

// 主程序
console.log('🦐 学习虾 - 添加鲍哥错题到左左和右右题库\n');

// 读取现有题库
let questionBank;
try {
  const content = fs.readFileSync(QUESTION_BANK_FILE, 'utf-8');
  questionBank = JSON.parse(content);
  console.log('✅ 题库读取成功');
} catch (error) {
  console.error('❌ 题库读取失败:', error.message);
  process.exit(1);
}

// 初始化左左和右右的题库结构
if (!questionBank.zuozuo) {
  questionBank.zuozuo = {};
}
if (!questionBank.youyou) {
  questionBank.youyou = {};
}

// 添加鲍哥的题目到左左题库
console.log('\n📚 添加鲍哥题目到左左题库...');
['chemistry', 'biology', 'physics'].forEach(subject => {
  const subjectName = subject === 'chemistry' ? '化学' : subject === 'biology' ? '生物' : '物理';
  if (!questionBank.zuozuo[subject]) {
    questionBank.zuozuo[subject] = [];
  }
  
  const existingIds = new Set(questionBank.zuozuo[subject].map(q => q.id));
  let added = 0;
  
  baogeQuestions[subject].forEach(q => {
    if (!existingIds.has(q.id)) {
      questionBank.zuozuo[subject].push(q);
      added++;
    }
  });
  
  console.log(`  ✅ ${subjectName}: 添加 ${added} 题`);
});

// 添加鲍哥的题目到右右题库
console.log('\n📚 添加鲍哥题目到右右题库...');
['chemistry', 'biology', 'physics'].forEach(subject => {
  const subjectName = subject === 'chemistry' ? '化学' : subject === 'biology' ? '生物' : '物理';
  if (!questionBank.youyou[subject]) {
    questionBank.youyou[subject] = [];
  }
  
  const existingIds = new Set(questionBank.youyou[subject].map(q => q.id));
  let added = 0;
  
  baogeQuestions[subject].forEach(q => {
    if (!existingIds.has(q.id)) {
      questionBank.youyou[subject].push(q);
      added++;
    }
  });
  
  console.log(`  ✅ ${subjectName}: 添加 ${added} 题`);
});

// 统计题库
console.log('\n📊 题库统计:');
let totalZuozuo = 0;
let totalYouyou = 0;

Object.keys(questionBank.zuozuo).forEach(subject => {
  const count = questionBank.zuozuo[subject].length;
  totalZuozuo += count;
  console.log(`  左左 - ${subject}: ${count} 题`);
});

Object.keys(questionBank.youyou).forEach(subject => {
  const count = questionBank.youyou[subject].length;
  totalYouyou += count;
  console.log(`  右右 - ${subject}: ${count} 题`);
});

console.log(`\n总计：左左 ${totalZuozuo} 题，右右 ${totalYouyou} 题`);

// 保存题库
try {
  fs.writeFileSync(QUESTION_BANK_FILE, JSON.stringify(questionBank, null, 2), 'utf-8');
  console.log('\n✅ 题库已保存');
} catch (error) {
  console.error('❌ 题库保存失败:', error.message);
  process.exit(1);
}

console.log('\n✨ 完成！鲍哥的 11 道题已添加到左左和右右的题库中');
