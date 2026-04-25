#!/bin/bash
# OpenClaw 自动备份脚本
# 用法：./backup-openclaw.sh [备份目录]

set -e

# 配置
OPENCLAW_DIR="/root/.openclaw"
BACKUP_DIR="${1:-/volume1/openclaw-data/backup}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="openclaw_backup_$DATE"

echo "🦐 开始备份 OpenClaw..."
echo "源目录：$OPENCLAW_DIR"
echo "目标目录：$BACKUP_DIR"
echo "备份名称：$BACKUP_NAME"

# 创建备份目录
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# 备份配置文件
echo "📋 备份配置文件..."
cp "$OPENCLAW_DIR/openclaw.json" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || echo "  - openclaw.json 不存在"
cp "$OPENCLAW_DIR/openclaw.json.bak" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || echo "  - openclaw.json.bak 不存在"

# 备份凭证（敏感！）
echo "🔑 备份凭证文件..."
cp -r "$OPENCLAW_DIR/credentials/" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || echo "  - credentials 不存在"

# 备份身份标识
echo "🆔 备份身份标识..."
cp -r "$OPENCLAW_DIR/identity/" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || echo "  - identity 不存在"

# 备份工作空间
echo "💼 备份工作空间..."
cp -r "$OPENCLAW_DIR/workspace/" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || echo "  - workspace 不存在"

# 备份记忆数据
echo "🧠 备份记忆数据..."
cp -r "$OPENCLAW_DIR/memory/" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || echo "  - memory 不存在"

# 备份扩展插件
echo "🔌 备份扩展插件..."
cp -r "$OPENCLAW_DIR/extensions/" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || echo "  - extensions 不存在"

# 压缩备份
echo "📦 压缩备份..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"

# 清理临时目录
rm -rf "$BACKUP_NAME"

# 创建最新备份符号链接
ln -sf "$BACKUP_NAME.tar.gz" "$BACKUP_DIR/latest.tar.gz"

# 清理旧备份（保留最近 7 个）
echo "🧹 清理旧备份..."
cd "$BACKUP_DIR"
ls -t openclaw_backup_*.tar.gz | tail -n +8 | xargs -r rm

echo ""
echo "✅ 备份完成！"
echo "备份文件：$BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "最新备份：$BACKUP_DIR/latest.tar.gz"
echo ""
echo "📊 备份大小："
ls -lh "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | awk '{print $5}'
