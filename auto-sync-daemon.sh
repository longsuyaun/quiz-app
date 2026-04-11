#!/bin/bash
# 🦐 学习虾 - 自动同步守护进程
# 功能：监听文件变化 → 自动同步 → 失败通知

set -e

WORKSPACE="/home/bao/.openclaw/workspace"
QUIZ_LOCAL="$WORKSPACE/apps/feishu-quiz/quiz-full.html"
QUIZ_GITHUB="$WORKSPACE/apps/quiz-app/index.html"
LOG_FILE="$WORKSPACE/logs/sync-$(date +%Y-%m-%d).log"
LAST_SYNC_FILE="$WORKSPACE/apps/quiz-app/.last_sync"

# 飞书机器人配置
FEISHU_APP_ID="cli_a903f712607bdcd3"
FEISHU_APP_SECRET="sBvFXc8SrtVrJVCJ6LT8Cbz20v8sXaRB"
FEISHU_USER_ID="ou_ac463dcc26343797b42e6567b53fbcba"

# 创建日志目录
mkdir -p "$WORKSPACE/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 发送飞书消息通知
send_feishu_notification() {
    local message="$1"
    local success="$2"
    
    log "📤 发送飞书通知：$message"
    
    # 获取 token
    local token_response=$(curl -s -X POST "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal" \
        -H "Content-Type: application/json" \
        -d "{\"app_id\":\"$FEISHU_APP_ID\",\"app_secret\":\"$FEISHU_APP_SECRET\"}")
    
    local token=$(echo "$token_response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tenant_access_token',''))")
    
    if [ -z "$token" ]; then
        log "❌ 获取飞书 token 失败"
        return 1
    fi
    
    # 发送消息
    local emoji="✅"
    if [ "$success" = "false" ]; then
        emoji="❌"
    fi
    
    local content="{\"text\":\"$emoji 学习虾同步通知\\n\\n$message\"}"
    
    local response=$(curl -s -X POST "https://open.feishu.cn/open-apis/im/v1/messages?receive_id=$FEISHU_USER_ID" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "{\"msg_type\":\"text\",\"content\":$content}")
    
    if echo "$response" | grep -q '"code":0'; then
        log "✅ 飞书通知发送成功"
        return 0
    else
        log "❌ 飞书通知发送失败：$response"
        return 1
    fi
}

# 同步函数
do_sync() {
    log "🔄 开始同步..."
    
    # 检查本地文件
    if [ ! -f "$QUIZ_LOCAL" ]; then
        log "❌ 本地文件不存在：$QUIZ_LOCAL"
        send_feishu_notification "❌ 同步失败\\n\\n本地文件不存在：\\n$QUIZ_LOCAL" "false"
        return 1
    fi
    
    # 复制到 GitHub 仓库
    cp "$QUIZ_LOCAL" "$QUIZ_GITHUB"
    log "✅ 文件已复制"
    
    # 进入 GitHub 仓库目录
    cd "$WORKSPACE/apps/quiz-app"
    
    # 检查更改
    if ! git status --porcelain | grep -q .; then
        log "✅ 没有更改，无需同步"
        return 0
    fi
    
    # 添加并提交
    git add index.html
    git commit -m "🔄 自动同步 $(date '+%Y-%m-%d %H:%M:%S')"
    log "✅ 已提交"
    
    # 推送（最多重试 3 次）
    local retry_count=0
    local max_retries=3
    
    while [ $retry_count -lt $max_retries ]; do
        log "🚀 正在推送到 GitHub (尝试 $((retry_count + 1))/$max_retries)..."
        
        if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
            log "✅ 推送成功！"
            send_feishu_notification "✅ 同步成功！\\n\\n已推送到 GitHub Pages\\n\\n在线版：https://longsuyaun.github.io/quiz-app/\\n本地版：http://192.168.31.110:8080/quiz-full.html" "true"
            
            # 记录最后同步时间
            date +%s > "$LAST_SYNC_FILE"
            
            return 0
        else
            retry_count=$((retry_count + 1))
            log "❌ 推送失败，重试次数：$retry_count"
            
            if [ $retry_count -lt $max_retries ]; then
                log "⏳ 等待 10 秒后重试..."
                sleep 10
            fi
        fi
    done
    
    # 所有重试都失败
    log "❌ 推送失败，已达到最大重试次数"
    
    # 发送失败通知
    send_feishu_notification "❌ 同步失败（已重试 $max_retries 次）\\n\\n错误原因：GitHub 网络问题\\n\\n建议：\\n1. 检查网络连接\\n2. 手动执行同步脚本\\n3. 稍后重试\\n\\n本地版仍可正常使用：\\nhttp://192.168.31.110:8080/quiz-full.html" "false"
    
    return 1
}

# 主循环
log "🦐 学习虾自动同步守护进程已启动"
log "📁 监听文件：$QUIZ_LOCAL"
log "🌐 目标仓库：$WORKSPACE/apps/quiz-app"
log "📊 检查间隔：60 秒"
log ""

# 记录初始状态
md5sum "$QUIZ_LOCAL" > /tmp/quiz_local.md5

while true; do
    # 检查文件是否变化
    if md5sum -c /tmp/quiz_local.md5 > /dev/null 2>&1; then
        # 文件未变化，跳过
        sleep 60
        continue
    fi
    
    # 文件已变化，执行同步
    log "📝 检测到文件变化"
    md5sum "$QUIZ_LOCAL" > /tmp/quiz_local.md5
    
    # 执行同步
    if do_sync; then
        log "✅ 同步完成"
    else
        log "❌ 同步失败，将在下次检查时重试"
    fi
    
    # 等待 60 秒后再次检查
    sleep 60
done
