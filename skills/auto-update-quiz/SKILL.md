---
name: auto-update-quiz
description: 自动将错题本更新到练习系统。当用户上传新错题或要求更新题库时自动触发，将错题本 Markdown 文件转换为题库格式，更新 index.html，自动推送 GitHub Pages。全程自动化，3-5 分钟完成。
---

# 自动更新题库技能

## 🎯 触发条件

**自动触发**：
- 左左/右右上传新错题照片
- AI 识别并保存到错题本后
- 用户说"更新题库"、"同步到练习系统"

**手动触发**：
```bash
# 命令
更新题库
同步错题到练习系统
```

---

## 📋 自动化流程

### 第 1 步：读取错题本

```bash
# 读取最新错题文件
ls -lt /root/.openclaw/workspace/错题本/左左/*/ | head -5
ls -lt /root/.openclaw/workspace/错题本/右右/*/ | head -5

# 读取 Markdown 内容
cat /root/.openclaw/workspace/错题本/左左/科目/日期_题目.md
```

**解析内容**：
- 题目文本
- 选项（A/B/C/D）
- 答案
- 解析

---

### 第 2 步：转换为题库格式

**Markdown 格式**：
```markdown
# 题目

**题目**: 下列物质中存在四面体结构的是？

**选项**:
A. ①②④⑤⑥⑦
B. 除③外都有
C. ①②③④⑤
D. ⑤⑥⑧

**答案**: B

**解析**: ③石墨是层状结构...
```

**转换为 JSON**：
```javascript
{
  id: 301,
  question: "下列物质中存在四面体结构的是？",
  options: ["A. ①②④⑤⑥⑦", "B. 除③外都有", "C. ①②③④⑤", "D. ⑤⑥⑧"],
  answer: "B",
  analysis: "<p>③石墨是层状结构...</p>"
}
```

---

### 第 3 步：更新题库文件

**Python 脚本**：
```python
#!/usr/bin/env python3
import json
import re
from datetime import datetime

def parse_markdown(filepath):
    """解析 Markdown 错题文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取题目
    question_match = re.search(r'\*\*题目\*\*:\s*(.+?)(?=\n\*\*|\n\n)', content, re.DOTALL)
    question = question_match.group(1).strip() if question_match else ""
    
    # 提取选项
    options = []
    for opt in ['A', 'B', 'C', 'D']:
        opt_match = re.search(rf'\*\*{opt}\*\*\.*?\n(.+?)(?=\n\*\*[A-D]|\n\n|\*\*答案)', content, re.DOTALL)
        if opt_match:
            options.append(f"{opt}. {opt_match.group(1).strip()}")
    
    # 提取答案
    answer_match = re.search(r'\*\*答案\*\*:\s*(\w+)', content)
    answer = answer_match.group(1).strip() if answer_match else ""
    
    # 提取解析
    analysis_match = re.search(r'\*\*解析\*\*:\s*(.+?)(?=\n---|\Z)', content, re.DOTALL)
    analysis = analysis_match.group(1).strip() if analysis_match else ""
    analysis_html = analysis.replace('\n', '<br>')
    
    return {
        'question': question,
        'options': options,
        'answer': answer,
        'analysis': f"<p>{analysis_html}</p>"
    }

def update_question_bank(user, subject, question_data):
    """更新题库文件"""
    index_path = '/root/.openclaw/workspace/quiz-app/index.html'
    
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 生成新题目 JSON
    new_id = get_next_id(user, subject)
    new_question = f"""
                    {{ id: {new_id}, question: "{question_data['question']}", options: {json.dumps(question_data['options'], ensure_ascii=False)}, answer: "{question_data['answer']}", analysis: "{question_data['analysis']}" }}"""
    
    # 找到对应科目的数组末尾
    pattern = rf'(            {user}: {{[^}}]*{subject}: \\[[^]]*?)(\\n                \\])'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        # 在数组末尾添加新题目
        insert_pos = match.start(2)
        content = content[:insert_pos] + ',' + new_question + content[insert_pos:]
        
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已添加题目到 {user}/{subject}")
        return True
    else:
        print(f"❌ 未找到 {user}/{subject} 题库")
        return False

def get_next_id(user, subject):
    """获取下一个题目 ID"""
    # 实现获取下一个 ID 的逻辑
    return 1000  # 示例

if __name__ == '__main__':
    import sys
    user = sys.argv[1]  # zuozuo 或 youyou
    subject = sys.argv[2]  # physics/chemistry/biology/math
    filepath = sys.argv[3]
    
    question_data = parse_markdown(filepath)
    update_question_bank(user, subject, question_data)
```

---

### 第 4 步：验证语法

```bash
# 验证 JavaScript 语法
node -e "
const fs = require('fs');
const html = fs.readFileSync('/root/.openclaw/workspace/quiz-app/index.html', 'utf-8');
const match = html.match(/<script>([\\s\\S]*?)<\\/script>/);
if (match) {
  try {
    new Function(match[1]);
    console.log('✅ 语法正确');
    process.exit(0);
  } catch(e) {
    console.log('❌ 错误:', e.message);
    process.exit(1);
  }
}
"
```

---

### 第 5 步：提交并推送

```bash
cd /root/.openclaw/workspace

# 添加文件
git add quiz-app/index.html

# 提交
git commit -m "feat: 添加新错题（用户/科目/日期）"

# 推送到 master
git push origin master

# 推送到 gh-pages（GitHub Pages）
git checkout gh-pages
git checkout master -- quiz-app/index.html
mv quiz-app/index.html . 2>/dev/null || true
git add index.html
git commit -m "feat: 添加新错题（用户/科目/日期）"
git push origin gh-pages -f
git checkout master
```

---

### 第 6 步：通知用户

**发送消息**：
```
🦐 新错题已更新到练习系统！

📚 你的题库现在有 XX 题
📱 访问地址：
https://longsuyaun.github.io/quiz-app/

⏰ GitHub Pages 部署中（2-5 分钟）
```

---

## ⏱️ 时间估算

| 步骤 | 时间 |
|------|------|
| 1. 读取错题本 | 30 秒 |
| 2. 转换格式 | 30 秒 |
| 3. 更新题库 | 30 秒 |
| 4. 验证语法 | 30 秒 |
| 5. Git 推送 | 1 分钟 |
| 6. GitHub 部署 | 2-5 分钟（后台） |
| **总计** | **3-5 分钟** |

---

## 📋 自查清单

执行前必须确认：

- [ ] 错题 Markdown 文件格式正确
- [ ] 题目、选项、答案、解析完整
- [ ] 用户和科目匹配（左左/右右）
- [ ] 题库文件存在

执行后必须验证：

- [ ] JavaScript 语法正确
- [ ] Git 提交成功
- [ ] GitHub Pages 部署中
- [ ] 用户已收到通知

---

## 🛠️ 快速命令

```bash
# 手动更新题库
cd /root/.openclaw/workspace
python3 scripts/update-quiz.py zuozuo chemistry /root/.openclaw/workspace/错题本/左左/化学/2026-04-12_题目.md

# 验证语法
node -e "const fs=require('fs');const h=fs.readFileSync('quiz-app/index.html','utf-8');const m=h.match(/<script>([\\s\\S]*?)<\\/script>/);try{new Function(m[1]);console.log('✅');}catch(e){console.log('❌',e.message);}"

# 推送 GitHub
./sync-question-bank.sh
```

---

## 💔 教训（2026-04-12）

**问题**：手动更新题库折腾 2 天

**原因**：
- ❌ 变量未定义 (`questionBank`)
- ❌ 缺少自动化流程
- ❌ 没有语法验证

**解决**：
- ✅ 创建自动化脚本
- ✅ 添加语法验证步骤
- ✅ 自动推送 GitHub

**以后**：
- ✅ 拍照上传 → 3-5 分钟自动更新
- ✅ 无需手动编辑代码
- ✅ 语法自动验证

---

## 📚 相关文件

**题库文件**：
- `/root/.openclaw/workspace/quiz-app/index.html`
- `/root/.openclaw/workspace/quiz-app/question-bank.json`

**错题本**：
- `/root/.openclaw/workspace/错题本/左左/`
- `/root/.openclaw/workspace/错题本/右右/`

**脚本**：
- `/root/.openclaw/workspace/scripts/update-quiz.py`
- `/root/.openclaw/workspace/sync-question-bank.sh`

**访问地址**：
- 本地版：`http://192.168.31.51:8087/quiz-app/`
- 在线版：`https://longsuyaun.github.io/quiz-app/`

---

**创建时间**: 2026-04-12 15:18  
**创建者**: 学习虾 🦐  
**目标**: 拍照上传后 3-5 分钟自动更新到练习系统
