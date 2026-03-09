<template>
  <div class="equipment-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">设备管理</h1>
        <span class="page-subtitle">管理研发设备资产，跟踪设备使用状态和折旧</span>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">
          添加设备
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="设备状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="可用" value="available" />
            <el-option label="使用中" value="in_use" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="报废" value="scrapped" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="filterForm.name" placeholder="输入设备名称" style="width: 200px" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 设备列表 -->
    <div class="table-card">
      <el-table :data="equipmentList" v-loading="loading" style="width: 100%">
        <el-table-column prop="deviceId" label="设备编号" width="120" />
        <el-table-column prop="name" label="设备名称" min-width="180" />
        <el-table-column prop="model" label="型号" width="140" />
        <el-table-column prop="depreciationRate" label="折旧单价 (元/小时)" width="140" align="right">
          <template #default="{ row }">
            <span class="rate-text">¥{{ row.depreciationRate.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseDate" label="购买日期" width="120" />
        <el-table-column prop="purchasePrice" label="购买价格" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.purchasePrice" class="price-text">¥{{ row.purchasePrice.toLocaleString() }}</span>
            <span v-else class="empty-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="存放位置" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-if="row.status === 'available'"
              link
              type="success"
              size="small"
              @click="handleUseDevice(row)"
            >
              使用
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑设备' : '添加设备'"
      width="650px"
      @close="handleCloseDialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="deviceId" required>
              <el-input v-model="form.deviceId" placeholder="如：DEV001" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name" required>
              <el-input v-model="form.name" placeholder="请输入设备名称" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="型号" prop="model">
              <el-input v-model="form.model" placeholder="如：NVIDIA A100" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="折旧单价" prop="depreciationRate" required>
              <el-input-number
                v-model="form.depreciationRate"
                :min="0"
                :precision="2"
                :step="0.1"
                placeholder="0.00"
                style="width: 100%"
                controls-position="right"
              />
              <span class="form-tip">元/小时</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="购买日期" prop="purchaseDate">
              <el-date-picker
                v-model="form.purchaseDate"
                type="date"
                placeholder="选择购买日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买价格" prop="purchasePrice">
              <el-input-number
                v-model="form.purchasePrice"
                :min="0"
                :precision="2"
                :step="100"
                placeholder="0.00"
                style="width: 100%"
                controls-position="right"
              />
              <span class="form-tip">元</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备状态" prop="status" required>
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="可用" value="available" />
                <el-option label="使用中" value="in_use" />
                <el-option label="维修中" value="maintenance" />
                <el-option label="报废" value="scrapped" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存放位置" prop="location">
              <el-input v-model="form.location" placeholder="如：3 楼实验室 A 区" maxlength="200" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="可选：设备说明、注意事项等"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 使用设备对话框 -->
    <el-dialog v-model="useDeviceDialogVisible" title="使用设备" width="500px">
      <el-form :model="useDeviceForm" label-width="100px">
        <el-form-item label="选择项目" required>
          <el-select v-model="useDeviceForm.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option
              v-for="proj in projects"
              :key="proj.id"
              :label="proj.name"
              :value="proj.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="useDeviceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmUse">确认使用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const useDeviceDialogVisible = ref(false)

// 筛选表单
const filterForm = reactive({
  status: '',
  name: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 列表数据
const equipmentList = ref<any[]>([])

// 表单数据
const form = reactive({
  id: null as number | null,
  deviceId: '',
  name: '',
  model: '',
  depreciationRate: 0,
  purchaseDate: '',
  purchasePrice: null as number | null,
  status: 'available',
  location: '',
  remark: ''
})

// 使用设备表单
const useDeviceForm = reactive({
  projectId: null as number | null
})

// 项目列表（Mock）
const projects = ref([
  { id: 1, name: '智能客服系统研发' },
  { id: 2, name: '数据中台 V2.0 升级' },
  { id: 3, name: '移动端 APP 开发' },
  { id: 4, name: '物联网设备管理平台' }
])

// 验证规则
const rules: FormRules = {
  deviceId: [
    { required: true, message: '请输入设备编号', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '编号只能包含大写字母和数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { min: 2, max: 100, message: '名称长度在 2-100 个字符', trigger: 'blur' }
  ],
  depreciationRate: [
    { required: true, message: '请输入折旧单价', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择设备状态', trigger: 'change' }
  ]
}

// Mock 数据
const mockEquipment = [
  { id: 1, deviceId: 'DEV001', name: 'GPU 服务器 A', model: 'NVIDIA DGX', depreciationRate: 150.00, purchaseDate: '2024-06-15', purchasePrice: 500000, status: 'in_use', location: '3 楼实验室 A 区' },
  { id: 2, deviceId: 'DEV002', name: 'GPU 服务器 B', model: 'NVIDIA A100', depreciationRate: 120.00, purchaseDate: '2024-08-20', purchasePrice: 380000, status: 'available', location: '3 楼实验室 A 区' },
  { id: 3, deviceId: 'DEV003', name: 'MacBook Pro', model: 'M3 Max', depreciationRate: 8.00, purchaseDate: '2025-01-10', purchasePrice: 25000, status: 'in_use', location: '研发部' },
  { id: 4, deviceId: 'DEV004', name: '测试手机 iPhone15', model: 'iPhone 15 Pro', depreciationRate: 5.00, purchaseDate: '2024-10-05', purchasePrice: 9999, status: 'available', location: '测试部' },
  { id: 5, deviceId: 'DEV005', name: '测试平板', model: 'iPad Pro', depreciationRate: 3.00, purchaseDate: '2024-10-05', purchasePrice: 7999, status: 'available', location: '测试部' },
  { id: 6, deviceId: 'DEV006', name: '冲压机 A', model: 'XY-2000', depreciationRate: 45.00, purchaseDate: '2023-05-20', purchasePrice: 180000, status: 'maintenance', location: '工厂车间' },
  { id: 7, deviceId: 'DEV007', name: '3D 打印机', model: 'Ultimaker S5', depreciationRate: 15.00, purchaseDate: '2024-03-12', purchasePrice: 45000, status: 'available', location: '原型室' },
  { id: 8, deviceId: 'DEV008', name: '示波器', model: 'Keysight DSOX', depreciationRate: 20.00, purchaseDate: '2023-11-08', purchasePrice: 65000, status: 'scrapped', location: '仓库' }
]

// 工具函数
const getStatusTag = (status: string) => {
  const tagMap: Record<string, any> = {
    available: 'success',
    in_use: '',
    maintenance: 'warning',
    scrapped: 'info'
  }
  return tagMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    available: '可用',
    in_use: '使用中',
    maintenance: '维修中',
    scrapped: '报废'
  }
  return textMap[status] || status
}

// 加载数据
const loadEquipment = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    equipmentList.value = mockEquipment
    pagination.total = mockEquipment.length
  } catch (error) {
    ElMessage.error('加载设备列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadEquipment()
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = () => {
  filterForm.status = ''
  filterForm.name = ''
  pagination.page = 1
  loadEquipment()
}

// 分页
const handleSizeChange = () => loadEquipment()
const handlePageChange = () => loadEquipment()

// 添加
const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    deviceId: '',
    name: '',
    model: '',
    depreciationRate: 0,
    purchaseDate: '',
    purchasePrice: null,
    status: 'available',
    location: '',
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

// 使用设备
const handleUseDevice = (row: any) => {
  useDeviceForm.projectId = null
  useDeviceDialogVisible.value = true
}

const handleConfirmUse = async () => {
  if (!useDeviceForm.projectId) {
    ElMessage.warning('请选择项目')
    return
  }
  await ElMessageBox.confirm('确认将该设备用于所选项目？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  const device = equipmentList.value.find(d => d.id === form.id)
  if (device) {
    device.status = 'in_use'
  }
  ElMessage.success('设备已分配')
  useDeviceDialogVisible.value = false
}

// 删除
const handleDelete = async (row: any) => {
  if (row.status === 'in_use') {
    ElMessage.warning('使用中的设备不能删除')
    return
  }
  await ElMessageBox.confirm(`确定要删除 ${row.name} 吗？删除后无法恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  equipmentList.value = equipmentList.value.filter(e => e.id !== row.id)
  ElMessage.success('删除成功')
}

// 关闭对话框
const handleCloseDialog = () => {
  formRef.value?.resetFields()
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (isEdit.value) {
        const index = equipmentList.value.findIndex(e => e.id === form.id)
        if (index !== -1) {
          equipmentList.value[index] = { ...equipmentList.value[index], ...form }
        }
        ElMessage.success('更新成功')
      } else {
        const newId = Math.max(...equipmentList.value.map(e => e.id)) + 1
        equipmentList.value.unshift({ ...form, id: newId })
        ElMessage.success('添加成功')
      }
      
      dialogVisible.value = false
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  loadEquipment()
})
</script>

<style scoped lang="scss">
.equipment-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #272b30;
      margin: 0 0 8px 0;
    }

    .page-subtitle {
      font-size: 14px;
      color: #9a9fa5;
    }
  }
}

.filter-card {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .filter-form {
    .el-form-item {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }
}

.table-card {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .rate-text {
    font-weight: 600;
    color: #0d9f5f;
  }

  .price-text {
    color: #272b30;
  }

  .empty-text {
    color: #9a9fa5;
  }

  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}

.form-tip {
  margin-left: 8px;
  font-size: 13px;
  color: #9a9fa5;
}
</style>
