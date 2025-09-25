import React from 'react'
import {useState, useEffect, useRef} from 'react' 
import { useNavigate, Navigate } from 'react-router-dom'
import { message } from 'antd'
import styles from './index.module.scss'
import 'boxicons/css/boxicons.min.css'
import { AddSafeBottom } from '../../utils/hooks/useSafeArea'
import { useAuth } from '../../contexts/AuthContext'
import { passwordUtils } from '../../utils/passwordUtils'

const LoginPage = () => {
    const { login, isAuthenticated, loading: authLoading, user, loginSuperAdmin, isSuperAdmin } = useAuth()
    const containerRef = useRef(null)
    const FormRef = useRef(null)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [loginForm, setLoginForm] = useState({ phone: '', password: '' })
    const [registerForm, setRegisterForm] = useState({ username: '', password: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuperAdminLogin, setShowSuperAdminLogin] = useState(false)
    const [superAdminForm, setSuperAdminForm] = useState({ username: '', password: '' })
    

        // 应用安全底部样式
        useEffect(() => {
            if (containerRef.current) {
                const cleanup = AddSafeBottom(FormRef.current, 0); // 底部偏移量
                return cleanup; // 组件卸载时清理
            }
        }, []);
        
    // 如果已经登录，重定向到对应页面
    if (!authLoading && isAuthenticated) {
        const redirectPath = user?.isAdmin ? '/admin' : '/user'
        return <Navigate to={redirectPath} replace />
    }

    // 如果已经是超级管理员，重定向到管理员页面
    if (!authLoading && isSuperAdmin) {
        return <Navigate to="/admin" replace />
    }
    

    


    const handleLogin = async (e) => {
        e.preventDefault()
        
        // 防止重复提交
        if (isSubmitting) {
            return
        }
        
        if (!loginForm.phone) {
            message.warning('Please enter your phone number')
            return
        }
        
        if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
            message.warning('Please enter a valid phone number')
            return
        }

        setIsSubmitting(true)
        setLoading(true)
        
        try {
            // 对密码进行MD5加密
            const encryptedPassword = passwordUtils.encryptPassword(loginForm.password)
            const result = await login(loginForm.phone, encryptedPassword)
            if (result.success) {
                // 登录成功，AuthContext会自动处理重定向
                // 不需要额外处理，避免页面闪烁
            } else {
                message.error(result.message || 'Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            message.error('Login failed, please try again later')
        } finally {
            setLoading(false)
            setIsSubmitting(false)
        }
    }

    const handleRegister = (e) => {
        e.preventDefault()
        message.info('Registration is not available yet, please contact the administrator to register')
    }

    const handleSuperAdminLogin = async (e) => {
        e.preventDefault()
        
        if (isSubmitting) {
            return
        }
        
        if (!superAdminForm.username) {
            message.warning('请输入超级管理员用户名')
            return
        }
        
        if (!superAdminForm.password) {
            message.warning('请输入超级管理员密码')
            return
        }

        setIsSubmitting(true)
        setLoading(true)
        
        try {
            const result = await loginSuperAdmin(superAdminForm.username, superAdminForm.password)
            if (result.success) {
                // 登录成功，重定向到管理员页面
                navigate('/admin')
            } else {
                message.error(result.message || '超级管理员登录失败')
            }
        } catch (error) {
            console.error('Super admin login error:', error)
            message.error('超级管理员登录失败，请稍后重试')
        } finally {
            setLoading(false)
            setIsSubmitting(false)
        }
    }

    const ToRegisterForm = () => {
        if(containerRef.current){
            containerRef.current.classList.add('active')
            containerRef.current.dataset.isActive = 'true'
        }
    }

    const ToLoginForm = () => {
        if(containerRef.current){
            containerRef.current.classList.remove('active')
            containerRef.current.dataset.isActive = 'false'
        }
    }

    return (
        <div className={styles.container} ref={containerRef}>
                {/* 一体化表单 */}
                <div className={styles.Form} ref={FormRef}>

                    {/* 登录表单 */}
                    <div className={styles.LoginFormBox}>
                    <h1>⭐ 赞赞星 Login</h1>
                    <form className={styles.form} onSubmit={handleLogin}>
                        <div className={styles.inputBox}>
                            <input 
                                type="text" 
                                placeholder="Phone Number" 
                                value={loginForm.phone}
                                onChange={(e) => setLoginForm({...loginForm, phone: e.target.value})}
                                maxLength={11}
                            />
                            <i className="bx bxs-phone"></i>
                        </div>
                        <div className={styles.inputBox}>
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                            />
                            <i className="bx bxs-lock-alt"></i>
                        </div>
                        <button 
                            type="submit" 
                            className={styles.btn}
                            disabled={loading || isSubmitting}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        
                        {/* 测试账号提示 */}
                        <div style={{
                            marginTop: '20px',
                            fontSize: '12px',
                            color: '#666',
                            textAlign: 'center',
                            lineHeight: '1.4'
                        }}>
                        </div>
                        
                        {/* 超级管理员登录入口 - 不显眼 */}
                        <div style={{
                            marginTop: '15px',
                            textAlign: 'center'
                        }}>
                            <button 
                                type="button"
                                onClick={() => setShowSuperAdminLogin(!showSuperAdminLogin)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#999',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    opacity: 0.6
                                }}
                                title="超级管理员登录"
                            >
                                🔧 Admin
                            </button>
                        </div>
                    </form>
                    </div>

                    {/* 注册表单 */}
                    <div className={styles.RegisterFormBox}>
                        <h2>⭐ Register Account</h2>
                        {/* <form className={styles.form} onSubmit={handleRegister}>
                            <div className={styles.inputBox}>
                                <input 
                                    type="text" 
                                    placeholder="用户名" 
                                    value={registerForm.username}
                                    onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                                />
                                <i className="bx bxs-user"></i>
                            </div>
                            <div className={styles.inputBox}>
                                <input 
                                    type="password" 
                                    placeholder="密码" 
                                    value={registerForm.password}
                                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                                />
                                <i className="bx bxs-lock-alt"></i>
                            </div>
                            <button type="submit" className={styles.btn}>注册</button>
                            
                            <div style={{
                                marginTop: '20px',
                                fontSize: '12px',
                                color: '#666',
                                textAlign: 'center'
                            }}>
                                注册功能暂未开放<br/>
                                请使用测试账号体验系统
                            </div>
                        </form> */}
                        {/* 注册功能暂未开放 */}
                        <div style={{
                            marginTop: '100px',
                            fontSize: '18px',
                            color: '#666',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}>
                            注册功能暂未开放
                            请联系管理员进行注册
                        </div>
                    </div> 

                    {/* 超级管理员登录表单 */}
                    {showSuperAdminLogin && (
                        <div style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'white',
                            padding: '30px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            zIndex: 1000,
                            minWidth: '300px',
                            maxWidth: '400px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <h3 style={{ margin: 0, color: '#333' }}>🔧 超级管理员登录</h3>
                                <button 
                                    onClick={() => setShowSuperAdminLogin(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        color: '#999'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <form onSubmit={handleSuperAdminLogin}>
                                <div style={{ marginBottom: '15px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="超级管理员用户名" 
                                        value={superAdminForm.username}
                                        onChange={(e) => setSuperAdminForm({...superAdminForm, username: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '5px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <input 
                                        type="password" 
                                        placeholder="超级管理员密码" 
                                        value={superAdminForm.password}
                                        onChange={(e) => setSuperAdminForm({...superAdminForm, password: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '5px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading || isSubmitting}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: loading || isSubmitting ? '#ccc' : '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: loading || isSubmitting ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {loading ? '登录中...' : '超级管理员登录'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* 超级管理员登录遮罩层 */}
                    {showSuperAdminLogin && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 999
                        }} onClick={() => setShowSuperAdminLogin(false)} />
                    )}

                    {/* 动画模组 （幕布动画）*/} 
                    <div className={styles.toggleBox}> 
                        {/* 登录 */}
                        <div className={`${styles.togglePanel} ${styles.left}`}>
                            <h1>Welcome Back!</h1>
                            <p>No account yet?</p>
                            <button className={`${styles.btn} ${styles.registerBtn}`} onClick={ToRegisterForm}>Register</button>
                        </div>
                        {/* 注册 */}
                        <div className={`${styles.togglePanel} ${styles.right}`}>
                            <h1>Hello, Welcome!</h1>
                            <p>Already have an account?</p>
                            <button className={`${styles.btn} ${styles.loginBtn}`} onClick={ToLoginForm}>Login</button>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default LoginPage
