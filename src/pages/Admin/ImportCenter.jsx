import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Upload,
  Button,
  message,
  Progress,
  Table,
  Tag,
  Space,
  Alert,
  Divider,
  Typography,
  Steps,
  Modal,
  Descriptions,
  Spin,
  Switch,
  Input,
  Form
} from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  InboxOutlined
} from '@ant-design/icons'
import { userService } from '../../services/userService'

const { Title, Text, Paragraph } = Typography
const { Dragger } = Upload
const { Step } = Steps

const ImportCenter = () => {
  const [uploading, setUploading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [fileList, setFileList] = useState([])
  const [validationResult, setValidationResult] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [importSettings, setImportSettings] = useState({
    updateExisting: false,
    defaultPassword: '123456'
  })

  // 重置导入状态
  const resetImportState = () => {
    setUploading(false)
    setValidating(false)
    setCurrentStep(0)
    setFileList([])
    setValidationResult(null)
    setImportResult(null)
    setImportModalVisible(false)
    setImportSettings({
      updateExisting: false,
      defaultPassword: '123456'
    })
  }

  // 下载导入模板
  const downloadTemplate = async () => {
    try {
      const blob = await userService.downloadImportTemplate()
      
      console.log('模板下载响应:', blob)
      console.log('模板响应数据:', blob)
      
      // 检查响应数据 - 修复Blob类型检查
      if (blob === undefined || blob === null) {
        throw new Error('服务器返回空数据')
      }
      
      // 对于Blob类型，检查size属性
      if (blob instanceof Blob && blob.size === 0) {
        throw new Error('服务器返回空文件')
      }
      
      const csvBlob = new Blob([blob], { type: 'text/csv;charset=utf-8' })
      
      console.log('创建的模板blob:', csvBlob)
      console.log('模板blob大小:', csvBlob.size)
      
      if (csvBlob.size === 0) {
        throw new Error('生成的模板文件为空')
      }
      
      const url = window.URL.createObjectURL(csvBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `user_import_template_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      message.success('模板下载成功')
    } catch (error) {
      console.error('下载模板失败:', error)
      message.error(`下载模板失败: ${error.message}`)
    }
  }

  // 验证文件
  const validateFile = async (file) => {
    setValidating(true)
    setCurrentStep(1)
    
    try {
      const response = await userService.validateImportFile(file)
      
      console.log('验证响应:', response)
      
      if (response.success) {
        setValidationResult(response.data)
        setCurrentStep(2)
        message.success('文件验证完成')
      } else {
        message.error(response.message || '文件验证失败')
      }
    } catch (error) {
      console.error('验证文件失败:', error)
      message.error('文件验证失败')
    } finally {
      setValidating(false)
    }
  }

  // 执行导入
  const executeImport = async () => {
    if (!fileList[0]) {
      message.error('请先选择文件')
      return
    }

    setUploading(true)
    setCurrentStep(3)
    
    try {
      const response = await userService.importUsers(fileList[0], {
        updateExisting: importSettings.updateExisting,
        defaultPassword: importSettings.defaultPassword
      })
      
      console.log('导入响应:', response)
      
      if (response.success) {
        setImportResult(response.data)
        setCurrentStep(4)
        message.success('数据导入完成')
        setImportModalVisible(false)
        
        // 延迟重置状态，让用户看到导入结果
        setTimeout(() => {
          resetImportState()
        }, 3000) // 3秒后自动重置
      } else {
        message.error(response.message || '数据导入失败')
      }
    } catch (error) {
      console.error('导入数据失败:', error)
      message.error('数据导入失败')
    } finally {
      setUploading(false)
    }
  }

  // 上传配置
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.csv,.xlsx,.xls',
    fileList,
    beforeUpload: (file) => {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      const allowedExtensions = ['.csv', '.xlsx', '.xls']
      
      const isValidType = allowedTypes.includes(file.type) || 
                         allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      
      if (!isValidType) {
        message.error('只能上传 CSV、XLSX、XLS 文件!')
        return false
      }
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('文件大小不能超过 5MB!')
        return false
      }
      setFileList([file])
      validateFile(file)
      return false // 阻止自动上传
    },
    onRemove: () => {
      setFileList([])
      setValidationResult(null)
      setImportResult(null)
      setCurrentStep(0)
    }
  }

  // 验证结果表格列
  const validationColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: '分配类型',
      dataIndex: 'levelKey',
      key: 'levelKey',
      render: (levelKey) => {
        const levelMap = {
          'employee': '员工',
          'manager': '部门负责人',
          'executive': '高管'
        }
        const colorMap = {
          'employee': 'blue',
          'manager': 'green',
          'executive': 'red'
        }
        return <Tag color={colorMap[levelKey] || 'default'}>{levelMap[levelKey] || levelKey}</Tag>
      }
    },
    {
      title: '月度分配',
      dataIndex: 'monthlyAllocation',
      key: 'monthlyAllocation'
    }
  ]

  // 导入结果表格列
  const importResultColumns = [
    {
      title: '项目',
      dataIndex: 'label',
      key: 'label'
    },
    {
      title: '数量',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => {
        const color = record.type === 'success' ? 'green' : 
                     record.type === 'error' ? 'red' : 'blue'
        return <Tag color={color}>{value}</Tag>
      }
    }
  ]

  return (
    <div>
      <Title level={2}>导入中心</Title>
      <Paragraph>
        支持批量导入用户数据，包括用户基本信息、分配规则和赞赞星统计数据。
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* 导入步骤 */}
        <Col span={24}>
          <Card title="导入流程" className="card-shadow">
            <Steps current={currentStep} size="small">
              <Step title="选择文件" icon={<UploadOutlined />} />
              <Step title="验证文件" icon={<FileTextOutlined />} />
              <Step title="确认导入" icon={<CheckCircleOutlined />} />
              <Step title="执行导入" icon={<InboxOutlined />} />
              <Step title="完成" icon={<CheckCircleOutlined />} />
            </Steps>
          </Card>
        </Col>

        {/* 文件上传区域 */}
        <Col span={24}>
          <Card title="文件上传" className="card-shadow">
            <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 CSV、XLSX、XLS 文件，单个文件大小不超过 5MB
              </p>
            </Dragger>
            
            <Space>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={downloadTemplate}
              >
                下载导入模板
              </Button>
              <Button 
                type="primary"
                icon={<InfoCircleOutlined />}
                onClick={() => setImportModalVisible(true)}
                disabled={!validationResult?.isValid}
              >
                配置导入选项
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 验证结果 */}
        {validationResult && (
          <Col span={24}>
            <Card title="验证结果" className="card-shadow">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Alert
                    message={validationResult.isValid ? '文件验证通过' : '文件验证失败'}
                    description={`总计 ${validationResult.totalRows} 行，有效 ${validationResult.validRows} 行，无效 ${validationResult.invalidRows} 行`}
                    type={validationResult.isValid ? 'success' : 'error'}
                    showIcon
                  />
                </Col>
                
                {validationResult.errors.length > 0 && (
                  <Col span={24}>
                    <Alert
                      message="错误信息"
                      description={
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {validationResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      }
                      type="error"
                      showIcon
                    />
                  </Col>
                )}
                
                {validationResult.warnings.length > 0 && (
                  <Col span={24}>
                    <Alert
                      message="警告信息"
                      description={
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      }
                      type="warning"
                      showIcon
                    />
                  </Col>
                )}
                
                {validationResult.sampleData.length > 0 && (
                  <Col span={24}>
                    <Title level={5}>示例数据预览</Title>
                    <Table
                      columns={validationColumns}
                      dataSource={validationResult.sampleData}
                      rowKey={(record, index) => `validation-${index}`}
                      pagination={false}
                      size="small"
                    />
                  </Col>
                )}
              </Row>
            </Card>
          </Col>
        )}

        {/* 导入结果 */}
        {importResult && (
          <Col span={24}>
            <Card title="导入结果" className="card-shadow">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Alert
                    message="导入完成"
                    description={`成功导入 ${importResult.success} 条记录，失败 ${importResult.failed} 条记录`}
                    type={importResult.failed === 0 ? 'success' : 'warning'}
                    showIcon
                  />
                </Col>
                
                <Col span={12}>
                  <Table
                    columns={importResultColumns}
                    dataSource={[
                      { key: 'total', label: '总记录数', value: importResult.total, type: 'info' },
                      { key: 'success', label: '成功导入', value: importResult.success, type: 'success' },
                      { key: 'failed', label: '导入失败', value: importResult.failed, type: 'error' },
                      { key: 'created', label: '新建用户', value: importResult.created, type: 'success' },
                      { key: 'updated', label: '更新用户', value: importResult.updated, type: 'success' }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Col>
                
                {importResult.errors.length > 0 && (
                  <Col span={24}>
                    <Alert
                      message="错误详情"
                      description={
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {importResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      }
                      type="error"
                      showIcon
                    />
                  </Col>
                )}
                
                {/* 重置按钮 */}
                <Col span={24}>
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button 
                      type="primary" 
                      onClick={resetImportState}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 24px',
                        height: 'auto',
                        fontWeight: '500'
                      }}
                    >
                      重新开始导入
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        )}
      </Row>

      {/* 导入配置弹窗 */}
      <Modal
        title="导入配置"
        open={importModalVisible}
        onOk={executeImport}
        onCancel={() => setImportModalVisible(false)}
        confirmLoading={uploading}
        okText="开始导入"
        cancelText="取消"
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="更新已存在用户">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Switch
                checked={importSettings.updateExisting}
                onChange={(checked) => setImportSettings(prev => ({
                  ...prev,
                  updateExisting: checked
                }))}
              />
              <span style={{ color: '#666' }}>
                {importSettings.updateExisting ? '是' : '否'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              开启后，如果用户已存在，将更新其信息；关闭后，将跳过已存在的用户
            </div>
          </Form.Item>
          
          <Form.Item label="默认密码">
            <Input
              value={importSettings.defaultPassword}
              onChange={(e) => setImportSettings(prev => ({
                ...prev,
                defaultPassword: e.target.value
              }))}
              placeholder="请输入默认密码"
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              新用户的初始密码，建议使用强密码
            </div>
          </Form.Item>
        </Form>
        
        <Divider />
        
        <Alert
          message="导入说明"
          description={
            <div>
              <p>• 导入过程中会创建新用户或更新已存在的用户信息</p>
              <p>• 请确认配置无误后开始导入</p>
              <p>• 建议先下载模板，按照模板格式填写数据</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Modal>
    </div>
  )
}

export default ImportCenter
