#!/bin/bash
# 🦐 学习虾 - 题库更新脚本
# 从 Markdown 错题文件生成题库并更新到 index.html

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🦐 学习虾题库更新程序"
echo "===================="
echo ""

# 1. 生成题库 JSON
echo "📝 生成题库 JSON..."
node generate-questions.js

# 2. 读取生成的题库
if [ ! -f "question-bank.json" ]; then
    echo "❌ 题库生成失败！"
    exit 1
fi

# 3. 统计题库
echo ""
echo "📊 题库统计:"
cat question-bank.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for user, subjects in data.items():
    name = '左左' if user == 'zuozuo' else '右右'
    print(f'  {name}:')
    for subject, questions in subjects.items():
        print(f'    {subject}: {len(questions)} 题')
"

# 4. 备份原文件
echo ""
echo "💾 备份 index.html..."
cp index.html index.html.bak

# 5. 更新 index.html（替换 originalQuestions）
echo "🔄 更新 index.html..."

# 读取题库 JSON
QUESTION_JSON=$(cat question-bank.json)

# 创建临时文件
cat > temp-questions.js << EOF
        // 🦐 自动生成的题库 - $(date +%Y-%m-%d)
        // 来源：Markdown 错题文件
        const originalQuestions = ${QUESTION_JSON};
EOF

# 替换 index.html 中的 originalQuestions
python3 << PYTHON
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到 originalQuestions 定义并替换
pattern = r'// 原始题库\s*const originalQuestions = \{[\s\S]*?\};'
replacement = open('temp-questions.js', 'r', encoding='utf-8').read().strip()

new_content = re.sub(pattern, replacement, content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('✅ index.html 更新完成')
PYTHON

# 清理临时文件
rm -f temp-questions.js

echo ""
echo "✅ 题库更新完成！"
echo ""
echo "📍 文件位置:"
echo "   - 题库 JSON: $SCRIPT_DIR/question-bank.json"
echo "   - 在线测试：http://localhost:8888/index.html"
echo ""
echo "🔄 下次更新：运行 ./update-question-bank.sh"
