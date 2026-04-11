#!/bin/bash
# 🦐 学习虾 - 双系统同步脚本
# 功能：本地修改 → Git 提交 → 自动同步到 GitHub

set -e

WORKSPACE="/home/bao/.openclaw/workspace"
QUIZ_LOCAL="$WORKSPACE/apps/feishu-quiz/quiz-full.html"
QUIZ_GITHUB="$WORKSPACE/apps/quiz-app/index.html"

echo "🦐 学习虾错题自测系统 - 双系统同步"
echo "=" * 60

# 检查本地文件是否存在
if [ ! -f "$QUIZ_LOCAL" ]; then
    echo "❌ 本地文件不存在：$QUIZ_LOCAL"
    exit 1
fi

# 复制到 GitHub 仓库
echo "📋 复制本地文件到 GitHub 仓库..."
cp "$QUIZ_LOCAL" "$QUIZ_GITHUB"
echo "✅ 复制完成"

# 进入 GitHub 仓库目录
cd "$WORKSPACE/apps/quiz-app"

# 检查更改
if git status --porcelain | grep -q .; then
    echo "📝 检测到更改..."
    git status --short
    
    # 添加并提交
    git add index.html
    git commit -m "🔄 自动同步本地系统 $(date '+%Y-%m-%d %H:%M:%S')"
    
    # 推送
    echo "🚀 正在推送到 GitHub..."
    git push origin main
    
    echo "✅ 同步成功！"
    echo ""
    echo "🌐 在线版：https://longsuyaun.github.io/quiz-app/"
    echo "💻 本地版：http://192.168.31.110:8080/quiz-full.html"
else
    echo "✅ 没有更改，无需同步"
fi

echo "=" * 60
