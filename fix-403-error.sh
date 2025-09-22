#!/bin/bash

# 修复 403 Forbidden 错误的脚本
# 在服务器上以 root 用户执行

echo "开始修复 403 Forbidden 错误..."

DEPLOY_PATH="/www/wwwroot/39.105.117.48"

# 1. 检查目录是否存在
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "❌ 部署目录不存在: $DEPLOY_PATH"
    exit 1
fi

# 2. 检查 index.html 是否存在
if [ ! -f "$DEPLOY_PATH/index.html" ]; then
    echo "❌ index.html 不存在"
    exit 1
fi

# 3. 设置正确的权限
echo "设置目录权限..."
chmod 755 $DEPLOY_PATH
chown nginx:nginx $DEPLOY_PATH

echo "设置文件权限..."
find $DEPLOY_PATH -type f -exec chmod 644 {} \;
find $DEPLOY_PATH -type d -exec chmod 755 {} \;
find $DEPLOY_PATH -type f -exec chown nginx:nginx {} \;
find $DEPLOY_PATH -type d -exec chown nginx:nginx {} \;

# 4. 特别处理 index.html
echo "设置 index.html 权限..."
chmod 644 $DEPLOY_PATH/index.html
chown nginx:nginx $DEPLOY_PATH/index.html

# 5. 检查 SELinux 状态（如果适用）
if command -v getenforce >/dev/null 2>&1; then
    SELINUX_STATUS=$(getenforce)
    echo "SELinux 状态: $SELINUX_STATUS"
    if [ "$SELINUX_STATUS" = "Enforcing" ]; then
        echo "设置 SELinux 上下文..."
        setsebool -P httpd_can_network_connect 1 2>/dev/null || true
        chcon -R -t httpd_exec_t $DEPLOY_PATH 2>/dev/null || true
    fi
fi

# 6. 测试 nginx 权限
echo "测试 nginx 权限..."
sudo -u nginx test -r $DEPLOY_PATH/index.html && echo "✅ nginx 可以读取 index.html" || echo "❌ nginx 无法读取 index.html"
sudo -u nginx test -x $DEPLOY_PATH && echo "✅ nginx 可以访问目录" || echo "❌ nginx 无法访问目录"

# 7. 检查文件权限
echo "检查文件权限..."
ls -la $DEPLOY_PATH/index.html
ls -la $DEPLOY_PATH/ | head -5

# 8. 重启 nginx
echo "重启 nginx..."
systemctl reload nginx
systemctl status nginx --no-pager

# 9. 测试访问
echo "测试访问..."
curl -I http://localhost/39.105.117.48/ 2>/dev/null | head -3 || echo "本地访问测试失败"

echo "403 错误修复完成！"
echo "请访问: http://39.105.117.48/39.105.117.48/"
