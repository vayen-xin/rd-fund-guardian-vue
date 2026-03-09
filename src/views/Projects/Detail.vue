<template>
  <div class="project-detail-page">
    <!-- 返回按钮 -->
    <div class="back-nav">
      <el-button link type="primary" icon="ArrowLeft" @click="handleBack">
        返回项目列表
      </el-button>
    </div>

    <div v-loading="loading">
      <!-- 项目基本信息 -->
      <div class="info-card">
        <div class="card-header">
          <h2 class="card-title">项目信息</h2>
          <div class="header-actions">
            <el-tag :type="getStatusType(project.status)" size="large">
              {{ getStatusText(project.status) }}
            </el-tag>
            <el-button v-if="project.status === 'ongoing'" type="primary" @click="handleEndProject">
              结束项目
            </el-button>
            <el-button v-if="project.status === 'ended'" type="success" @click="handleSettleProject">
              发起结算
            </el-button>
          </div>
        </div>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目编号">{{ project.projectId }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
          <el-descriptions-item label="项目描述" :span="2">
            {{ project.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ project.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">
            {{ project.endDate || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ project.createdBy?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(project.createdAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="project.settlementAmount" label="结算金额" :span="2">
            <span class="settlement-amount">¥{{ formatAmount(project.settlementAmount) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 参与人员 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">参与人员（{{ employees.length }}人）</h3>
          <el-button type="primary" link icon="Plus" @click="handleAddEmployee">
            添加人员
          </el-button>
        </div>

        <el-table :data="employees" style="width: 100%">
          <el-table-column prop="employeeId" label="工号" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="getEmployeeTypeTag(row.type)">
                {{ getEmployeeTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="roleInProject" label="项目角色" width="150" />
          <el-table-column prop="linkedAt" label="加入时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.linkedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="handleRemoveEmployee(row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 使用设备 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">使用设备（{{ devices.length }}台）</h3>
          <el-button type="primary" link icon="Plus" @click="handleAddDevice">
            添加设备
          </el-button>
        </div>

        <el-table :data="devices" style="width: 100%">
          <el-table-column prop="deviceId" label="设备编号" width="120" />
          <el-table-column prop="name" label="设备名称" min-width="150" />
          <el-table-column prop="model" label="型号" width="120" />
          <el-table-column prop="depreciationRate" label="折旧单价 (元/小时)" width="140" />
          <el-table-column prop="linkedAt" label="关联时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.linkedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="handleRemoveDevice(row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 操作日志 -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">操作日志</h3>
        </div>

        <el-timeline>
          <el-timeline-item
            v-for="log in logs"
            :key="log.id"
            :type="getLogType(log.type)"
            :timestamp="formatDate(log.time)"
            placement="top"
          >
            <el-card>
              <div class="log-item">
                <span class="log-type">{{ getLogTypeText(log.type) }}</span>
                <span class="log-operator">操作人：{{ log.operator }}</span>
              </div>
              <div class="log-details" v-if="log.details">
                <span v-for="(value, key) in log.details" :key="key" class="log-detail-tag">
                  {{ key }}: {{ value }}
                </span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <!-- 添加人员对话框 -->
    <el-dialog v-model="addEmployeeDialogVisible" title="添加项目人员" width="500px">
      <el-form :model="addEmployeeForm" label-width="100px">
        <el-form-item label="选择员工" required>
          <el-select v-model="addEmployeeForm.employeeId" placeholder="请选择员工" style="width: 100%">
            <el-option
              v-for="emp in allEmployees"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeId})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目角色">
          <el-input v-model="addEmployeeForm.roleInProject" placeholder="如：项目负责人、核心开发" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addEmployeeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddEmployee">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 添加设备对话框 -->
    <el-dialog v-model="addDeviceDialogVisible" title="添加项目设备" width="500px">
      <el-form :model="addDeviceForm" label-width="100px">
        <el-form-item label="选择设备" required>
          <el-select v-model="addDeviceForm.deviceId" placeholder="请选择设备" style="width: 100%">
            <el-option
              v-for="device in allDevices"
              :key="device.id"
              :label="`${device.name} (${device.deviceId})`"
              :value="device.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="折旧单价" required>
          <el-input-number
            v-model="addDeviceForm.depreciationRate"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDeviceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddDevice">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const projectId = ref('')

// 项目信息
const project = ref<any>({
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
const employees = ref<any[]>([])
const allEmployees = ref<any[]>([])
const addEmployeeDialogVisible = ref(false)
const addEmployeeForm = reactive({
  employeeId: null as number | null,
  roleInProject: ''
})

// 设备列表
const devices = ref<any[]>([])
const allDevices = ref<any[]>([])
const addDeviceDialogVisible = ref(false)
const addDeviceForm = reactive({
  deviceId: null as number | null,
  depreciationRate: 0
})

// 操作日志
const logs = ref<any[]>([])

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
  {
    id: 1,
    employeeId: 'EMP001',
    name: '张伟',
    type: 'formal',
    department: '研发部',
    roleInProject: '项目负责人',
    linkedAt: '2026-01-05T14:30:00.000+08:00'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    name: '李娜',
    type: 'formal',
    department: '研发部',
    roleInProject: '核心开发',
    linkedAt: '2026-01-06T09:00:00.000+08:00'
  },
  {
    id: 3,
    employeeId: 'EMP003',
    name: '王强',
    type: 'outsourcing',
    department: '外部合作',
    roleInProject: '算法工程师',
    linkedAt: '2026-01-08T10:30:00.000+08:00'
  }
]

const mockDevices = [
  {
    id: 1,
    deviceId: 'DEV001',
    name: 'GPU 服务器 A',
    model: 'NVIDIA DGX',
    depreciationRate: 150.00,
    linkedAt: '2026-01-05T14:30:00.000+08:00'
  },
  {
    id: 2,
    deviceId: 'DEV002',
    name: '测试手机 iPhone15',
    model: 'iPhone 15 Pro',
    depreciationRate: 5.00,
    linkedAt: '2026-01-10T11:00:00.000+08:00'
  }
]

const mockLogs = [
  {
    id: 1,
    type: 'create',
    operator: '张伟',
    time: '2026-01-05T14:30:00.000+08:00',
    details: { employeeCount: 3, deviceCount: 2 }
  },
  {
    id: 2,
    type: 'link_employee',
    operator: '张伟',
    time: '2026-01-06T09:00:00.000+08:00',
    details: { employee_name: '李娜' }
  },
  {
    id: 3,
    type: 'link_device',
    operator: '张伟',
    time: '2026-01-10T11:00:00.000+08:00',
    details: { device_name: '测试手机 iPhone15', depreciation_rate: '5.00' }
  },
  {
    id: 4,
    type: 'end',
    operator: '张伟',
    time: '2026-02-15T16:30:00.000+08:00',
    details: { end_date: '2026-02-15' }
  }
]

// 工具函数
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    ongoing: 'success',
    ended: 'warning',
    settled: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    ongoing: '进行中',
    ended: '已结束',
    settled: '已结算'
  }
  return textMap[status] || status
}

const getEmployeeTypeTag = (type: string) => {
  const tagMap: Record<string, any> = {
    formal: '',
    part_time: 'warning',
    outsourcing: 'info'
  }
  return tagMap[type] || ''
}

const getEmployeeTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    formal: '正式',
    part_time: '兼职',
    outsourcing: '外包'
  }
  return textMap[type] || type
}

const getLogType = (type: string) => {
  const typeMap: Record<string, any> = {
    create: 'success',
    end: 'warning',
    settle: 'info',
    link_employee: '',
    link_device: '',
    unlink_employee: 'danger',
    unlink_device: 'danger',
    update: ''
  }
  return typeMap[type] || ''
}

const getLogTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    create: '创建项目',
    end: '结束项目',
    settle: '发起结算',
    link_employee: '添加成员',
    link_device: '添加设备',
    unlink_employee: '移除成员',
    unlink_device: '移除设备',
    update: '更新信息'
  }
  return textMap[type] || type
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

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
    ElMessage.error('加载项目详情失败')
  } finally {
    loading.value = false
  }
}

// 加载可选员工和设备
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
const handleBack = () => {
  router.push('/projects/list')
}

// 结束项目
const handleEndProject = async () => {
  await ElMessageBox.confirm('确定要结束这个项目吗？结束后将无法再添加人员和设备。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  ElMessage.success('项目已结束（Mock）')
  project.value.status = 'ended'
  project.value.endDate = new Date().toISOString().split('T')[0]
}

// 发起结算
const handleSettleProject = () => {
  router.push(`/projects/${project.value.id}/settlement`)
}

// 添加员工
const handleAddEmployee = () => {
  addEmployeeForm.employeeId = null
  addEmployeeForm.roleInProject = ''
  addEmployeeDialogVisible.value = true
}

const handleConfirmAddEmployee = () => {
  if (!addEmployeeForm.employeeId) {
    ElMessage.warning('请选择员工')
    return
  }
  const emp = allEmployees.value.find(e => e.id === addEmployeeForm.employeeId)
  if (emp) {
    employees.value.push({
      ...emp,
      roleInProject: addEmployeeForm.roleInProject,
      linkedAt: new Date().toISOString()
    })
    ElMessage.success('添加成功')
    addEmployeeDialogVisible.value = false
  }
}

const handleRemoveEmployee = async (row: any) => {
  await ElMessageBox.confirm(`确定要移除 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  employees.value = employees.value.filter(e => e.id !== row.id)
  ElMessage.success('移除成功')
}

// 添加设备
const handleAddDevice = () => {
  addDeviceForm.deviceId = null
  addDeviceForm.depreciationRate = 0
  addDeviceDialogVisible.value = true
}

const handleConfirmAddDevice = () => {
  if (!addDeviceForm.deviceId) {
    ElMessage.warning('请选择设备')
    return
  }
  const device = allDevices.value.find(d => d.id === addDeviceForm.deviceId)
  if (device) {
    devices.value.push({
      ...device,
      depreciationRate: addDeviceForm.depreciationRate,
      linkedAt: new Date().toISOString()
    })
    ElMessage.success('添加成功')
    addDeviceDialogVisible.value = false
  }
}

const handleRemoveDevice = async (row: any) => {
  await ElMessageBox.confirm(`确定要移除 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  devices.value = devices.value.filter(d => d.id !== row.id)
  ElMessage.success('移除成功')
}

onMounted(() => {
  projectId.value = route.params.id as string
  loadProjectDetail()
  loadOptions()
})
</script>

<style scoped lang="scss">
.project-detail-page {
  padding: 24px;
}

.back-nav {
  margin-bottom: 16px;
}

.info-card {
  background: #fcfcfc;
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

.settlement-amount {
  font-size: 20px;
  font-weight: 600;
  color: #0d9f5f;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .log-type {
    font-weight: 600;
    color: #272b30;
  }

  .log-operator {
    font-size: 13px;
    color: #9a9fa5;
  }
}

.log-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .log-detail-tag {
    background: #f4f4f4;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    color: #6f767e;
  }
}
</style>
