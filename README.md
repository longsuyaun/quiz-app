# 🦐 学习虾错题自测系统

**版本**: 2.0  
**创建时间**: 2026-03-31  
**服务对象**: 左左、右右（高二学生）

---

## 🌐 访问方式

### 在线版（GitHub Pages）
```
https://longsuyaun.github.io/quiz-app/
```

### 本地版（局域网）
```
http://192.168.31.110:8080/quiz-full.html
```

---

## ✅ 核心功能

### 1️⃣ Web 自测系统
- ✅ 用户切换（左左/右右）
- ✅ 科目选择（物理/生物/数学）
- ✅ 变式题模式（举一反三）
- ✅ 题型支持（单选/多选/填空）
- ✅ 即时反馈（✅/❌）
- ✅ 详细解析
- ✅ 成绩统计

### 2️⃣ 变式题系统
- ✅ 数字变式（改变系数）
- ✅ 问法变式（正确→错误）
- ✅ 场景变式（改变条件）
- ✅ 自动生成（10-15 题）

### 3️⃣ 双系统架构
- ✅ 在线版：GitHub Pages（公网访问）
- ✅ 本地版：HTTP 服务器（局域网）
- ✅ 自动同步（文件监听）

### 4️⃣ 自动同步服务
- ✅ 文件监听（inotify）
- ✅ 保存后自动同步（2 秒）
- ✅ 失败重试（3 次）
- ✅ 飞书通知（成功/失败）

---

## 📚 题库详情

### 左左
**物理（5 题）**:
1. 单摆运动分析（单选）
2. 单摆周期公式（多选）
3. DIS 实验拉力分析（单选）
4. 周期公式填空（填空）
5. 周期计算（计算）

**生物（1 题）**:
1. 细胞染色问题（填空）

### 右右
**数学（3 题）**:
1. 排列组合方程（单选）
2. 组合数性质（单选）
3. 组合应用题（单选）

**总计**: 7 道原题  
**启用变式题后**: 10-15 题

---

## 🚀 快速开始

### 方式 1：在线版（推荐）
直接访问：https://longsuyaun.github.io/quiz-app/

### 方式 2：本地版
```bash
# 启动 HTTP 服务器
cd /home/bao/.openclaw/workspace/apps/feishu-quiz
python3 -m http.server 8080 --bind 0.0.0.0

# 访问
http://192.168.31.110:8080/quiz-full.html
```

### 方式 3：启动文件监听（自动同步）
```bash
# 安装依赖
sudo apt install inotify-tools

# 启动监听
cd /home/bao/.openclaw/workspace/apps/quiz-app
./start-watcher.sh
```

---

## 📊 系统架构

```
学习虾错题自测系统
├── Web 前端（HTML5 + CSS3 + JS）
│   ├── quiz-full.html（完整版）
│   └── quiz-simple.html（简化版）
│
├── 变式题生成器
│   ├── 数字变式
│   ├── 问法变式
│   └── 场景变式
│
├── 双系统部署
│   ├── 在线版（GitHub Pages）
│   └── 本地版（HTTP Server）
│
└── 自动同步服务
    ├── 文件监听（inotify）
    ├── 触发同步（trigger-sync.sh）
    └── 飞书通知
```

---

## 💡 使用建议

### 日常练习
1. **启用变式题模式**
2. **生成类似题目**
3. **避免死记硬背**
4. **真正掌握知识点**

### 考前复习
1. **关闭变式题模式**
2. **快速过原题**
3. **检验掌握程度**

### 添加新题
1. **编辑 quiz-full.html**
2. **在 questionBank 中添加**
3. **保存后自动同步**
4. **收到飞书通知**

---

## 🔧 技术说明

### 技术栈
- **前端**: HTML5 + CSS3 + JavaScript（原生）
- **后端**: Python HTTP Server
- **部署**: GitHub Pages + 本地服务器
- **同步**: Git + Bash + inotify + 飞书 API

### 文件结构
```
quiz-app/
├── index.html              # GitHub Pages 主文件
├── README.md              # 项目说明
├── sync.sh                # 手动同步脚本
├── trigger-sync.sh        # 触发同步（含通知）
├── watch-sync.sh          # 文件监听
├── start-watcher.sh       # 启动监听服务
└── stop-watcher.sh        # 停止监听服务

feishu-quiz/
├── quiz-full.html         # 完整版（含变式题）
├── quiz-simple.html       # 简化版
└── 系统总结.md            # 完整文档
```

### 自动同步流程
```
保存 quiz-full.html
    ↓ (inotify 检测到)
等待 2 秒（确保写入完成）
    ↓
执行 trigger-sync.sh
    ↓
复制到 GitHub 仓库
    ↓
Git 提交 + 推送（重试 3 次）
    ↓
成功 → ✅ 飞书通知
失败 → ❌ 飞书通知（含排查建议）
```

---

## 📝 管理命令

### 本地服务器
```bash
# 启动
cd /home/bao/.openclaw/workspace/apps/feishu-quiz
python3 -m http.server 8080 --bind 0.0.0.0

# 访问
http://localhost:8080/quiz-full.html
http://192.168.31.110:8080/quiz-full.html
```

### 自动同步
```bash
# 启动监听服务
cd /home/bao/.openclaw/workspace/apps/quiz-app
./start-watcher.sh

# 停止监听服务
./stop-watcher.sh

# 手动同步
./trigger-sync.sh
```

### 查看日志
```bash
# 同步日志
tail -f /home/bao/.openclaw/workspace/logs/sync-$(date +%Y-%m-%d).log

# 监听日志
tail -f /home/bao/.openclaw/workspace/logs/file-watcher-$(date +%Y-%m-%d).log
```

---

## 📈 数据统计

### 今日完成（2026-03-31）
- ✅ Web 自测系统开发
- ✅ 变式题生成器
- ✅ 双系统部署
- ✅ 自动同步服务
- ✅ 飞书通知集成
- ✅ 题库导入（7 题）

### 使用统计
- **左左**: 物理 5 题 + 生物 1 题
- **右右**: 数学 3 题
- **变式题**: 自动生成（10-15 题）

---

## 🎯 后续优化

### 短期（本周）
- [ ] 添加更多题目
- [ ] 优化变式题算法
- [ ] 添加错题本功能

### 中期（本月）
- [ ] 拍照上传 OCR
- [ ] AI 智能判分
- [ ] 知识点图谱

### 长期（本学期）
- [ ] 完整学科覆盖
- [ ] 高考真题库
- [ ] 学习数据分析

---

## 💬 常见问题

### Q1: 如何添加新题目？
**A**: 编辑 `quiz-full.html`，在 `questionBank` 对象中添加，保存后自动同步。

### Q2: 变式题是什么？
**A**: 类似题目，改变数字/问法/场景，帮助真正掌握知识点，避免死记硬背。

### Q3: 如何停止自动同步？
**A**: 执行 `./stop-watcher.sh` 停止监听服务。

### Q4: 手机如何访问？
**A**: 手机连接同一 WiFi，访问 `http://192.168.31.110:8080/quiz-full.html`。

---

## 🎓 教育理念

### 核心思想
- **理解 > 记忆**
- **举一反三 > 死记硬背**
- **变式练习 > 重复刷题**

### 学习目标
- 左左：掌握物理单摆专题
- 右右：掌握数学排列组合
- 共同：培养举一反三能力

---

## 📖 相关文档

- **系统总结**: `apps/feishu-quiz/系统总结.md`
- **同步说明**: `apps/quiz-app/同步说明.md`
- **文件监听**: `apps/quiz-app/文件监听自动同步说明.md`
- **使用指南**: `apps/feishu-quiz/使用指南.md`

---

**开发者**: 学习虾 🦐  
**服务对象**: 左左、右右  
**创建时间**: 2026-03-31  
**版本**: 2.0

---

## 🔗 快速链接

**在线版**: https://longsuyaun.github.io/quiz-app/  
**本地版**: http://192.168.31.110:8080/quiz-full.html  
**GitHub**: https://github.com/longsuyaun/quiz-app

**立即开始学习！** 🚀
# 强制更新
