#!/bin/bash
# 🦐 学习虾 - 手动触发同步脚本
# 功能：上传错题后手动执行，自动同步到 GitHub

set -e

WORKSPACE="/home/bao/.openclaw/workspace"
QUIZ_LOCAL="$WORKSPACE/apps/feishu-quiz/quiz-full.html"
QUIZ_GITHUB="$WORKSPACE/apps/quiz-app/index.html"
LOG_FILE="$WORKSPACE/logs/sync-$(date +%Y-%m-%d).log"

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

# 主函数
main() {
    log "🦐 学习虾手动同步开始"
    
    # 检查本地文件
    if [ ! -f "$QUIZ_LOCAL" ]; then
        log "❌ 本地文件不存在：$QUIZ_LOCAL"
        send_feishu_notification "❌ 同步失败\\n\\n本地文件不存在：\\n$QUIZ_LOCAL" "false"
        exit 1
    fi
    
    # 复制到 GitHub 仓库
    cp "$QUIZ_LOCAL" "$QUIZ_GITHUB"
    log "✅ 文件已复制"
    
    # 进入 GitHub 仓库目录
    cd "$WORKSPACE/apps/quiz-app"
    
    # 检查更改
    if ! git status --porcelain | grep -q .; then
        log "✅ 没有更改，无需同步"
        send_feishu_notification "✅ 无需同步\\n\\n文件没有变化" "true"
        exit 0
    fi
    
    # 添加并提交
    git add index.html
    git commit -m "🔄 手动同步 $(date '+%Y-%m-%d %H:%M:%S')"
    log "✅ 已提交"
    
    # 推送（最多重试 3 次）
    local retry_count=0
    local max_retries=3
    
    while [ $retry_count -lt $max_retries ]; do
        log "🚀 正在推送到 GitHub (尝试 $((retry_count + 1))/$max_retries)..."
        
        if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
            log "✅ 推送成功！"
            send_feishu_notification "✅ 同步成功！\\n\\n已推送到 GitHub Pages\\n\\n在线版：https://longsuyaun.github.io/quiz-app/\\n本地版：http://192.168.31.110:8080/quiz-full.html" "true"
            exit 0
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
    send_feishu_notification "❌ 同步失败（已重试 $max_retries 次）\\n\\n错误原因：GitHub 网络问题\\n\\n建议：\\n1. 检查网络连接\\n2. 稍后手动重试\\n3. 本地版仍可正常使用" "false"
    exit 1
}

# 执行
main
