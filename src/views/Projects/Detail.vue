<template>
  <div class="project-detail-page">
    <!-- 返回按钮 -->
    <div class="back-nav">
      <button class="btn btn-link" @click="handleBack">
        <span class="btn-icon">←</span>
        返回项目列表
      </button>
    </div>

    <div v-if="loading" class="loading">
      <span>加载中...</span>
    </div>

    <div v-else>
      <!-- 项目基本信息 -->
      <div class="info-card">
        <div class="card-header">
          <h2 class="card-title">项目信息</h2>
          <div class="header-actions">
            <span :class="['status-tag', project.status]">
              {{ getStatusText(project.status) }}
            </span>
            <button v-if="project.status === 'ongoing'" class="btn btn-primary" @click="handleEndProject">
              结束项目
            </button>
            <button v-if="project.status === 'ended'" class="btn btn-success" @click="handleSettleProject">
              发起结算
            </button>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">项目编号</span>
            <span class="info-value">{{ project.projectId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">项目名称</span>
            <span class="info-value">{{ project.name }}</span>
          </div>
          <div class="info-item span-full">
            <span class="info-label">项目描述</span>
            <span class="info-value">{{ project.description || '暂无描述' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">开始日期</span>
            <span class="info-value">{{ project.startDate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">结束日期</span>
            <span class="info-value">{{ project.endDate || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建人</span>
            <span class="info-value">{{ project.createdBy?.name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ formatDate(project.createdAt) }}</span>
          </div>
          <div v-if="project.settlementAmount" class="info-item span-full">
            <span class="info-label">结算金额</span>
            <span class="info-value settlement-amount">¥{{ formatAmount(project.settlementAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- 参与人员 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">参与人员（{{ employees.length }}人）</h3>
          <button class="btn btn-link" @click="handleAddEmployee">
            <span class="btn-icon">+</span>
            添加人员
          </button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th width="120">工号</th>
              <th width="120">姓名</th>
              <th width="100">类型</th>
              <th width="150">部门</th>
              <th width="150">项目角色</th>
              <th width="180">加入时间</th>
              <th width="100">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in employees" :key="emp.id">
              <td>{{ emp.employeeId }}</td>
              <td class="font-bold">{{ emp.name }}</td>
              <td>
                <span :class="['type-tag', getTypeClass(emp.type)]">
                  {{ getTypeText(emp.type) }}
                </span>
              </td>
              <td>{{ emp.department }}</td>
              <td>{{ emp.roleInProject }}</td>
              <td>{{ formatDate(emp.linkedAt) }}</td>
              <td>
                <button class="btn-link btn-delete" @click="handleRemoveEmployee(emp)">移除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 使用设备 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">使用设备（{{ devices.length }}台）</h3>
          <button class="btn btn-link" @click="handleAddDevice">
            <span class="btn-icon">+</span>
            添加设备
          </button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th width="120">设备编号</th>
              <th>设备名称</th>
              <th width="120">型号</th>
              <th width="140">折旧单价 (元/小时)</th>
              <th width="180">关联时间</th>
              <th width="100">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in devices" :key="device.id">
              <td>{{ device.deviceId }}</td>
              <td class="font-bold">{{ device.name }}</td>
              <td>{{ device.model }}</td>
              <td>¥{{ device.depreciationRate }}/小时</td>
              <td>{{ formatDate(device.linkedAt) }}</td>
              <td>
                <button class="btn-link btn-delete" @click="handleRemoveDevice(device)">移除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 操作日志 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">操作日志</h3>
        </div>

        <div class="timeline">
          <div v-for="log in logs" :key="log.id" :class="['timeline-item', log.type]">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-type">{{ getLogTypeText(log.type) }}</span>
                <span class="timeline-time">{{ formatDate(log.time) }}</span>
              </div>
              <div class="timeline-operator">操作人：{{ log.operator }}</div>
              <div v-if="log.details" class="timeline-details">
                <span v-for="(value, key) in log.details" :key="key" class="detail-tag">
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加人员对话框 -->
    <div v-if="addEmployeeDialogVisible" class="modal-overlay" @click.self="addEmployeeDialogVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">添加项目人员</h3>
          <button class="modal-close" @click="addEmployeeDialogVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form">
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                选择员工
              </label>
              <select class="form-select" v-model="addEmployeeForm.employeeId">
                <option value="">请选择员工</option>
                <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">
                  {{ emp.name }} ({{ emp.employeeId }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">项目角色</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="addEmployeeForm.roleInProject"
                placeholder="如：项目负责人、核心开发"
              />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="addEmployeeDialogVisible = false">取消</button>
          <button class="btn btn-primary" @click="handleConfirmAddEmployee">确认添加</button>
        </div>
      </div>
    </div>

    <!-- 添加设备对话框 -->
    <div v-if="addDeviceDialogVisible" class="modal-overlay" @click.self="addDeviceDialogVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">添加项目设备</h3>
          <button class="modal-close" @click="addDeviceDialogVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form">
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                选择设备
              </label>
              <select class="form-select" v-model="addDeviceForm.deviceId">
                <option value="">请选择设备</option>
                <option v-for="device in allDevices" :key="device.id" :value="device.id">
                  {{ device.name }} ({{ device.deviceId }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                折旧单价 (元/小时)
              </label>
              <input 
                type="number" 
                class="form-input" 
                v-model="addDeviceForm.depreciationRate"
                min="0"
                step="0.01"
              />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="addDeviceDialogVisible = false">取消</button>
          <button class="btn btn-primary" @click="handleConfirmAddDevice">确认添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const projectId = ref('')

// 项目信息
const project = ref({
  id: 0,
  projectId: '',
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'ongoing',
  settlementAmount: null,
  createdBy: { name: '' },
  createdAt: ''
})

// 人员列表
const employees = ref([])
const allEmployees = ref([])
const addEmployeeDialogVisible = ref(false)
const addEmployeeForm = reactive({
  employeeId: '',
  roleInProject: ''
})

// 设备列表
const devices = ref([])
const allDevices = ref([])
const addDeviceDialogVisible = ref(false)
const addDeviceForm = reactive({
  deviceId: '',
  depreciationRate: 0
})

// 操作日志
const logs = ref([])

// Mock 数据
const mockProject = {
  id: 1,
  projectId: 'PRJ202601001',
  name: '智能客服系统研发',
  description: '新一代 AI 驱动的智能客服平台，集成自然语言处理与知识图谱技术，实现智能问答、工单自动分配等功能。',
  startDate: '2026-01-10',
  endDate: '2026-02-15',
  status: 'ended',
  settlementAmount: null,
  createdBy: { id: 1, name: '张伟' },
  createdAt: '2026-01-05T14:30:00.000+08:00'
}

const mockEmployees = [
  { id: 1, employeeId: 'EMP001', name: '张伟', type: 'formal', department: '研发部', roleInProject: '项目负责人', linkedAt: '2026-01-05T14:30:00.000+08:00' },
  { id: 2, employeeId: 'EMP002', name: '李娜', type: 'formal', department: '研发部', roleInProject: '核心开发', linkedAt: '2026-01-06T09:00:00.000+08:00' },
  { id: 3, employeeId: 'EMP003', name: '王强', type: 'outsourcing', department: '外部合作', roleInProject: '算法工程师', linkedAt: '2026-01-08T10:30:00.000+08:00' }
]

const mockDevices = [
  { id: 1, deviceId: 'DEV001', name: 'GPU 服务器 A', model: 'NVIDIA DGX', depreciationRate: '150.00', linkedAt: '2026-01-05T14:30:00.000+08:00' },
  { id: 2, deviceId: 'DEV002', name: '测试手机 iPhone15', model: 'iPhone 15 Pro', depreciationRate: '5.00', linkedAt: '2026-01-10T11:00:00.000+08:00' }
]

const mockLogs = [
  { id: 1, type: 'create', operator: '张伟', time: '2026-01-05T14:30:00.000+08:00', details: { employeeCount: 3, deviceCount: 2 } },
  { id: 2, type: 'link_employee', operator: '张伟', time: '2026-01-06T09:00:00.000+08:00', details: { employee_name: '李娜' } },
  { id: 3, type: 'link_device', operator: '张伟', time: '2026-01-10T11:00:00.000+08:00', details: { device_name: '测试手机 iPhone15', depreciation_rate: '5.00' } },
  { id: 4, type: 'end', operator: '张伟', time: '2026-02-15T16:30:00.000+08:00', details: { end_date: '2026-02-15' } }
]

// 工具函数
const getStatusText = (status) => {
  const textMap = { ongoing: '进行中', ended: '已结束', settled: '已结算' }
  return textMap[status] || status
}

const getTypeClass = (type) => {
  const map = { formal: 'type-formal', part_time: 'type-part', outsourcing: 'type-out' }
  return map[type] || ''
}

const getTypeText = (type) => {
  const textMap = { formal: '正式', part_time: '兼职', outsourcing: '外包' }
  return textMap[type] || type
}

const getLogTypeText = (type) => {
  const textMap = {
    create: '创建项目', end: '结束项目', settle: '发起结算',
    link_employee: '添加成员', link_device: '添加设备',
    unlink_employee: '移除成员', unlink_device: '移除设备', update: '更新信息'
  }
  return textMap[type] || type
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatAmount = (amount) => amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// 加载数据
const loadProjectDetail = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    project.value = mockProject
    employees.value = mockEmployees
    devices.value = mockDevices
    logs.value = mockLogs
  } catch (error) {
    alert('加载项目详情失败')
  } finally {
    loading.value = false
  }
}

const loadOptions = async () => {
  allEmployees.value = [
    { id: 4, employeeId: 'EMP004', name: '赵敏', type: 'formal' },
    { id: 5, employeeId: 'EMP005', name: '孙磊', type: 'part_time' },
    { id: 6, employeeId: 'EMP006', name: '周杰', type: 'formal' }
  ]
  allDevices.value = [
    { id: 3, deviceId: 'DEV003', name: 'MacBook Pro', model: 'M3 Max', depreciationRate: 8.00 },
    { id: 4, deviceId: 'DEV004', name: '测试平板', model: 'iPad Pro', depreciationRate: 3.00 }
  ]
}

// 返回
const handleBack = () => router.push('/projects/list')

// 结束项目
const handleEndProject = async () => {
  if (confirm('确定要结束这个项目吗？结束后将无法再添加人员和设备。')) {
    alert('项目已结束（Mock）')
    project.value.status = 'ended'
    project.value.endDate = new Date().toISOString().split('T')[0]
  }
}

// 发起结算
const handleSettleProject = () => router.push(`/projects/${project.value.id}/settlement`)

// 添加员工
const handleAddEmployee = () => {
  addEmployeeForm.employeeId = ''
  addEmployeeForm.roleInProject = ''
  addEmployeeDialogVisible.value = true
}

const handleConfirmAddEmployee = () => {
  if (!addEmployeeForm.employeeId) {
    alert('请选择员工')
    return
  }
  const emp = allEmployees.value.find(e => e.id === addEmployeeForm.employeeId)
  if (emp) {
    employees.value.push({ ...emp, roleInProject: addEmployeeForm.roleInProject, linkedAt: new Date().toISOString() })
    alert('添加成功')
    addEmployeeDialogVisible.value = false
  }
}

const handleRemoveEmployee = async (row) => {
  if (confirm(`确定要移除 ${row.name} 吗？`)) {
    employees.value = employees.value.filter(e => e.id !== row.id)
    alert('移除成功')
  }
}

// 添加设备
const handleAddDevice = () => {
  addDeviceForm.deviceId = ''
  addDeviceForm.depreciationRate = 0
  addDeviceDialogVisible.value = true
}

const handleConfirmAddDevice = () => {
  if (!addDeviceForm.deviceId) {
    alert('请选择设备')
    return
  }
  const device = allDevices.value.find(d => d.id === addDeviceForm.deviceId)
  if (device) {
    devices.value.push({ ...device, depreciationRate: addDeviceForm.depreciationRate, linkedAt: new Date().toISOString() })
    alert('添加成功')
    addDeviceDialogVisible.value = false
  }
}

const handleRemoveDevice = async (row) => {
  if (confirm(`确定要移除 ${row.name} 吗？`)) {
    devices.value = devices.value.filter(d => d.id !== row.id)
    alert('移除成功')
  }
}

onMounted(() => {
  projectId.value = route.params.id
  loadProjectDetail()
  loadOptions()
})
</script>

<style scoped lang="scss">
.project-detail-page {
  padding: 40px;
  min-height: calc(100vh - 80px);
  background: #f4f4f4;
}

.back-nav {
  margin-bottom: 24px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #9a9fa5;
}

// 信息卡片
.info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #272b30;
      margin: 0;
    }
  }
}

// 信息网格
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  .info-item {
    &.span-full {
      grid-column: span 2;
    }

    .info-label {
      display: block;
      font-size: 13px;
      color: #9a9fa5;
      margin-bottom: 6px;
    }

    .info-value {
      font-size: 14px;
      color: #272b30;
    }

    .settlement-amount {
      font-size: 20px;
      font-weight: 600;
      color: #0d9f5f;
    }
  }
}

// 状态标签
.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;

  &.ongoing {
    background: #f6ffed;
    color: #52c41a;
  }

  &.ended {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.settled {
    background: #e6f7ff;
    color: #1890ff;
  }
}

// 时间线
.timeline {
  .timeline-item {
    position: relative;
    padding-left: 30px;
    padding-bottom: 24px;

    &:last-child {
      padding-bottom: 0;
    }

    .timeline-dot {
      position: absolute;
      left: 0;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #252833;
    }

    &.create .timeline-dot { background: #52c41a; }
    &.end .timeline-dot { background: #fa8c16; }
    &.settle .timeline-dot { background: #1890ff; }
    &.link_employee .timeline-dot { background: #252833; }
    &.link_device .timeline-dot { background: #252833; }
    &.unlink_employee .timeline-dot, &.unlink_device .timeline-dot { background: #ff4d4f; }

    .timeline-content {
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        .timeline-type {
          font-weight: 600;
          color: #272b30;
        }

        .timeline-time {
          font-size: 13px;
          color: #9a9fa5;
        }
      }

      .timeline-operator {
        font-size: 13px;
        color: #9a9fa5;
        margin-bottom: 8px;
      }

      .timeline-details {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .detail-tag {
          background: #f4f4f4;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          color: #6f767e;
        }
      }
    }
  }
}

// 表格
.data-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 14px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #595959;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
  }

  td {
    padding: 14px 12px;
    font-size: 14px;
    color: #272b30;
    border-bottom: 1px solid #f0f0f0;
  }

  tr:hover td {
    background: #f5f5f5;
  }

  .font-bold {
    font-weight: 600;
  }

  .type-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 13px;

    &.type-formal { background: #f6ffed; color: #52c41a; }
    &.type-part { background: #fff7e6; color: #fa8c16; }
    &.type-out { background: #e6f7ff; color: #1890ff; }
  }
}

// 按钮
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  .btn-icon { font-size: 16px; font-weight: bold; }

  &.btn-primary { background: #252833; color: white; &:hover { background: #3d4152; } }
  &.btn-success { background: #52c41a; color: white; &:hover { background: #73d13d; } }
  &.btn-outline { background: white; color: #272b30; border: 1px solid #d9d9d9; &:hover { border-color: #252833; color: #252833; } }
  &.btn-link { background: none; border: none; color: #1890ff; padding: 4px 8px; cursor: pointer; font-size: 14px; &:hover { color: #40a9ff; } }
  &.btn-delete { color: #ff4d4f; &:hover { background: #fff1f0; } }
}

// 弹窗
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;

  .modal-title { font-size: 18px; font-weight: 600; color: #272b30; margin: 0; }

  .modal-close {
    background: none;
    border: none;
    font-size: 28px;
    color: #9a9fa5;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    &:hover { background: #f5f5f5; color: #272b30; }
  }
}

.modal-body { padding: 24px; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f0f0f0;
}

// 表单
.form {
  .form-group {
    margin-bottom: 20px;
    &:last-child { margin-bottom: 0; }

    .form-label {
      display: block;
      font-size: 14px;
      color: #272b30;
      margin-bottom: 8px;
      font-weight: 500;
      .required { color: #ff4d4f; margin-right: 2px; }
    }

    .form-input, .form-select {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      font-size: 14px;
      color: #272b30;
      background: white;
      &:focus { outline: none; border-color: #252833; box-shadow: 0 0 0 2px rgba(37, 40, 51, 0.1); }
      &::placeholder { color: #9a9fa5; }
    }
  }
}

// 头部按钮
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>