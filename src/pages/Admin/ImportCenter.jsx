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
  Spin
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
import axios from 'axios'
import apiClient from '../../services/apiClient'

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

  // 下载导入模板
  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token')
      // 直接使用axios实例，完全绕过响应拦截器
      // 创建一个临时的axios实例，不包含拦截器
      const tempAxios = axios.create({
        baseURL: apiClient.defaults.baseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      // 添加认证token
      tempAxios.defaults.headers.Authorization = `Bearer ${token}`
      
      const response = await tempAxios.request({
        method: 'GET',
        url: `/user-data/import-template?_t=${Date.now()}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        responseType: 'blob'
      })
      
      console.log('模板下载响应:', response)
      console.log('模板响应数据:', response.data)
      
      // 检查响应数据 - 修复Blob类型检查
      if (response.data === undefined || response.data === null) {
        throw new Error('服务器返回空数据')
      }
      
      // 对于Blob类型，检查size属性
      if (response.data instanceof Blob && response.data.size === 0) {
        throw new Error('服务器返回空文件')
      }
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
      
      console.log('创建的模板blob:', blob)
      console.log('模板blob大小:', blob.size)
      
      if (blob.size === 0) {
        throw new Error('生成的模板文件为空')
      }
      
      const url = window.URL.createObjectURL(blob)
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
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post('/user-data/validate-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        setValidationResult(response.data.data)
        setCurrentStep(2)
        message.success('文件验证完成')
      } else {
        message.error(response.data.message || '文件验证失败')
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
      const formData = new FormData()
      formData.append('file', fileList[0])
      formData.append('updateExisting', importSettings.updateExisting)
      formData.append('defaultPassword', importSettings.defaultPassword)
      
      const response = await apiClient.post('/user-data/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        setImportResult(response.data.data)
        setCurrentStep(4)
        message.success('数据导入完成')
        setImportModalVisible(false)
      } else {
        message.error(response.data.message || '数据导入失败')
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
    accept: '.csv',
    fileList,
    beforeUpload: (file) => {
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv')
      if (!isCSV) {
        message.error('只能上传 CSV 文件!')
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
        const colorMap = {
          'employee': 'blue',
          'manager': 'green',
          'executive': 'red'
        }
        return <Tag color={colorMap[levelKey] || 'default'}>{levelKey}</Tag>
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
              <p className="ant-upload-text">点击或拖拽 CSV 文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持单个文件上传，文件大小不超过 5MB
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
                      { label: '总记录数', value: importResult.total, type: 'info' },
                      { label: '成功导入', value: importResult.success, type: 'success' },
                      { label: '导入失败', value: importResult.failed, type: 'error' },
                      { label: '新建用户', value: importResult.created, type: 'success' },
                      { label: '更新用户', value: importResult.updated, type: 'success' }
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
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="更新已存在用户">
            <Tag color={importSettings.updateExisting ? 'green' : 'red'}>
              {importSettings.updateExisting ? '是' : '否'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="默认密码">
            {importSettings.defaultPassword}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Alert
          message="导入说明"
          description="导入过程中会创建新用户或更新已存在的用户信息，请确认配置无误后开始导入。"
          type="info"
          showIcon
        />
      </Modal>
    </div>
  )
}

export default ImportCenter
