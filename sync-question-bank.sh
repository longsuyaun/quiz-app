#!/bin/bash
# 同步题库到 GitHub Pages
# 用法：./sync-question-bank.sh [提交信息]

set -e

WORKSPACE="/root/.openclaw/workspace"
INDEX_FILE="$WORKSPACE/quiz-app/index.html"
COMMIT_MSG="${1:-feat: 更新题库}"

cd "$WORKSPACE"

echo "📦 同步题库到 GitHub..."

# 检查文件是否已修改
if ! git diff --quiet "$INDEX_FILE"; then
    echo "✅ 检测到题库变更"
else
    echo "ℹ️  题库无变更"
    exit 0
fi

# 添加到 master 分支
echo "📝 提交到 master 分支..."
git add "$INDEX_FILE"
git commit -m "$COMMIT_MSG"
git push origin master

# 推送到 gh-pages 分支
echo "📝 推送到 gh-pages 分支..."
CURRENT_BRANCH=$(git branch --show-current)

git checkout gh-pages
git checkout master -- quiz-app/index.html

# 移动到根目录（GitHub Pages 要求）
if [ -f "quiz-app/index.html" ]; then
    mv quiz-app/index.html . 2>/dev/null || true
fi

git add index.html
git commit -m "$COMMIT_MSG" || echo "ℹ️  无新变更"
git push origin gh-pages -f

# 返回原分支
git checkout "$CURRENT_BRANCH"

echo ""
echo "✅ 同步完成！"
echo ""
echo "📱 访问地址："
echo "  本地版：http://192.168.31.51:8087/quiz-app/"
echo "  在线版：https://longsuyaun.github.io/quiz-app/"
echo ""
echo "⏰ GitHub Pages 部署中（2-5 分钟）..."
