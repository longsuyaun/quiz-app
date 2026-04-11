#!/bin/bash
# 🦐 学习虾 - 启动文件监听服务
# 功能：后台运行文件监听，有上传时自动同步

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WATCH_SCRIPT="$SCRIPT_DIR/watch-sync.sh"
PID_FILE="$SCRIPT_DIR/.file-watcher.pid"
LOG_DIR="/home/bao/.openclaw/workspace/logs"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 检查 inotifywait
if ! command -v inotifywait &> /dev/null; then
    echo "❌ inotifywait 未安装"
    echo ""
    echo "请先安装："
    echo "  sudo apt install inotify-tools"
    exit 1
fi

# 检查是否已在运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  文件监听服务已在运行 (PID: $PID)"
        echo ""
        echo "停止服务：$0 stop"
        echo "查看日志：tail -f $LOG_DIR/file-watcher-$(date +%Y-%m-%d).log"
        exit 0
    else
        echo "🧹 清理旧的 PID 文件"
        rm -f "$PID_FILE"
    fi
fi

# 启动监听服务
echo "🚀 启动文件监听服务..."
echo "📁 监听文件：$SCRIPT_DIR/../feishu-quiz/quiz-full.html"
echo "🔄 检测到变化后自动执行同步"
echo ""

nohup bash "$WATCH_SCRIPT" > "$LOG_DIR/file-watcher.out" 2>&1 &
PID=$!

# 保存 PID
echo $PID > "$PID_FILE"

# 等待 2 秒检查是否启动成功
sleep 2

if ps -p $PID > /dev/null 2>&1; then
    echo "✅ 文件监听服务已启动"
    echo ""
    echo "PID: $PID"
    echo "日志：tail -f $LOG_DIR/file-watcher-$(date +%Y-%m-%d).log"
    echo "输出：tail -f $LOG_DIR/file-watcher.out"
    echo ""
    echo "停止服务：$0 stop"
else
    echo "❌ 启动失败"
    rm -f "$PID_FILE"
    exit 1
fi
