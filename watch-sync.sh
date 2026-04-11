#!/bin/bash
# 🦐 学习虾 - 文件监听自动同步
# 功能：监听 quiz-full.html 文件变化 → 自动同步

set -e

WORKSPACE="/home/bao/.openclaw/workspace"
QUIZ_LOCAL="$WORKSPACE/apps/feishu-quiz/quiz-full.html"
SYNC_SCRIPT="$WORKSPACE/apps/quiz-app/trigger-sync.sh"
PID_FILE="$WORKSPACE/apps/quiz-app/.file-watcher.pid"
LOG_FILE="$WORKSPACE/logs/file-watcher-$(date +%Y-%m-%d).log"

# 创建日志目录
mkdir -p "$WORKSPACE/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查 inotifywait 是否安装
if ! command -v inotifywait &> /dev/null; then
    log "❌ inotifywait 未安装，请先执行：sudo apt install inotify-tools"
    exit 1
fi

# 检查同步脚本
if [ ! -x "$SYNC_SCRIPT" ]; then
    log "❌ 同步脚本不存在或无执行权限：$SYNC_SCRIPT"
    exit 1
fi

log "🦐 文件监听服务已启动"
log "📁 监听文件：$QUIZ_LOCAL"
log "🔄 同步脚本：$SYNC_SCRIPT"
log ""

# 保存 PID
echo $$ > "$PID_FILE"

# 使用 inotifywait 监听文件变化
inotifywait -m -e close_write -e moved_to "$QUIZ_LOCAL" --format '%w%f %e' 2>/dev/null | while read file event; do
    log "📝 检测到文件变化：$file ($event)"
    log "⏳ 等待 2 秒确保文件写入完成..."
    sleep 2
    
    # 执行同步脚本
    log "🚀 启动同步..."
    if bash "$SYNC_SCRIPT" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ 同步完成"
    else
        log "❌ 同步失败，查看日志了解详情"
    fi
    
    log ""
done
