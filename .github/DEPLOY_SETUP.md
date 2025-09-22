# GitHub Actions 自动部署配置指南

## 概述
本项目使用 GitHub Actions 实现 main 分支更新时自动部署到服务器。

## 配置步骤

### 1. 配置 GitHub Secrets
在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：

#### 必需配置
- `DEPLOY_HOST`: 部署服务器IP地址 (例如: `39.105.117.48`)
- `DEPLOY_USER`: 部署用户名 (例如: `deploy`)
- `DEPLOY_SSH_KEY`: 服务器SSH私钥 (完整的私钥内容)

#### 可选配置
- `DEPLOY_PORT`: SSH端口 (默认: `22`)

### 2. SSH密钥配置

#### 生成SSH密钥对
```bash
# 在本地生成SSH密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# 查看公钥内容
cat ~/.ssh/github_actions_deploy.pub
```

#### 配置服务器
1. 将公钥添加到服务器的 `~/.ssh/authorized_keys` 文件
2. 确保SSH用户有sudo权限
3. 测试SSH连接：
   ```bash
   ssh -i ~/.ssh/github_actions_deploy deploy@39.105.117.48
   ```

#### 配置GitHub Secrets
1. 复制私钥内容：
   ```bash
   cat ~/.ssh/github_actions_deploy
   ```
2. 在GitHub仓库中添加Secret：
   - Name: `DEPLOY_SSH_KEY`
   - Value: 私钥的完整内容（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`）

### 3. 服务器环境要求

#### 系统要求
- Linux服务器 (推荐 Ubuntu 20.04+)
- Nginx 已安装并运行
- 部署用户有sudo权限

#### 目录结构
```
/var/www/html/          # 网站根目录
/var/www/backup/        # 备份目录
```

#### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. 部署流程说明

#### 自动触发条件
- 向 main 分支推送代码
- 合并 Pull Request 到 main 分支

#### 部署步骤
1. **代码检出**: 检出最新代码
2. **环境准备**: 设置Node.js 18环境
3. **依赖安装**: 运行 `npm ci`
4. **代码检查**: 运行安全审计
5. **项目构建**: 运行 `npm run build`
6. **备份当前版本**: 备份服务器上的现有文件
7. **上传新版本**: 上传构建产物到服务器
8. **设置权限**: 配置文件权限
9. **重启服务**: 重新加载Nginx

#### 手动部署
如果需要手动部署，可以使用提供的脚本：
```bash
# 确保已构建项目
npm run build

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 5. 监控和日志

#### 查看部署状态
- 在GitHub仓库的 Actions 标签页查看部署状态
- 点击具体的workflow运行查看详细日志

#### 服务器日志
```bash
# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看系统日志
sudo journalctl -u nginx -f
```

### 6. 故障排除

#### 常见问题

1. **SSH连接失败**
   - 检查SSH密钥是否正确配置
   - 确认服务器IP和端口
   - 测试SSH连接：`ssh -i ~/.ssh/private_key deploy@server_ip`

2. **权限错误**
   - 确认部署用户有sudo权限
   - 检查目录权限设置

3. **构建失败**
   - 检查Node.js版本
   - 确认依赖包安装正常
   - 查看构建日志

4. **部署后网站无法访问**
   - 检查Nginx配置
   - 确认文件权限
   - 查看Nginx错误日志

#### 回滚部署
如果需要回滚到之前的版本：
```bash
# 在服务器上执行
sudo cp -r /var/www/backup/backup_YYYYMMDD_HHMMSS/* /var/www/html/
sudo systemctl reload nginx
```

### 7. 安全建议

1. **SSH密钥安全**
   - 定期轮换SSH密钥
   - 使用强密码保护私钥
   - 限制SSH访问IP

2. **服务器安全**
   - 定期更新系统
   - 配置防火墙规则
   - 监控异常访问

3. **代码安全**
   - 不要在代码中硬编码敏感信息
   - 使用GitHub Secrets存储配置
   - 定期审查部署权限

## 联系支持
如果遇到问题，请检查：
1. GitHub Actions 运行日志
2. 服务器系统日志
3. Nginx 错误日志

或联系项目维护者获取帮助。
