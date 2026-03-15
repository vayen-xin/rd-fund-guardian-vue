<template>
  <div class="project-create-page">
    <!-- 返回按钮 -->
    <div class="back-nav">
      <button class="btn btn-link" @click="handleBack">
        <span class="btn-icon">←</span>
        返回项目列表
      </button>
    </div>

    <div class="form-container">
      <div class="form-card">
        <div class="card-header">
          <h1 class="page-title">创建新项目</h1>
          <p class="page-subtitle">填写项目基本信息，选择参与人员和设备</p>
        </div>

        <form class="form" @submit.prevent="handleSubmit">
          <!-- 基本信息 -->
          <div class="form-section">
            <h2 class="section-title">基本信息</h2>
            <div class="section-divider"></div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                项目名称
              </label>
              <input 
                type="text" 
                class="form-input" 
                v-model="form.name"
                placeholder="请输入项目名称"
                maxlength="200"
              />
              <span class="input-count">{{ form.name.length }}/200</span>
            </div>

            <div class="form-group">
              <label class="form-label">项目描述</label>
              <textarea 
                class="form-textarea" 
                v-model="form.description"
                placeholder="请描述项目目标、范围等信息"
                maxlength="1000"
                rows="4"
              ></textarea>
              <span class="input-count">{{ form.description.length }}/1000</span>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                开始日期
              </label>
              <input 
                type="date" 
                class="form-input" 
                v-model="form.startDate"
              />
            </div>
          </div>

          <!-- 参与人员 -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">参与人员</h2>
              <button type="button" class="btn btn-link" @click="handleAddEmployee">
                <span class="btn-icon">+</span>
                添加人员
              </button>
            </div>
            <div class="section-divider"></div>

            <div v-if="selectedEmployees.length > 0" class="selected-list">
              <div 
                v-for="emp in selectedEmployees" 
                :key="emp.id" 
                class="selected-tag"
              >
                <span class="tag-text">{{ emp.name }} ({{ emp.employeeId }})</span>
                <button type="button" class="tag-close" @click="handleRemoveEmployee(emp.id)">×</button>
              </div>
            </div>
            <div v-else class="empty-state">
              <span class="empty-text">暂未选择人员</span>
            </div>
          </div>

          <!-- 使用设备 -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">使用设备</h2>
              <button type="button" class="btn btn-link" @click="handleAddDevice">
                <span class="btn-icon">+</span>
                添加设备
              </button>
            </div>
            <div class="section-divider"></div>

            <div v-if="selectedDevices.length > 0" class="selected-list">
              <div 
                v-for="device in selectedDevices" 
                :key="device.id" 
                class="selected-tag device-tag"
              >
                <span class="tag-text">{{ device.name }} - ¥{{ device.depreciationRate }}/小时</span>
                <button type="button" class="tag-close" @click="handleRemoveDevice(device.id)">×</button>
              </div>
            </div>
            <div v-else class="empty-state">
              <span class="empty-text">暂未选择设备</span>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="handleBack">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? '创建中...' : '创建项目' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 选择人员对话框 -->
    <div v-if="employeeDialogVisible" class="modal-overlay" @click.self="employeeDialogVisible = false">
      <div class="modal dialog-large">
        <div class="modal-header">
          <h3 class="modal-title">选择项目人员</h3>
          <button class="modal-close" @click="employeeDialogVisible = false">×</button>
        </div>
        <div class="modal-body">
          <div class="dialog-search">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="search-input" 
              v-model="employeeSearch"
              placeholder="搜索员工姓名或工号"
            />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th width="60">
                  <input 
                    type="checkbox" 
                    :checked="isAllEmployeesSelected"
                    @change="toggleAllEmployees"
                  />
                </th>
                <th width="100">工号</th>
                <th width="100">姓名</th>
                <th width="80">类型</th>
                <th>部门</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in filteredEmployees" :key="emp.id">
                <td>
                  <input 
                    type="checkbox" 
                    :checked="isEmployeeSelected(emp.id)"
                    @change="toggleEmployee(emp)"
                  />
                </td>
                <td>{{ emp.employeeId }}</td>
                <td class="font-bold">{{ emp.name }}</td>
                <td>
                  <span :class="['type-tag', getTypeClass(emp.type)]">
                    {{ getTypeText(emp.type) }}
                  </span>
                </td>
                <td>{{ emp.department }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="employeeDialogVisible = false">取消</button>
          <button type="button" class="btn btn-primary" @click="handleConfirmEmployees">确认选择</button>
        </div>
      </div>
    </div>

    <!-- 选择设备对话框 -->
    <div v-if="deviceDialogVisible" class="modal-overlay" @click.self="deviceDialogVisible = false">
      <div class="modal dialog-large">
        <div class="modal-header">
          <h3 class="modal-title">选择项目设备</h3>
          <button class="modal-close" @click="deviceDialogVisible = false">×</button>
        </div>
        <div class="modal-body">
          <div class="dialog-search">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="search-input" 
              v-model="deviceSearch"
              placeholder="搜索设备名称或编号"
            />
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th width="60">
                  <input 
                    type="checkbox" 
                    :checked="isAllDevicesSelected"
                    @change="toggleAllDevices"
                  />
                </th>
                <th width="100">设备编号</th>
                <th>设备名称</th>
                <th width="120">型号</th>
                <th width="140">折旧单价 (元/小时)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="device in filteredDevices" :key="device.id">
                <td>
                  <input 
                    type="checkbox" 
                    :checked="isDeviceSelected(device.id)"
                    @change="toggleDevice(device)"
                  />
                </td>
                <td>{{ device.deviceId }}</td>
                <td class="font-bold">{{ device.name }}</td>
                <td>{{ device.model }}</td>
                <td>¥{{ device.depreciationRate }}/小时</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="deviceDialogVisible = false">取消</button>
          <button type="button" class="btn btn-primary" @click="handleConfirmDevices">确认选择</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const submitting = ref(false)

// 表单数据
const form = reactive({
  name: '',
  description: '',
  startDate: ''
})

// 已选择的人员和设备
const selectedEmployees = ref([])
const selectedDevices = ref([])

// 所有员工和设备（Mock）
const allEmployees = ref([
  { id: 1, employeeId: 'EMP001', name: '张伟', type: 'formal', department: '研发部' },
  { id: 2, employeeId: 'EMP002', name: '李娜', type: 'formal', department: '研发部' },
  { id: 3, employeeId: 'EMP003', name: '王强', type: 'outsourcing', department: '外部合作' },
  { id: 4, employeeId: 'EMP004', name: '赵敏', type: 'formal', department: '产品部' },
  { id: 5, employeeId: 'EMP005', name: '孙磊', type: 'part_time', department: '设计部' },
  { id: 6, employeeId: 'EMP006', name: '周杰', type: 'formal', department: '测试部' }
])

const allDevices = ref([
  { id: 1, deviceId: 'DEV001', name: 'GPU 服务器 A', model: 'NVIDIA DGX', depreciationRate: '150.00' },
  { id: 2, deviceId: 'DEV002', name: 'GPU 服务器 B', model: 'NVIDIA A100', depreciationRate: '120.00' },
  { id: 3, deviceId: 'DEV003', name: 'MacBook Pro', model: 'M3 Max', depreciationRate: '8.00' },
  { id: 4, deviceId: 'DEV004', name: '测试手机 iPhone15', model: 'iPhone 15 Pro', depreciationRate: '5.00' },
  { id: 5, deviceId: 'DEV005', name: '测试平板', model: 'iPad Pro', depreciationRate: '3.00' },
  { id: 6, deviceId: 'DEV006', name: '冲压机 A', model: 'XY-2000', depreciationRate: '45.00' }
])

// 对话框
const employeeDialogVisible = ref(false)
const deviceDialogVisible = ref(false)
const employeeSearch = ref('')
const deviceSearch = ref('')

// 临时选择
const tempSelectedEmployees = ref([])
const tempSelectedDevices = ref([])

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

// 检查是否全选
const isAllEmployeesSelected = computed(() => {
  return filteredEmployees.value.length > 0 && 
    filteredEmployees.value.every(emp => tempSelectedEmployees.value.some(e => e.id === emp.id))
})

const isAllDevicesSelected = computed(() => {
  return filteredDevices.value.length > 0 && 
    filteredDevices.value.every(device => tempSelectedDevices.value.some(d => d.id === device.id))
})

// 检查是否已选择
const isEmployeeSelected = (id) => tempSelectedEmployees.value.some(e => e.id === id)
const isDeviceSelected = (id) => tempSelectedDevices.value.some(d => d.id === id)

// 切换选择
const toggleEmployee = (emp) => {
  if (isEmployeeSelected(emp.id)) {
    tempSelectedEmployees.value = tempSelectedEmployees.value.filter(e => e.id !== emp.id)
  } else {
    tempSelectedEmployees.value.push(emp)
  }
}

const toggleDevice = (device) => {
  if (isDeviceSelected(device.id)) {
    tempSelectedDevices.value = tempSelectedDevices.value.filter(d => d.id !== device.id)
  } else {
    tempSelectedDevices.value.push(device)
  }
}

// 全选/取消全选
const toggleAllEmployees = () => {
  if (isAllEmployeesSelected.value) {
    tempSelectedEmployees.value = tempSelectedEmployees.value.filter(
      emp => !filteredEmployees.value.some(e => e.id === emp.id)
    )
  } else {
    filteredEmployees.value.forEach(emp => {
      if (!isEmployeeSelected(emp.id)) {
        tempSelectedEmployees.value.push(emp)
      }
    })
  }
}

const toggleAllDevices = () => {
  if (isAllDevicesSelected.value) {
    tempSelectedDevices.value = tempSelectedDevices.value.filter(
      device => !filteredDevices.value.some(d => d.id === device.id)
    )
  } else {
    filteredDevices.value.forEach(device => {
      if (!isDeviceSelected(device.id)) {
        tempSelectedDevices.value.push(device)
      }
    })
  }
}

// 工具函数
const getTypeClass = (type) => {
  const map = {
    formal: 'type-formal',
    part_time: 'type-part',
    outsourcing: 'type-out'
  }
  return map[type] || ''
}

const getTypeText = (type) => {
  const map = {
    formal: '正式',
    part_time: '兼职',
    outsourcing: '外包'
  }
  return map[type] || type
}

// 添加人员
const handleAddEmployee = () => {
  tempSelectedEmployees.value = [...selectedEmployees.value]
  employeeDialogVisible.value = true
}

const handleConfirmEmployees = () => {
  selectedEmployees.value = tempSelectedEmployees.value
  employeeDialogVisible.value = false
}

const handleRemoveEmployee = (id) => {
  selectedEmployees.value = selectedEmployees.value.filter(e => e.id !== id)
}

// 添加设备
const handleAddDevice = () => {
  tempSelectedDevices.value = [...selectedDevices.value]
  deviceDialogVisible.value = true
}

const handleConfirmDevices = () => {
  selectedDevices.value = tempSelectedDevices.value
  deviceDialogVisible.value = false
}

const handleRemoveDevice = (id) => {
  selectedDevices.value = selectedDevices.value.filter(d => d.id !== id)
}

// 返回
const handleBack = () => {
  router.push('/projects/list')
}

// 提交
const handleSubmit = async () => {
  // 验证
  if (!form.name.trim()) {
    alert('请输入项目名称')
    return
  }
  if (!form.startDate) {
    alert('请选择开始日期')
    return
  }
  if (selectedEmployees.value.length === 0) {
    alert('请至少选择一名项目人员')
    return
  }

  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    alert('项目创建成功')
    router.push('/projects/list')
  } catch (error) {
    alert('创建项目失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.project-create-page {
  padding: 40px;
  min-height: calc(100vh - 80px);
  background: #f4f4f4;
}

// 返回导航
.back-nav {
  margin-bottom: 24px;
}

// 表单容器
.form-container {
  max-width: 900px;
}

.form-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .card-header {
    margin-bottom: 32px;

    .page-title {
      font-size: 28px;
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

// 表单区块
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

  .section-divider {
    height: 1px;
    background: #f0f0f0;
    margin-bottom: 24px;
  }
}

// 表单组
.form-group {
  margin-bottom: 24px;
  position: relative;

  .form-label {
    display: block;
    font-size: 14px;
    color: #272b30;
    margin-bottom: 8px;
    font-weight: 500;

    .required {
      color: #ff4d4f;
      margin-right: 2px;
    }
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    font-size: 14px;
    color: #272b30;
    background: white;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #252833;
      box-shadow: 0 0 0 2px rgba(37, 40, 51, 0.1);
    }

    &::placeholder {
      color: #9a9fa5;
    }
  }

  .form-textarea {
    resize: vertical;
    min-height: 100px;
  }

  .input-count {
    position: absolute;
    right: 10px;
    bottom: -20px;
    font-size: 12px;
    color: #9a9fa5;
  }
}

// 已选列表
.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  font-size: 14px;
  color: #52c41a;

  .tag-close {
    background: none;
    border: none;
    color: #52c41a;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: rgba(82, 196, 26, 0.2);
    }
  }

  &.device-tag {
    background: #fff7e6;
    border-color: #ffe7ba;
    color: #fa8c16;
  }
}

// 空状态
.empty-state {
  padding: 32px;
  text-align: center;
  background: #fafafa;
  border-radius: 8px;

  .empty-text {
    color: #9a9fa5;
    font-size: 14px;
  }
}

// 表单操作
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f4f4f4;
}

// 对话框搜索
.dialog-search {
  margin-bottom: 16px;
  position: relative;

  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: #9a9fa5;
  }

  .search-input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    font-size: 14px;
    color: #272b30;
    background: white;

    &:focus {
      outline: none;
      border-color: #252833;
    }
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

  .btn-icon {
    font-size: 16px;
    font-weight: bold;
  }

  &.btn-primary {
    background: #252833;
    color: white;

    &:hover {
      background: #3d4152;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &.btn-outline {
    background: white;
    color: #272b30;
    border: 1px solid #d9d9d9;

    &:hover {
      border-color: #252833;
      color: #252833;
    }
  }

  &.btn-link {
    background: none;
    border: none;
    color: #1890ff;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      color: #40a9ff;
    }
  }
}

// 弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  max-width: 700px;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

  &.dialog-large {
    max-width: 800px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;

  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #272b30;
    margin: 0;
  }

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

    &:hover {
      background: #f5f5f5;
      color: #272b30;
    }
  }
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f0f0f0;
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

    &.type-formal {
      background: #f6ffed;
      color: #52c41a;
    }

    &.type-part {
      background: #fff7e6;
      color: #fa8c16;
    }

    &.type-out {
      background: #e6f7ff;
      color: #1890ff;
    }
  }
}
</style>