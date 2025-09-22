# 服务器权限配置指南

## 为 deploy 用户设置部署目录权限

### 1. 登录服务器并切换到 root 用户

```bash
ssh root@39.105.117.48
```

### 2. 创建 deploy 用户（如果不存在）

```bash
# 创建 deploy 用户
useradd -m -s /bin/bash deploy

# 设置密码（可选）
passwd deploy
```

### 3. 设置部署目录权限

```bash
# 设置部署目录的所有者为 deploy 用户
chown -R deploy:deploy /www/wwwroot/39.105.117.48

# 设置目录权限
chmod 755 /www/wwwroot/39.105.117.48

# 确保 deploy 用户对父目录有执行权限
chmod 755 /www/wwwroot
```

### 4. 配置 nginx 用户权限

```bash
# 将 deploy 用户添加到 nginx 组
usermod -a -G nginx deploy

# 或者将 nginx 用户添加到 deploy 组
usermod -a -G deploy nginx
```

### 5. 设置 SSH 密钥认证

```bash
# 切换到 deploy 用户
su - deploy

# 创建 .ssh 目录
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加您的公钥到 authorized_keys
echo "您的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 退出 deploy 用户
exit
```

### 6. 测试权限

```bash
# 切换到 deploy 用户测试
su - deploy

# 测试写入权限
touch /www/wwwroot/39.105.117.48/test.txt
echo "测试内容" > /www/wwwroot/39.105.117.48/test.txt
cat /www/wwwroot/39.105.117.48/test.txt

# 清理测试文件
rm /www/wwwroot/39.105.117.48/test.txt

# 退出 deploy 用户
exit
```

### 7. 配置 nginx 服务权限（如果需要）

```bash
# 编辑 nginx 配置，确保 nginx 用户可以读取文件
# 通常 nginx 用户需要读取权限，deploy 用户需要写入权限

# 设置文件权限为 644，目录权限为 755
find /www/wwwroot/39.105.117.48 -type f -exec chmod 644 {} \;
find /www/wwwroot/39.105.117.48 -type d -exec chmod 755 {} \;

# 设置所有者
chown -R deploy:nginx /www/wwwroot/39.105.117.48
```

## 权限配置说明

### 目录权限：
- `/www/wwwroot/39.105.117.48/` - 755 (deploy:deploy)
- 子目录 - 755 (deploy:nginx)
- 文件 - 644 (deploy:nginx)

### 用户组关系：
- `deploy` 用户：负责部署和更新文件
- `nginx` 用户：负责读取文件并提供Web服务
- 两个用户都在同一个组中，确保权限共享

### 验证配置：

```bash
# 检查目录权限
ls -la /www/wwwroot/39.105.117.48

# 检查用户组
groups deploy
groups nginx

# 测试部署权限
sudo -u deploy touch /www/wwwroot/39.105.117.48/test-deploy.txt
sudo -u nginx cat /www/wwwroot/39.105.117.48/test-deploy.txt
```

## 故障排除

### 如果仍然出现权限错误：

1. **检查 SELinux 状态**：
   ```bash
   getenforce
   # 如果是 Enforcing，考虑临时禁用或配置 SELinux 策略
   ```

2. **检查文件系统权限**：
   ```bash
   ls -la /www/wwwroot/
   ls -la /www/wwwroot/39.105.117.48/
   ```

3. **检查用户组关系**：
   ```bash
   id deploy
   id nginx
   ```

4. **重新设置权限**：
   ```bash
   chown -R deploy:deploy /www/wwwroot/39.105.117.48
   chmod -R 755 /www/wwwroot/39.105.117.48
   find /www/wwwroot/39.105.117.48 -type f -exec chmod 644 {} \;
   ```
