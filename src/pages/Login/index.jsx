import React from 'react'
import {useState, useEffect, useRef} from 'react' 
import { useNavigate, Navigate } from 'react-router-dom'
import { message } from 'antd'
import styles from './index.module.scss'
import 'boxicons/css/boxicons.min.css'
import { AddSafeBottom } from '../../utils/hooks/useSafeArea'
import { useAuth } from '../../contexts/AuthContext'

const LoginPage = () => {
    const { login, isAuthenticated, loading: authLoading, user } = useAuth()
    const containerRef = useRef(null)
    const FormRef = useRef(null)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [loginForm, setLoginForm] = useState({ phone: '', password: '' })
    const [registerForm, setRegisterForm] = useState({ username: '', password: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    

        // 应用安全底部样式
        useEffect(() => {
            if (containerRef.current) {
                const cleanup = AddSafeBottom(FormRef.current, 65); // 65px是底部偏移量
                return cleanup; // 组件卸载时清理
            }
        }, []);
        
    // 如果已经登录，重定向到对应页面
    if (!authLoading && isAuthenticated) {
        const redirectPath = user?.isAdmin ? '/admin' : '/user'
        return <Navigate to={redirectPath} replace />
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
            const result = await login(loginForm.phone, loginForm.password)
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
