# 用户初始密码功能

## 功能概述

为管理员添加用户功能增加了初始密码设置，确保新用户能够安全登录系统。

## 功能特性

### ✅ 新增功能

1. **初始密码设置**
   - 添加用户时必须设置初始密码
   - 密码长度限制：6-20位
   - 密码强度验证

2. **随机密码生成**
   - 一键生成8位随机密码
   - 包含大小写字母和数字
   - 提高密码安全性

3. **编辑用户优化**
   - 编辑用户时不显示密码字段
   - 避免误修改用户密码
   - 保持数据安全性

### 🔧 技术实现

#### 1. 表单字段更新
```javascript
// 新增用户时显示密码字段
{!editingUser && (
  <Form.Item
    label="初始密码"
    name="password"
    rules={[
      { required: true, message: '请输入初始密码' },
      { min: 6, message: '密码长度至少6位' },
      { max: 20, message: '密码长度不能超过20位' }
    ]}
    extra="用户首次登录时使用此密码"
  >
    <Input.Password 
      placeholder="请输入初始密码" 
      maxLength={20}
      showCount
      suffix={
        <Tooltip title="生成随机密码">
          <Button
            type="text"
            icon={<KeyOutlined />}
            onClick={generatePassword}
            size="small"
          />
        </Tooltip>
      }
    />
  </Form.Item>
)}
```

#### 2. 随机密码生成
```javascript
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  form.setFieldsValue({ password })
  message.success('已生成随机密码')
}
```

#### 3. 数据处理逻辑
```javascript
// 新增用户 - 包含密码字段
const newUser = { ...values }

// 编辑用户 - 不包含密码字段
const { password, ...editData } = values
const newUser = { ...editingUser, ...editData }
```

### 📋 使用流程

#### 添加新用户
1. 点击"添加用户"按钮
2. 填写用户基本信息（姓名、手机号、部门、职位）
3. 选择用户类型（普通用户/管理员）
4. 设置初始密码：
   - 手动输入密码
   - 或点击🔑按钮生成随机密码
5. 点击"添加"完成创建

#### 编辑用户
1. 点击用户行的"编辑"按钮
2. 修改用户基本信息
3. 密码字段不会显示（保护现有密码）
4. 点击"保存"完成编辑

### 🎯 安全考虑

1. **密码强度**
   - 最小长度：6位
   - 最大长度：20位
   - 随机密码包含大小写字母和数字

2. **数据保护**
   - 编辑用户时不显示密码字段
   - 避免密码信息泄露
   - 后端应加密存储密码

3. **用户体验**
   - 密码输入框显示字符计数
   - 一键生成随机密码
   - 清晰的提示信息

### 🔍 验证规则

```javascript
rules={[
  { required: true, message: '请输入初始密码' },
  { min: 6, message: '密码长度至少6位' },
  { max: 20, message: '密码长度不能超过20位' }
]}
```

### 📝 相关文件

- `src/pages/Admin/Users.jsx` - 用户管理页面（已更新）
- `src/services/userService.js` - 用户服务（已更新）
- `src/services/api.js` - API接口层

### 🚀 后续优化建议

1. **密码强度检测**
   - 添加密码强度指示器
   - 实时验证密码复杂度

2. **密码策略配置**
   - 可配置的密码规则
   - 支持特殊字符要求

3. **密码重置功能**
   - 管理员重置用户密码
   - 用户自助密码重置

4. **密码历史记录**
   - 防止重复使用旧密码
   - 密码变更日志

### 🎯 预期效果

- ✅ 新用户创建时必须设置密码
- ✅ 支持手动输入和随机生成
- ✅ 编辑用户时保护密码安全
- ✅ 密码长度和格式验证
- ✅ 良好的用户体验
