# PraiseStar 自动部署指南

## 🚀 快速开始

### 自动部署（推荐）
项目已配置GitHub Actions，当向 `main` 分支推送代码时会自动部署到服务器。

### 手动部署
如果需要手动部署，请按以下步骤操作：

1. **构建项目**
   ```bash
   npm run build
   ```

2. **运行部署脚本**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 📋 部署前准备

### 1. 服务器环境
- Linux服务器 (推荐 Ubuntu 20.04+)
- Nginx 已安装并运行
- 部署用户有sudo权限

### 2. SSH密钥配置
```bash
# 生成SSH密钥对
ssh-keygen -t rsa -b 4096 -C "deploy-key"

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub deploy@39.105.117.48
```

### 3. GitHub Secrets配置
在GitHub仓库的 Settings > Secrets 中添加：
- `DEPLOY_HOST`: 服务器IP地址
- `DEPLOY_USER`: 部署用户名
- `DEPLOY_SSH_KEY`: SSH私钥内容

## 🔧 部署流程

### 自动部署流程
1. 推送代码到 `main` 分支
2. GitHub Actions 自动触发
3. 构建项目 (`npm run build`)
4. 备份服务器现有文件到 `/www/wwwroot/39.105.117.48/backup/`
5. 上传新版本到服务器 `/www/wwwroot/39.105.117.48/`
6. 设置文件权限
7. 重启Nginx服务

### 手动部署流程
1. 运行 `npm run build` 构建项目
2. 运行 `./deploy.sh` 执行部署
3. 脚本会自动备份、上传、设置权限

## 📁 项目结构

```
PraiseStar/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署配置
├── src/                        # 源代码
├── dist/                       # 构建输出目录
├── deploy.sh                   # 手动部署脚本
├── deploy-config.example       # 部署配置示例
└── DEPLOYMENT.md               # 本文档
```

## 🛠️ 常用命令

### 开发环境
```bash
# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 检查构建结果
npm run deploy:check
```

### 部署相关
```bash
# 手动部署
npm run deploy

# 仅构建不部署
npm run build

# 检查部署配置
cat deploy-config.example
```

## 🔍 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理依赖重新安装
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **部署失败**
   ```bash
   # 检查SSH连接
   ssh deploy@39.105.117.48
   
   # 检查服务器权限
   ssh deploy@39.105.117.48 "sudo ls -la /var/www/html"
   ```

3. **网站无法访问**
   ```bash
   # 检查Nginx状态
   ssh deploy@39.105.117.48 "sudo systemctl status nginx"
   
   # 查看Nginx日志
   ssh deploy@39.105.117.48 "sudo tail -f /var/log/nginx/error.log"
   ```

### 回滚部署
如果需要回滚到之前的版本：
```bash
# 在服务器上执行
ssh deploy@39.105.117.48 "
  sudo cp -r /var/www/backup/backup_YYYYMMDD_HHMMSS/* /var/www/html/
  sudo systemctl reload nginx
"
```

## 📊 监控和日志

### 查看部署状态
- GitHub Actions: 仓库 > Actions 标签页
- 服务器日志: `/var/log/nginx/`

### 部署历史
部署脚本会自动备份每次部署的版本到 `/var/www/backup/` 目录。

## 🔒 安全建议

1. **SSH密钥安全**
   - 定期轮换SSH密钥
   - 使用强密码保护私钥

2. **服务器安全**
   - 定期更新系统
   - 配置防火墙规则
   - 监控异常访问

3. **代码安全**
   - 不要在代码中硬编码敏感信息
   - 使用GitHub Secrets存储配置

## 📞 支持

如果遇到问题：
1. 查看GitHub Actions运行日志
2. 检查服务器系统日志
3. 联系项目维护者

---

**注意**: 请确保在部署前已正确配置所有必要的环境变量和权限。
