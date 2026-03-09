<template>
  <div class="project-create-page">
    <!-- 返回按钮 -->
    <div class="back-nav">
      <el-button link type="primary" icon="ArrowLeft" @click="handleBack">
        返回项目列表
      </el-button>
    </div>

    <div class="form-container">
      <div class="form-card">
        <div class="card-header">
          <h1 class="page-title">创建新项目</h1>
          <p class="page-subtitle">填写项目基本信息，选择参与人员和设备</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          class="project-form"
        >
          <!-- 基本信息 -->
          <div class="form-section">
            <h2 class="section-title">基本信息</h2>
            <el-divider />

            <el-form-item label="项目名称" prop="name" required>
              <el-input
                v-model="form.name"
                placeholder="请输入项目名称"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="项目描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="请描述项目目标、范围等信息"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="开始日期" prop="startDate" required>
              <el-date-picker
                v-model="form.startDate"
                type="date"
                placeholder="选择开始日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </div>

          <!-- 参与人员 -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">参与人员</h2>
              <el-button type="primary" link icon="Plus" @click="handleAddEmployee">
                添加人员
              </el-button>
            </div>
            <el-divider />

            <div v-if="selectedEmployees.length > 0" class="selected-list">
              <el-tag
                v-for="emp in selectedEmployees"
                :key="emp.id"
                closable
                @close="handleRemoveEmployee(emp.id)"
                class="employee-tag"
              >
                {{ emp.name }} ({{ emp.employeeId }})
              </el-tag>
            </div>
            <el-empty v-else description="暂未选择人员" :image-size="80" />
          </div>

          <!-- 使用设备 -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">使用设备</h2>
              <el-button type="primary" link icon="Plus" @click="handleAddDevice">
                添加设备
              </el-button>
            </div>
            <el-divider />

            <div v-if="selectedDevices.length > 0" class="selected-list">
              <el-tag
                v-for="device in selectedDevices"
                :key="device.id"
                closable
                @close="handleRemoveDevice(device.id)"
                class="device-tag"
                type="warning"
              >
                {{ device.name }} - ¥{{ device.depreciationRate }}/小时
              </el-tag>
            </div>
            <el-empty v-else description="暂未选择设备" :image-size="80" />
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <el-button @click="handleBack">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
              创建项目
            </el-button>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 选择人员对话框 -->
    <el-dialog v-model="employeeDialogVisible" title="选择项目人员" width="600px">
      <div class="dialog-search">
        <el-input
          v-model="employeeSearch"
          placeholder="搜索员工姓名或工号"
          prefix-icon="Search"
          clearable
        />
      </div>
      <el-table :data="filteredEmployees" @selection-change="handleEmployeeSelection" max-height="400">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="employeeId" label="工号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="getEmployeeTypeTag(row.type)">
              {{ getEmployeeTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" />
      </el-table>
      <template #footer>
        <el-button @click="employeeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEmployees">确认选择</el-button>
      </template>
    </el-dialog>

    <!-- 选择设备对话框 -->
    <el-dialog v-model="deviceDialogVisible" title="选择项目设备" width="600px">
      <div class="dialog-search">
        <el-input
          v-model="deviceSearch"
          placeholder="搜索设备名称或编号"
          prefix-icon="Search"
          clearable
        />
      </div>
      <el-table :data="filteredDevices" @selection-change="handleDeviceSelection" max-height="400">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="deviceId" label="设备编号" width="100" />
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="model" label="型号" width="120" />
        <el-table-column prop="depreciationRate" label="折旧单价 (元/小时)" width="140" />
      </el-table>
      <template #footer>
        <el-button @click="deviceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmDevices">确认选择</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const form = reactive({
  name: '',
  description: '',
  startDate: ''
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 200, message: '项目名称长度在 2-200 个字符', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ]
}

// 已选择的人员和设备
const selectedEmployees = ref<any[]>([])
const selectedDevices = ref<any[]>([])

// 所有员工和设备（Mock）
const allEmployees = ref<any[]>([])
const allDevices = ref<any[]>([])

// 对话框
const employeeDialogVisible = ref(false)
const deviceDialogVisible = ref(false)
const employeeSearch = ref('')
const deviceSearch = ref('')

// 临时选择
const tempSelectedEmployees = ref<any[]>([])
const tempSelectedDevices = ref<any[]>([])

// 筛选后的列表
const filteredEmployees = computed(() => {
  if (!employeeSearch.value) return allEmployees.value
  const search = employeeSearch.value.toLowerCase()
  return allEmployees.value.filter(
    emp => emp.name.toLowerCase().includes(search) || emp.employeeId.toLowerCase().includes(search)
  )
})

const filteredDevices = computed(() => {
  if (!deviceSearch.value) return allDevices.value
  const search = deviceSearch.value.toLowerCase()
  return allDevices.value.filter(
    device => device.name.toLowerCase().includes(search) || device.deviceId.toLowerCase().includes(search)
  )
})

// Mock 数据
const mockEmployees = [
  { id: 1, employeeId: 'EMP001', name: '张伟', type: 'formal', department: '研发部' },
  { id: 2, employeeId: 'EMP002', name: '李娜', type: 'formal', department: '研发部' },
  { id: 3, employeeId: 'EMP003', name: '王强', type: 'outsourcing', department: '外部合作' },
  { id: 4, employeeId: 'EMP004', name: '赵敏', type: 'formal', department: '产品部' },
  { id: 5, employeeId: 'EMP005', name: '孙磊', type: 'part_time', department: '设计部' },
  { id: 6, employeeId: 'EMP006', name: '周杰', type: 'formal', department: '测试部' }
]

const mockDevices = [
  { id: 1, deviceId: 'DEV001', name: 'GPU 服务器 A', model: 'NVIDIA DGX', depreciationRate: 150.00 },
  { id: 2, deviceId: 'DEV002', name: 'GPU 服务器 B', model: 'NVIDIA A100', depreciationRate: 120.00 },
  { id: 3, deviceId: 'DEV003', name: 'MacBook Pro', model: 'M3 Max', depreciationRate: 8.00 },
  { id: 4, deviceId: 'DEV004', name: '测试手机 iPhone15', model: 'iPhone 15 Pro', depreciationRate: 5.00 },
  { id: 5, deviceId: 'DEV005', name: '测试平板', model: 'iPad Pro', depreciationRate: 3.00 },
  { id: 6, deviceId: 'DEV006', name: '冲压机 A', model: 'XY-2000', depreciationRate: 45.00 }
]

// 工具函数
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

// 加载数据
const loadOptions = () => {
  allEmployees.value = mockEmployees
  allDevices.value = mockDevices
}

// 添加人员
const handleAddEmployee = () => {
  tempSelectedEmployees.value = [...selectedEmployees.value]
  employeeDialogVisible.value = true
}

const handleEmployeeSelection = (selection: any[]) => {
  tempSelectedEmployees.value = selection
}

const handleConfirmEmployees = () => {
  selectedEmployees.value = tempSelectedEmployees.value
  ElMessage.success(`已选择 ${selectedEmployees.value.length} 名人员`)
  employeeDialogVisible.value = false
}

const handleRemoveEmployee = (id: number) => {
  selectedEmployees.value = selectedEmployees.value.filter(e => e.id !== id)
}

// 添加设备
const handleAddDevice = () => {
  tempSelectedDevices.value = [...selectedDevices.value]
  deviceDialogVisible.value = true
}

const handleDeviceSelection = (selection: any[]) => {
  tempSelectedDevices.value = selection
}

const handleConfirmDevices = () => {
  selectedDevices.value = tempSelectedDevices.value
  ElMessage.success(`已选择 ${selectedDevices.value.length} 台设备`)
  deviceDialogVisible.value = false
}

const handleRemoveDevice = (id: number) => {
  selectedDevices.value = selectedDevices.value.filter(d => d.id !== id)
}

// 返回
const handleBack = () => {
  router.push('/projects/list')
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (selectedEmployees.value.length === 0) {
      ElMessage.warning('请至少选择一名项目人员')
      return
    }

    submitting.value = true
    try {
      // TODO: 调用 API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      ElMessage.success('项目创建成功')
      router.push('/projects/list')
    } catch (error) {
      ElMessage.error('创建项目失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  loadOptions()
})
</script>

<style scoped lang="scss">
.project-create-page {
  padding: 24px;
}

.back-nav {
  margin-bottom: 16px;
}

.form-container {
  max-width: 900px;
}

.form-card {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .card-header {
    margin-bottom: 32px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #272b30;
      margin: 0 0 8px 0;
    }

    .page-subtitle {
      font-size: 14px;
      color: #9a9fa5;
      margin: 0;
    }
  }
}

.form-section {
  margin-bottom: 32px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #272b30;
    margin: 0;
  }
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .employee-tag,
  .device-tag {
    padding: 6px 12px;
    font-size: 14px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f4f4f4;
}

.dialog-search {
  margin-bottom: 16px;
}
</style>
