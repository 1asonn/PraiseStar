pipeline {
    agent any
    
    environment {
        DEPLOY_SERVER = '39.105.117.48'
        DEPLOY_PATH = '/var/www/html'
        DEPLOY_USER = 'deploy'
    }
    
    stages {
        stage('代码检出') {
            steps {
                echo '正在检出代码...'
                script {
                    // 如果是多分支Pipeline，使用简单的checkout scm
                    if (env.BRANCH_NAME) {
                        echo "检出分支: ${env.BRANCH_NAME}"
                        checkout scm
                    } else {
                        // 如果是常规Pipeline，需要明确指定仓库信息
                        echo '检出指定仓库和分支...'
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],  // 可以改为 '*/develop' 或其他分支
                            doGenerateSubmoduleConfigurations: false,
                            extensions: [[
                                $class: 'CleanBeforeCheckout'
                            ]],
                            submoduleCfg: [],
                            userRemoteConfigs: [[
                                credentialsId: 'your-git-credentials-id',  // 需要替换为实际的凭证ID
                                url: 'https://github.com/your-username/your-repo.git'  // 需要替换为实际的仓库URL
                            ]]
                        ])
                    }
                    
                    // 显示当前检出的提交信息
                    script {
                        if (isUnix()) {
                            sh '''
                                echo "=== 当前代码信息 ==="
                                echo "分支: $(git branch --show-current)"
                                echo "最新提交: $(git log -1 --oneline)"
                                echo "提交作者: $(git log -1 --format='%an <%ae>')"
                                echo "提交时间: $(git log -1 --format='%cd')"
                            '''
                        } else {
                            bat '''
                                echo === 当前代码信息 ===
                                git branch --show-current
                                git log -1 --oneline
                                git log -1 --format="%%an <%%ae>"
                                git log -1 --format="%%cd"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('环境准备') {
            steps {
                script {
                    echo '=== Node.js Environment Check ==='
                    if (isUnix()) {
                        sh '''
                            echo "Node.js Version:"
                            node --version
                            echo "npm Version:"
                            npm --version
                            echo "Current Directory:"
                            pwd
                            echo "Package.json exists:"
                            ls -la package.json
                        '''
                    } else {
                        bat '''
                            echo === Environment Check ===
                            echo Node.js Version:
                            node --version
                            echo npm Version:
                            npm --version
                            echo Current Directory:
                            cd
                            echo === Checking project files ===
                            if exist package.json (
                                echo Package.json exists
                                echo Package.json content preview:
                                type package.json | findstr /n "name\|version\|scripts\|dependencies"
                            ) else (
                                echo ERROR: Package.json not found!
                                dir
                                exit 1
                            )
                            if exist package-lock.json (
                                echo Package-lock.json exists
                            ) else (
                                echo Package-lock.json not found, will use npm install instead of npm ci
                            )
                        '''
                    }
                }
            }
        }
        
        stage('清理和安装依赖') {
            steps {
                script {
                    echo '=== Installing Dependencies ==='
                    if (isUnix()) {
                        sh '''
                            echo "Cleaning npm cache..."
                            npm cache clean --force || true
                            
                            echo "Installing dependencies..."
                            if [ -f "package-lock.json" ]; then
                                npm ci
                            else
                                npm install
                            fi
                            
                            echo "Dependencies installed successfully"
                            echo "Node modules size:"
                            du -sh node_modules/ || echo "Node modules directory checked"
                        '''
                    } else {
                        bat '''
                            echo === Cleaning npm cache ===
                            npm cache clean --force
                            
                            echo === Installing dependencies ===
                            if exist package-lock.json (
                                echo Found package-lock.json, using npm ci
                                npm ci
                            ) else (
                                echo Using npm install
                                npm install
                            )
                            
                            echo === Verifying installation ===
                            if exist node_modules (
                                echo Dependencies installed successfully
                                echo Node modules directory exists
                                dir node_modules | find /c "." && echo Total packages installed
                            ) else (
                                echo ERROR: node_modules directory not found
                                exit 1
                            )
                            
                            echo === Checking webpack ===
                            npx webpack --version || echo Webpack not found, but will try to run build
                        '''
                    }
                }
            }
        }
        
        stage('项目构建') {
            steps {
                script {
                    echo '=== Building Project ==='
                    if (isUnix()) {
                        sh '''
                            echo "Starting build process..."
                            npm run build
                            
                            echo "Build completed. Verifying output..."
                            if [ -d "dist" ]; then
                                echo "Build successful! Files:"
                                ls -la dist/
                                echo "Total size:"
                                du -sh dist/
                            else
                                echo "Build failed: dist directory does not exist"
                                exit 1
                            fi
                        '''
                    } else {
                        bat '''
                            echo === Starting build process ===
                            echo Checking package.json scripts...
                            findstr "build" package.json
                            
                            echo === Checking webpack availability ===
                            where webpack >nul 2>&1 && echo Webpack found globally || echo Webpack not found globally
                            
                            echo === Trying different build methods ===
                            echo Method 1: npm run build
                            npm run build && (
                                echo npm run build succeeded
                            ) || (
                                echo npm run build failed, trying npx method...
                                echo Method 2: npx webpack --mode production
                                npx webpack --mode production
                            ) && (
                                echo Build process completed
                            ) || (
                                echo Both methods failed, trying direct node_modules path...
                                echo Method 3: Using direct path to webpack
                                .\node_modules\.bin\webpack --mode production
                            )
                            
                            echo === Build completed. Verifying output ===
                            if exist dist (
                                echo Build successful! Files:
                                dir dist
                                echo Build completed at: %date% %time%
                                echo Checking dist contents:
                                dir dist /s
                            ) else (
                                echo Build failed: dist directory does not exist
                                echo === Debugging information ===
                                echo Current directory contents:
                                dir
                                echo node_modules .bin contents:
                                if exist node_modules\.bin dir node_modules\.bin
                                echo webpack-cli check:
                                if exist node_modules\webpack-cli echo webpack-cli found
                                if exist node_modules\webpack echo webpack found
                                exit 1
                            )
                        '''
                    }
                }
            }
        }
        
        stage('代码质量检查') {
            steps {
                echo '正在进行代码质量检查...'
                script {
                    if (isUnix()) {
                        sh '''
                            echo "=== 依赖安全检查 ==="
                            npm audit --audit-level=high || echo "安全检查完成（有警告）"
                            
                            echo "=== 包大小分析 ==="
                            if [ -d "node_modules" ]; then
                                du -sh node_modules/
                                echo "依赖包数量："
                                ls node_modules/ | wc -l
                            fi
                        '''
                    } else {
                        bat '''
                            echo === 依赖安全检查 ===
                            npm audit --audit-level=high || echo "安全检查完成（有警告）"
                            
                            echo === 包大小分析 ===
                            if exist node_modules (
                                dir node_modules
                            )
                        '''
                    }
                }
            }
        }
        
        stage('打包构建产物') {
            steps {
                echo '正在打包构建产物...'
                script {
                    def timestamp = new Date().format('yyyyMMdd_HHmmss')
                    if (isUnix()) {
                        sh """
                            echo "=== 打包构建产物 ==="
                            cd dist
                            tar -czf ../praisestar-build-${env.BUILD_NUMBER}-${timestamp}.tar.gz .
                            cd ..
                            echo "打包完成：praisestar-build-${env.BUILD_NUMBER}-${timestamp}.tar.gz"
                            ls -lh *.tar.gz
                        """
                    } else {
                        bat """
                            echo === 打包构建产物 ===
                            powershell -Command "Compress-Archive -Path 'dist\\*' -DestinationPath 'praisestar-build-${env.BUILD_NUMBER}-${timestamp}.zip' -Force"
                            echo 打包完成：praisestar-build-${env.BUILD_NUMBER}-${timestamp}.zip
                            dir *.zip
                        """
                    }
                }
                
                // 归档构建产物
                archiveArtifacts artifacts: '*.tar.gz,*.zip', fingerprint: true, allowEmptyArchive: true
            }
        }
        
        stage('部署确认') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def deployEnv = env.BRANCH_NAME == 'develop' ? '测试环境' : '生产环境'
                    timeout(time: 10, unit: 'MINUTES') {
                        def userInput = input(
                            message: "确认部署到 ${deployEnv}？",
                            ok: '确认部署',
                            parameters: [
                                choice(
                                    choices: ['是', '否'],
                                    description: '请选择是否继续部署',
                                    name: 'DEPLOY_CONFIRM'
                                )
                            ],
                            submitterParameter: 'DEPLOYER'
                        )
                        
                        if (userInput.DEPLOY_CONFIRM == '否') {
                            error('用户取消部署')
                        }
                        
                        env.DEPLOY_ENV = deployEnv
                        env.DEPLOYER_USER = userInput.DEPLOYER
                    }
                }
            }
        }
        
        stage('部署到服务器') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                echo "正在部署到 ${env.DEPLOY_ENV}..."
                script {
                    // 这里使用简单的文件复制方式，您可以根据实际情况修改
                    if (isUnix()) {
                        sh '''
                            echo "=== 准备部署文件 ==="
                            
                            # 创建部署脚本
                            cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

DEPLOY_SERVER="39.105.117.48"
DEPLOY_PATH="/var/www/html"
BACKUP_PATH="/var/www/backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "开始部署到服务器: $DEPLOY_SERVER"

# 创建备份目录
ssh deploy@$DEPLOY_SERVER "sudo mkdir -p $BACKUP_PATH"

# 备份当前版本
echo "备份当前版本..."
ssh deploy@$DEPLOY_SERVER "
    if [ -d '$DEPLOY_PATH' ]; then
        sudo cp -r $DEPLOY_PATH $BACKUP_PATH/backup_$TIMESTAMP
        echo '备份完成：$BACKUP_PATH/backup_$TIMESTAMP'
    fi
"

# 上传新版本
echo "上传新版本..."
rsync -avz --delete dist/ deploy@$DEPLOY_SERVER:$DEPLOY_PATH/

# 设置权限和重启服务
echo "设置权限和重启服务..."
ssh deploy@$DEPLOY_SERVER "
    sudo chown -R nginx:nginx $DEPLOY_PATH
    sudo chmod -R 644 $DEPLOY_PATH
    sudo find $DEPLOY_PATH -type d -exec chmod 755 {} \\;
    sudo systemctl reload nginx
    echo '部署完成！'
"

echo "部署成功完成"
EOF

                            chmod +x deploy.sh
                            
                            echo "=== 部署脚本已生成 ==="
                            echo "手动执行部署请运行："
                            echo "./deploy.sh"
                            echo ""
                            echo "或者使用以下命令手动部署："
                            echo "1. 备份：ssh deploy@39.105.117.48 'sudo cp -r /var/www/html /var/www/backup_$(date +%Y%m%d_%H%M%S)'"
                            echo "2. 上传：rsync -avz --delete dist/ deploy@39.105.117.48:/var/www/html/"
                            echo "3. 重启：ssh deploy@39.105.117.48 'sudo systemctl reload nginx'"
                        '''
                    } else {
                        bat '''
                            echo === 准备部署文件 ===
                            
                            echo 创建部署脚本...
                            (
                                echo @echo off
                                echo echo 开始部署到服务器: 39.105.117.48
                                echo echo.
                                echo echo 请手动执行以下步骤：
                                echo echo 1. 使用SCP或FTP上传dist目录到服务器
                                echo echo 2. 在服务器上备份当前版本
                                echo echo 3. 替换文件并重启Web服务
                                echo echo.
                                echo echo 详细命令：
                                echo echo scp -r dist/* deploy@39.105.117.48:/var/www/html/
                                echo echo ssh deploy@39.105.117.48 "sudo systemctl reload nginx"
                            ) > deploy.bat
                            
                            echo 部署脚本已生成：deploy.bat
                            echo 构建产物位置：%CD%\\dist
                        '''
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                node {
                    echo '清理构建环境...'
                    // 清理临时文件
                    if (isUnix()) {
                        sh '''
                            echo "清理临时文件..."
                            rm -f *.tar.gz deploy.sh
                            echo "清理完成"
                        '''
                    } else {
                        bat '''
                            echo 清理临时文件...
                            if exist *.zip del *.zip
                            if exist deploy.bat del deploy.bat
                            echo 清理完成
                        '''
                    }
                    
                    // 清理工作空间
                    cleanWs()
                }
            }
        }
        success {
            echo '✅ 构建成功！'
            script {
                def message = """
🎉 PraiseStar前端构建成功！

📋 构建信息：
- 项目分支：${env.BRANCH_NAME}
- 构建编号：${env.BUILD_NUMBER}
- 构建时间：${new Date()}
- 部署环境：${env.DEPLOY_ENV ?: '仅构建，未部署'}
${env.DEPLOYER_USER ? "- 部署执行人：${env.DEPLOYER_USER}" : ""}

🚀 下一步：
${env.DEPLOY_ENV ? "- 访问地址：http://39.105.117.48" : "- 可以手动下载构建产物进行部署"}
- 构建产物已归档，可在Jenkins中下载

💡 提示：
- 如需重新部署，可以使用"从指定阶段重新运行"功能
- 构建产物保存在Jenkins工作空间中
"""
                
                echo message
            }
        }
        failure {
            echo '❌ 构建失败！'
            script {
                def message = """
💥 PraiseStar前端构建失败！

📋 失败信息：
- 项目分支：${env.BRANCH_NAME}
- 构建编号：${env.BUILD_NUMBER}
- 失败时间：${new Date()}

🔍 排查建议：
1. 检查Node.js环境是否正确安装
2. 检查依赖包是否能正常安装
3. 检查构建脚本是否存在语法错误
4. 查看详细日志：${env.BUILD_URL}console

🛠️ 常见解决方案：
- 确保Jenkins服务器已安装Node.js 16+
- 检查网络连接，确保能访问npm仓库
- 清理node_modules目录后重新构建
"""
                
                echo message
            }
        }
    }
}