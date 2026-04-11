#!/bin/bash
# 🦐 学习虾 - 部署错题自测系统到 GitHub Pages

set -e

echo "🚀 开始部署到 GitHub Pages..."

cd /home/bao/.openclaw/workspace/apps/quiz-app

# 检查 git 配置
echo "📋 检查 git 配置..."
git config --global user.name "longsuyaun"
git config --global user.email "longsuyaun@users.noreply.github.com"

# 初始化仓库
echo "📦 初始化 git 仓库..."
git init
git add .
git commit -m "📱 错题自测系统 - 初始版本" || echo "已有提交"

# 切换到 main 分支
git branch -M main

# 添加远程仓库（如果已存在则跳过）
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/longsuyaun/quiz-app.git

echo ""
echo "✅ 准备工作完成！"
echo ""
echo "📝 接下来请手动执行以下步骤："
echo ""
echo "1️⃣ 在浏览器打开：https://github.com/new"
echo "2️⃣ 创建新仓库，名称：quiz-app"
echo "3️⃣ 选择 Public（公开）"
echo "4️⃣ 点击 'Create repository'"
echo ""
echo "5️⃣ 然后执行以下命令："
echo "   git push -u origin main"
echo ""
echo "6️⃣ 最后启用 GitHub Pages："
echo "   - 打开 https://github.com/longsuyaun/quiz-app/settings/pages"
echo "   - Source 选择 'Deploy from a branch'"
echo "   - Branch 选择 'main'，folder 选择 '/'"
echo "   - 点击 'Save'"
echo ""
echo "🎉 完成！访问地址："
echo "   https://longsuyaun.github.io/quiz-app/"
echo ""
