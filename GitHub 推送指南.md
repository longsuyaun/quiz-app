# 🔄 GitHub 推送指南

**问题**: 推送时需要 GitHub 认证  
**解决**: 3 种方案任选其一

---

## 方案 1：使用 Personal Access Token（推荐）

### 步骤 1：创建 Token

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token (classic)"**
3. 填写：
   - **Note**: `Quiz App Sync`
   - **Expiration**: `No expiration`
   - **Select scopes**: 勾选 `repo`（完整仓库权限）
4. 点击 **"Generate token"**
5. **复制 Token**（只显示一次，保存好！）

### 步骤 2：推送代码

```bash
cd /home/bao/.openclaw/workspace/apps/quiz-app

# 使用 Token 推送（替换 YOUR_TOKEN）
git push https://YOUR_GITHUB_USERNAME:YOUR_TOKEN@github.com/longsuyaun/quiz-app.git main
```

**示例**:
```bash
git push https://longsuyaun:ghp_xxxxxxxxxxxxxxxxxxxx@github.com/longsuyaun/quiz-app.git main
```

---

## 方案 2：配置 SSH Key（一劳永逸）

### 步骤 1：生成 SSH Key

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# 一直按 Enter 即可
```

### 步骤 2：添加 SSH Key 到 GitHub

1. 复制公钥：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. 访问：https://github.com/settings/keys
3. 点击 **"New SSH key"**
4. 粘贴公钥
5. 点击 **"Add SSH key"**

### 步骤 3：更改远程仓库为 SSH

```bash
cd /home/bao/.openclaw/workspace/apps/quiz-app
git remote set-url origin git@github.com:longsuyaun/quiz-app.git
git push origin main
```

---

## 方案 3：网页上传（最简单）

### 步骤 1：打开 GitHub 仓库

访问：https://github.com/longsuyaun/quiz-app

### 步骤 2：上传文件

1. 点击 **"Add file"** → **"Upload files"**
2. 拖入以下文件：
   - `index.html`
   - `README.md`
   - 所有 `.sh` 脚本
   - 所有 `.md` 文档
3. 填写提交信息：`🦐 学习虾错题自测系统 v2.0`
4. 点击 **"Commit changes"**

### 步骤 3：启用 GitHub Pages

1. 点击 **"Settings"**
2. 左侧点击 **"Pages"**
3. Source 选择：**`Deploy from a branch`**
4. Branch 选择：**`main`** / **`/(root)`**
5. 点击 **"Save"**

**等待 1-2 分钟**，访问：https://longsuyaun.github.io/quiz-app/

---

## 📊 方案对比

| 方案 | 难度 | 推荐度 | 适用场景 |
|------|------|--------|---------|
| Token | ⭐⭐ | ⭐⭐⭐⭐ | 偶尔推送 |
| SSH | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 频繁推送 |
| 网页上传 | ⭐ | ⭐⭐⭐ | 首次部署 |

---

## 🎯 推荐方案

**首次部署**: 方案 3（网页上传）  
**长期使用**: 方案 2（SSH Key）  
**临时推送**: 方案 1（Token）

---

## ✅ 推送后验证

**等待 1-2 分钟**，然后访问：

**在线版**:
```
https://longsuyaun.github.io/quiz-app/
```

**验证功能**:
- ✅ 用户切换（左左/右右）
- ✅ 变式题模式
- ✅ 答题功能
- ✅ 详细解析

---

## 📝 当前 Git 状态

```bash
# 已提交
0b26bb4 - 🦐 学习虾错题自测系统 v2.0 - 完整版

# 待推送
- index.html
- README.md
- 所有脚本和文档
```

---

**选择适合的方案开始推送吧！** 🚀
