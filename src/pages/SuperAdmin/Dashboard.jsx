import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const SuperAdminDashboard = () => {
    const { superAdmin, isSuperAdmin, logoutSuperAdmin } = useAuth()

    // 如果未登录为超级管理员，重定向到登录页
    if (!isSuperAdmin) {
        return <Navigate to="/login" replace />
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '10px',
                padding: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #eee'
                }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#333' }}>🔧 超级管理员控制台</h1>
                        <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                            欢迎回来，{superAdmin?.username || '超级管理员'}
                        </p>
                    </div>
                    <button 
                        onClick={logoutSuperAdmin}
                        style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        退出登录
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    <div style={{
                        background: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>系统信息</h3>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>超级管理员ID:</strong> {superAdmin?.id || 'N/A'}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>用户名:</strong> {superAdmin?.username || 'N/A'}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>权限级别:</strong> 超级管理员
                        </p>
                    </div>

                    <div style={{
                        background: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>功能模块</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '10px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}>
                                用户管理
                            </button>
                            <button style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '10px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}>
                                系统设置
                            </button>
                            <button style={{
                                background: '#ffc107',
                                color: 'black',
                                border: 'none',
                                padding: '10px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}>
                                数据统计
                            </button>
                        </div>
                    </div>

                    <div style={{
                        background: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>快速操作</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button style={{
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                padding: '10px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}>
                                查看日志
                            </button>
                            <button style={{
                                background: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                padding: '10px 15px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}>
                                备份数据
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    background: '#e9ecef',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: 0, color: '#666' }}>
                        🚀 超级管理员功能开发中，敬请期待更多功能...
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SuperAdminDashboard
