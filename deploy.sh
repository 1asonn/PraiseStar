#!/bin/bash

# PraiseStar 自动部署脚本
# 用于手动部署或调试部署流程

set -e

# 配置变量
DEPLOY_SERVER="${DEPLOY_HOST:-39.105.117.48}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_PATH="/www/wwwroot/39.105.117.48"
BACKUP_PATH="/www/wwwroot/39.105.117.48/backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 开始部署 PraiseStar 到服务器..."
echo "服务器: $DEPLOY_SERVER"
echo "用户: $DEPLOY_USER"
echo "部署路径: $DEPLOY_PATH"
echo "时间戳: $TIMESTAMP"

# 检查构建产物是否存在
if [ ! -d "dist" ]; then
    echo "❌ 错误：dist 目录不存在，请先运行 npm run build"
    exit 1
fi

echo "✅ 构建产物检查通过"

# 创建部署和备份目录
echo "📦 创建部署和备份目录..."
ssh $DEPLOY_USER@$DEPLOY_SERVER "sudo mkdir -p $DEPLOY_PATH && sudo mkdir -p $BACKUP_PATH"

# 备份当前版本
echo "💾 备份当前版本..."
ssh $DEPLOY_USER@$DEPLOY_SERVER "
    if [ -d '$DEPLOY_PATH' ] && [ \"\$(ls -A $DEPLOY_PATH)\" ]; then
        sudo cp -r $DEPLOY_PATH/* $BACKUP_PATH/backup_$TIMESTAMP/
        echo '✅ 备份完成：$BACKUP_PATH/backup_$TIMESTAMP'
    else
        echo '⚠️  目标目录为空或不存在，跳过备份'
    fi
"

# 上传新版本
echo "📤 上传新版本..."
rsync -avz --delete --progress dist/ $DEPLOY_USER@$DEPLOY_SERVER:$DEPLOY_PATH/

# 设置权限和重启服务
echo "🔧 设置权限和重启服务..."
ssh $DEPLOY_USER@$DEPLOY_SERVER "
    echo '设置文件权限...'
    sudo chown -R nginx:nginx $DEPLOY_PATH
    sudo chmod -R 644 $DEPLOY_PATH
    sudo find $DEPLOY_PATH -type d -exec chmod 755 {} \;
    
    echo '重启Web服务...'
    sudo systemctl reload nginx
    
    echo '✅ 部署完成！'
"

echo "🎉 部署成功完成！"
echo "🌐 访问地址：http://$DEPLOY_SERVER/39.105.117.48"
echo "📋 部署信息："
echo "- 服务器：$DEPLOY_SERVER"
echo "- 路径：$DEPLOY_PATH"
echo "- 备份：$BACKUP_PATH/backup_$TIMESTAMP"
echo "- 时间：$(date)"
