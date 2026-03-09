<template>
  <div class="employees-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">员工管理</h1>
        <span class="page-subtitle">管理企业员工信息，支持正式、兼职、外包人员</span>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">
          添加员工
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="员工类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable style="width: 140px">
            <el-option label="正式" value="formal" />
            <el-option label="兼职" value="part_time" />
            <el-option label="外包" value="outsourcing" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="filterForm.department" placeholder="输入部门名称" style="width: 160px" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="在职" :value="1" />
            <el-option label="离职" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 员工列表 -->
    <div class="table-card">
      <el-table :data="employeeList" v-loading="loading" style="width: 100%">
        <el-table-column prop="employeeId" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getTypeTag(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="position" label="职位" width="150" />
        <el-table-column prop="entryDate" label="入职日期" width="120" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              link
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '离职' : '复职' }}
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
      :title="isEdit ? '编辑员工' : '添加员工'"
      width="600px"
      @close="handleCloseDialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="员工工号" prop="employeeId" required>
          <el-input v-model="form.employeeId" placeholder="如：EMP001" maxlength="20" />
        </el-form-item>

        <el-form-item label="姓名" prop="name" required>
          <el-input v-model="form.name" placeholder="请输入姓名" maxlength="50" />
        </el-form-item>

        <el-form-item label="员工类型" prop="type" required>
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="正式员工" value="formal" />
            <el-option label="兼职员工" value="part_time" />
            <el-option label="外包人员" value="outsourcing" />
          </el-select>
        </el-form-item>

        <el-form-item label="部门" prop="department">
          <el-input v-model="form.department" placeholder="如：研发部" maxlength="100" />
        </el-form-item>

        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="如：高级工程师" maxlength="100" />
        </el-form-item>

        <el-form-item label="入职日期" prop="entryDate">
          <el-date-picker
            v-model="form.entryDate"
            type="date"
            placeholder="选择入职日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
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

// 筛选表单
const filterForm = reactive({
  type: '',
  department: '',
  status: null as number | null
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 列表数据
const employeeList = ref<any[]>([])

// 表单数据
const form = reactive({
  id: null as number | null,
  employeeId: '',
  name: '',
  type: '',
  department: '',
  position: '',
  entryDate: '',
  status: 1
})

// 验证规则
const rules: FormRules = {
  employeeId: [
    { required: true, message: '请输入员工工号', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '工号只能包含大写字母和数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2-50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择员工类型', trigger: 'change' }
  ]
}

// Mock 数据
const mockEmployees = [
  { id: 1, employeeId: 'EMP001', name: '张伟', type: 'formal', department: '研发部', position: '技术总监', entryDate: '2024-01-15', status: 1 },
  { id: 2, employeeId: 'EMP002', name: '李娜', type: 'formal', department: '研发部', position: '高级工程师', entryDate: '2024-03-20', status: 1 },
  { id: 3, employeeId: 'EMP003', name: '王强', type: 'outsourcing', department: '外部合作', position: '算法工程师', entryDate: '2025-06-01', status: 1 },
  { id: 4, employeeId: 'EMP004', name: '赵敏', type: 'formal', department: '产品部', position: '产品经理', entryDate: '2024-05-10', status: 1 },
  { id: 5, employeeId: 'EMP005', name: '孙磊', type: 'part_time', department: '设计部', position: 'UI 设计师', entryDate: '2025-01-08', status: 1 },
  { id: 6, employeeId: 'EMP006', name: '周杰', type: 'formal', department: '测试部', position: '测试主管', entryDate: '2024-08-22', status: 1 },
  { id: 7, employeeId: 'EMP007', name: '吴芳', type: 'formal', department: '研发部', position: '后端开发', entryDate: '2025-02-14', status: 1 },
  { id: 8, employeeId: 'EMP008', name: '郑浩', type: 'outsourcing', department: '外部合作', position: '前端开发', entryDate: '2025-03-01', status: 0 }
]

// 工具函数
const getTypeTag = (type: string) => {
  const tagMap: Record<string, any> = {
    formal: '',
    part_time: 'warning',
    outsourcing: 'info'
  }
  return tagMap[type] || ''
}

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    formal: '正式',
    part_time: '兼职',
    outsourcing: '外包'
  }
  return textMap[type] || type
}

// 加载数据
const loadEmployees = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    employeeList.value = mockEmployees
    pagination.total = mockEmployees.length
  } catch (error) {
    ElMessage.error('加载员工列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadEmployees()
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = () => {
  filterForm.type = ''
  filterForm.department = ''
  filterForm.status = null
  pagination.page = 1
  loadEmployees()
}

// 分页
const handleSizeChange = () => loadEmployees()
const handlePageChange = () => loadEmployees()

// 添加
const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    employeeId: '',
    name: '',
    type: '',
    department: '',
    position: '',
    entryDate: '',
    status: 1
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = async (row: any) => {
  const action = row.status === 1 ? '离职' : '复职'
  await ElMessageBox.confirm(`确定要将 ${row.name} ${action}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  row.status = row.status === 1 ? 0 : 1
  ElMessage.success(`${action}成功`)
}

// 删除
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定要删除 ${row.name} 吗？删除后无法恢复。`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  employeeList.value = employeeList.value.filter(e => e.id !== row.id)
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
        const index = employeeList.value.findIndex(e => e.id === form.id)
        if (index !== -1) {
          employeeList.value[index] = { ...employeeList.value[index], ...form }
        }
        ElMessage.success('更新成功')
      } else {
        const newId = Math.max(...employeeList.value.map(e => e.id)) + 1
        employeeList.value.unshift({ ...form, id: newId })
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
  loadEmployees()
})
</script>

<style scoped lang="scss">
.employees-page {
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

  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
