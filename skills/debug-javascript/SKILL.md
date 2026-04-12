---
name: debug-javascript
description: JavaScript/HTML 网页调试技能。用于诊断和修复网页错误、变量未定义、语法错误、GitHub Pages 部署问题。适用于练习系统、题库页面、静态网页等前端问题的快速诊断和修复。
---

# JavaScript 调试技能

## 🎯 适用场景

**触发条件**：
- 网页能打开但功能不正常（如题库列表为空）
- 控制台报错 `xxx is not defined`
- GitHub Pages 部署后页面不更新
- 练习系统/题库页面出现问题
- HTML/JavaScript 语法错误

**不适用**：
- 后端服务器问题（用其他技能）
- 数据库连接问题
- 网络配置问题

---

## 🔍 诊断流程（必须严格执行）

### 第 1 步：打开浏览器控制台

```
按 F12 → Console（控制台）
查看错误信息
```

**常见错误**：
- `xxx is not defined` → 变量未定义
- `Cannot read property of undefined` → 对象未初始化
- `SyntaxError: Unexpected token` → 语法错误

---

### 第 2 步：验证 JavaScript 语法

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('文件路径.html', 'utf-8');
const match = html.match(/<script>([\\s\\S]*?)<\\/script>/);
if (match) {
  try {
    new Function(match[1]);
    console.log('✅ JavaScript 语法正确');
  } catch(e) {
    console.log('❌ 错误:', e.message);
    console.log('错误位置:', e.stack);
  }
}
"
```

**示例**：
```bash
cd /root/.openclaw/workspace
node -e "const fs=require('fs');const h=fs.readFileSync('quiz-app/index.html','utf-8');const m=h.match(/<script>([\\s\\S]*?)<\\/script>/);try{new Function(m[1]);console.log('✅ 语法正确');}catch(e){console.log('❌ 错误:',e.message);}"
```

---

### 第 3 步：搜索变量定义

```bash
# 搜索变量声明
grep -n "let xxx\|const xxx\|var xxx" 文件.html

# 搜索函数定义
grep -n "function xxx" 文件.html
```

**示例**：
```bash
grep -n "questionBank" /root/.openclaw/workspace/quiz-app/index.html
```

---

### 第 4 步：检查常见错误

**变量未定义**：
```javascript
// ❌ 错误
function updateQuestionBank() {
    const bank = questionBank[currentUser];  // questionBank 未定义
}

// ✅ 正确
let questionBank = originalQuestions;  // 先定义
function updateQuestionBank() {
    const bank = questionBank[currentUser];
}
```

**缺少逗号**：
```javascript
// ❌ 错误
const obj = {
    a: 1
    b: 2  // 缺少逗号
}

// ✅ 正确
const obj = {
    a: 1,
    b: 2
}
```

**双逗号**：
```javascript
// ❌ 错误
const arr = [1, 2, , 3]  // 双逗号

// ✅ 正确
const arr = [1, 2, 3]
```

---

### 第 5 步：修复并重启服务

```bash
# 编辑文件
vi /root/.openclaw/workspace/quiz-app/index.html

# 重启 HTTP 服务
pkill -f "http.server 8087"
cd /root/.openclaw/workspace && python3 -m http.server 8087 &

# 验证服务
curl -s "http://localhost:8087/quiz-app/" | grep "<title>"
```

---

### 第 6 步：强制刷新页面

**浏览器强制刷新**：
- Windows/Linux: `Ctrl + Shift + R`
- macOS: `Cmd + Shift + R`

**清除缓存**：
1. 打开开发者工具（F12）
2. 右键刷新按钮 → "清空缓存并硬性重新加载"

---

## 🌐 GitHub Pages 部署流程

### 1️⃣ 推送到 gh-pages 分支

```bash
cd /root/.openclaw/workspace

# 切换到 gh-pages 分支
git checkout gh-pages

# 从 master 获取修复的文件
git checkout master -- quiz-app/index.html

# 移动到根目录（GitHub Pages 要求）
mv quiz-app/index.html .

# 提交并推送
git add index.html
git commit -m "fix: 修复问题描述"
git push origin gh-pages -f

# 返回 master 分支
git checkout master
```

### 2️⃣ 配置 GitHub Pages

1. 打开仓库：https://github.com/用户名/仓库名
2. 进入 **Settings** → **Pages**（左侧菜单）
3. 配置：
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages` / `root`
4. 点击 **Save**

### 3️⃣ 等待部署完成

**部署时间**：1-5 分钟

**检查部署状态**：
1. 点击仓库的 **Actions** 标签
2. 查看最新任务（绿色 ✅ 表示成功）

**访问地址**：
```
https://用户名.github.io/仓库名/
```

---

## 📋 自查清单

修复前必须确认：

- [ ] 已打开浏览器控制台查看错误
- [ ] 已用 node 验证 JavaScript 语法
- [ ] 已搜索变量定义
- [ ] 已检查常见错误（缺少逗号、双逗号、变量未定义）
- [ ] 已重启 HTTP 服务
- [ ] 已强制刷新页面

部署前必须确认：

- [ ] 本地版已测试正常
- [ ] 已推送到 gh-pages 分支
- [ ] GitHub Pages 配置正确
- [ ] 等待部署完成（2-5 分钟）

---

## 💔 教训（2026-04-12）

**问题**：练习系统题库列表显示为空

**折腾时间**：2 天（近 5 小时）

**根本原因**：变量 `questionBank` 未定义

**错误过程**：
1. 一直在修修补补，没检查基础语法
2. 用户说是缓存问题，却认同了
3. 修复了几十遍，越修越乱
4. 最后才发现是缺少一行代码

**教训**：
1. ✅ 先检查代码语法，再动手修复
2. ✅ 注意变量名、语法等基础问题
3. ✅ 多听用户判断，不固执己见
4. ✅ 一次做到位，不反复折腾
5. ✅ 承认错误，不找借口

---

## 🛠️ 快速诊断命令

```bash
# 检查本地服务
ps aux | grep "http.server 8087"
curl -s "http://localhost:8087/quiz-app/" | grep "<title>"

# 验证 JavaScript 语法
node -e "const fs=require('fs');const h=fs.readFileSync('quiz-app/index.html','utf-8');const m=h.match(/<script>([\\s\\S]*?)<\\/script>/);try{new Function(m[1]);console.log('✅ 语法正确');}catch(e){console.log('❌ 错误:',e.message);}"

# 搜索变量定义
grep -n "questionBank\|originalQuestions" quiz-app/index.html

# 检查 Git 状态
cd /root/.openclaw/workspace && git status
git log --oneline -3
```

---

## 📚 相关资源

**访问地址**：
- 本地版：`http://192.168.31.51:8087/quiz-app/`
- 在线版：`https://longsuyaun.github.io/quiz-app/`

**仓库**：
- GitHub: https://github.com/longsuyaun/quiz-app

**记忆记录**：
- `MEMORY.md` - 深刻教训章节
- `memory/2026-04-12.md` - 详细记录

---

**创建时间**: 2026-04-12 15:03  
**创建者**: 学习虾 🦐  
**教训来源**: 练习系统修复事件（2026-04-12）
