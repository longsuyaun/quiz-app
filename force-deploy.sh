#!/bin/bash
# 🦐 强制部署到 GitHub Pages

set -e

echo "🦐 开始强制部署..."

# 进入目录
cd /home/bao/.openclaw/workspace/apps/quiz-app

# 复制完整版
echo "📋 复制完整版 index.html..."
cp ../feishu-quiz/quiz-full.html index.html

# 检查内容
if grep -q "变式题" index.html; then
    echo "✅ index.html 包含变式题功能"
else
    echo "❌ index.html 缺少变式题功能"
    exit 1
fi

# 强制添加
echo "📤 添加到 Git..."
git add -f index.html

# 强制提交
echo "💾 提交..."
git commit -m "🔄 强制部署：完整版含变式题" || echo "无变更"

# 强制推送
echo "🚀 推送到 GitHub..."
git push -f origin main

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址："
echo "   https://longsuyaun.github.io/quiz-app/"
echo ""
echo "⏳ 等待 1-2 分钟部署完成"
echo "💡 强制刷新：Ctrl + Shift + R"
