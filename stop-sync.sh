#!/bin/bash
# 🦐 学习虾 - 停止自动同步服务

PID_FILE="$(dirname "$0")/.auto-sync.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "⚠️  自动同步服务未运行"
    exit 0
fi

PID=$(cat "$PID_FILE")

if ps -p $PID > /dev/null 2>&1; then
    echo "🛑 停止自动同步服务 (PID: $PID)..."
    kill $PID
    sleep 2
    
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  强制终止..."
        kill -9 $PID
    fi
    
    rm -f "$PID_FILE"
    echo "✅ 服务已停止"
else
    echo "⚠️  进程不存在，清理 PID 文件"
    rm -f "$PID_FILE"
fi
