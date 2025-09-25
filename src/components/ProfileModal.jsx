import React, { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  message,
  Divider,
  Card,
  Row,
  Col,
  Tag,
  Avatar,
  Typography
} from 'antd'
import {
  UserOutlined,
  PhoneOutlined,
  LockOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../services/userService'

const { Title, Text } = Typography

const ProfileModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const { user, updateUser } = useAuth()

  // 处理密码修改
  const handlePasswordChange = async (values) => {
    try {
      setPasswordLoading(true)
      
      // 验证旧密码
      if (values.oldPassword === values.newPassword) {
        message.error('新密码不能与旧密码相同')
        return
      }
      
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的新密码不一致')
        return
      }

      // 调用API修改密码 - 使用统一的profile接口
      const response = await userService.updateProfile({
        password: values.newPassword,
        currentPassword: values.oldPassword
      })

      if (response.success) {
        message.success('密码修改成功')
        setEditingPassword(false)
        passwordForm.resetFields()
      } else {
        message.error(response.message || '密码修改失败')
      }
    } catch (error) {
      console.error('修改密码失败:', error)
      message.error('修改密码失败，请稍后重试')
    } finally {
      setPasswordLoading(false)
    }
  }

  // 取消密码修改
  const handleCancelPasswordEdit = () => {
    setEditingPassword(false)
    passwordForm.resetFields()
  }

  // 处理手机号码修改
  const handlePhoneChange = async (values) => {
    try {
      setLoading(true)
      
      // 验证新手机号是否与当前相同
      if (values.newPhone === user?.phone) {
        message.error('新手机号不能与当前手机号相同')
        return
      }

      // 调用API修改手机号
      const response = await userService.updateProfile({
        phone: values.newPhone,
        currentPassword: values.currentPassword
      })

      if (response.success) {
        message.success('手机号修改成功')
        setEditingPhone(false)
        form.resetFields()
        // 更新本地用户信息
        updateUser({ ...user, phone: values.newPhone })
      } else {
        message.error(response.message || '手机号修改失败')
      }
    } catch (error) {
      console.error('修改手机号失败:', error)
      message.error('修改手机号失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 取消手机号修改
  const handleCancelPhoneEdit = () => {
    setEditingPhone(false)
    form.resetFields()
  }

  // 处理个人信息更新
  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true)
      
      const response = await userService.updateProfile(values)
      
      if (response.success) {
        message.success('个人信息更新成功')
        // 更新本地用户信息
        updateUser(response.data)
        onCancel()
      } else {
        message.error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('更新个人信息失败:', error)
      message.error('更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="个人信息"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <div style={{ padding: '16px 0' }}>
         {/* 用户基本信息展示 */}
         <Card 
           title={
             <Space>
               <UserOutlined />
               个人信息
             </Space>
           }
           size="small" 
           style={{ marginBottom: 24 }}
           extra={
             !editingPhone ? (
               <Button 
                 type="link" 
                 icon={<EditOutlined />}
                 onClick={() => setEditingPhone(true)}
               >
                 修改手机号
               </Button>
             ) : (
               <Space>
                 <Button 
                   type="link" 
                   icon={<CheckOutlined />}
                   onClick={() => form.submit()}
                   loading={loading}
                 >
                   保存
                 </Button>
                 <Button 
                   type="link" 
                   icon={<CloseOutlined />}
                   onClick={handleCancelPhoneEdit}
                 >
                   取消
                 </Button>
               </Space>
             )
           }
         >
           {editingPhone ? (
             <Form
               form={form}
               layout="vertical"
               onFinish={handlePhoneChange}
               autoComplete="off"
             >
               <Form.Item
                 label="当前手机号"
                 name="currentPhone"
                 initialValue={user?.phone}
               >
                 <Input 
                   disabled
                   prefix={<PhoneOutlined />}
                 />
               </Form.Item>

               <Form.Item
                 label="新手机号"
                 name="newPhone"
                 rules={[
                   { required: true, message: '请输入新手机号' },
                   { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                 ]}
               >
                 <Input 
                   placeholder="请输入新手机号"
                   prefix={<PhoneOutlined />}
                   maxLength={11}
                 />
               </Form.Item>

               <Form.Item
                 label="当前密码"
                 name="currentPassword"
                 rules={[
                   { required: true, message: '请输入当前密码以验证身份' },
                   { min: 6, message: '密码长度至少6位' }
                 ]}
               >
                 <Input.Password 
                   placeholder="请输入当前密码"
                   prefix={<LockOutlined />}
                 />
               </Form.Item>
             </Form>
           ) : (
             <Row gutter={[16, 16]} align="middle">
               <Col>
                 <Avatar 
                   size={64} 
                   icon={<UserOutlined />}
                   style={{ 
                     backgroundColor: user?.isAdmin ? '#ff4d4f' : '#1890ff',
                     fontSize: '24px'
                   }}
                 />
               </Col>
               <Col flex={1}>
                 <div>
                   <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                     {user?.name}
                     {user?.isAdmin && (
                       <Tag color="red" size="small" style={{ marginLeft: 8 }}>
                         管理员
                       </Tag>
                     )}
                   </Title>
                   <Text type="secondary">
                     <PhoneOutlined style={{ marginRight: 4 }} />
                     {user?.phone}
                   </Text>
                   <br />
                   <Text type="secondary">
                     🏢 {user?.department} · {user?.position}
                   </Text>
                 </div>
               </Col>
             </Row>
           )}
         </Card>

        {/* 密码修改区域 */}
        <Card 
          title={
            <Space>
              <LockOutlined />
              修改密码
            </Space>
          }
          size="small"
          style={{ marginBottom: 24 }}
          extra={
            !editingPassword ? (
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => setEditingPassword(true)}
              >
                修改
              </Button>
            ) : (
              <Space>
                <Button 
                  type="link" 
                  icon={<CheckOutlined />}
                  onClick={() => passwordForm.submit()}
                  loading={passwordLoading}
                >
                  保存
                </Button>
                <Button 
                  type="link" 
                  icon={<CloseOutlined />}
                  onClick={handleCancelPasswordEdit}
                >
                  取消
                </Button>
              </Space>
            )
          }
        >
          {editingPassword ? (
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
              autoComplete="off"
            >
              <Form.Item
                label="当前密码"
                name="oldPassword"
                rules={[
                  { required: true, message: '请输入当前密码' },
                  { min: 6, message: '密码长度至少6位' }
                ]}
              >
                <Input.Password 
                  placeholder="请输入当前密码"
                  prefix={<LockOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度至少6位' },
                  { max: 20, message: '密码长度不能超过20位' }
                ]}
              >
                <Input.Password 
                  placeholder="请输入新密码"
                  prefix={<LockOutlined />}
                />
              </Form.Item>

              <Form.Item
                label="确认新密码"
                name="confirmPassword"
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password 
                  placeholder="请再次输入新密码"
                  prefix={<LockOutlined />}
                />
              </Form.Item>
            </Form>
          ) : (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#fafafa', 
              borderRadius: '6px',
              textAlign: 'center',
              color: '#666'
            }}>
              <LockOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
              <div>点击"修改"按钮来更改您的密码</div>
            </div>
          )}
        </Card>

         {/* 账号信息说明 */}
         <Card 
           title="账号信息" 
           size="small"
           style={{ marginBottom: 24 }}
         >
           <div style={{ color: '#666', lineHeight: '1.6' }}>
             <p style={{ margin: 0, marginBottom: 8 }}>
               <strong>登录账号：</strong>您的手机号码 ({user?.phone})
             </p>
             <p style={{ margin: 0, marginBottom: 8 }}>
               <strong>密码：</strong>用于登录系统的安全凭证
             </p>
             <p style={{ margin: 0, marginBottom: 8 }}>
               <strong>修改说明：</strong>
             </p>
             <ul style={{ margin: 0, paddingLeft: 20, color: '#999', fontSize: '12px' }}>
               <li>修改手机号需要输入当前密码进行身份验证</li>
               <li>修改密码需要输入当前密码进行验证</li>
               <li>手机号修改后，下次登录需要使用新手机号</li>
             </ul>
           </div>
         </Card>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              关闭
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  )
}

export default ProfileModal
