#!/bin/bash
# 🦐 学习虾 - 启动自动同步服务
# 功能：后台运行自动同步守护进程

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DAEMON_SCRIPT="$SCRIPT_DIR/auto-sync-daemon.sh"
PID_FILE="$SCRIPT_DIR/.auto-sync.pid"
LOG_DIR="/home/bao/.openclaw/workspace/logs"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 检查是否已在运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  自动同步服务已在运行 (PID: $PID)"
        echo ""
        echo "停止服务：$0 stop"
        echo "查看日志：tail -f /home/bao/.openclaw/workspace/logs/sync-$(date +%Y-%m-%d).log"
        exit 0
    else
        echo "🧹 清理旧的 PID 文件"
        rm -f "$PID_FILE"
    fi
fi

# 启动守护进程
echo "🚀 启动自动同步服务..."
nohup bash "$DAEMON_SCRIPT" > "$LOG_DIR/auto-sync.out" 2>&1 &
PID=$!

# 保存 PID
echo $PID > "$PID_FILE"

# 等待 2 秒检查是否启动成功
sleep 2

if ps -p $PID > /dev/null 2>&1; then
    echo "✅ 自动同步服务已启动"
    echo ""
    echo "PID: $PID"
    echo "日志：tail -f /home/bao/.openclaw/workspace/logs/sync-$(date +%Y-%m-%d).log"
    echo "输出：tail -f $LOG_DIR/auto-sync.out"
    echo ""
    echo "停止服务：$0 stop"
else
    echo "❌ 启动失败"
    rm -f "$PID_FILE"
    exit 1
fi
