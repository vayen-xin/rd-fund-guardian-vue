<template>
  <div class="personnel-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">人员管理</h1>
        <p class="page-subtitle">管理企业员工信息，支持正式、兼职、外包人员</p>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="handleAdd">
          <span class="btn-icon">+</span>
          添加人员
        </button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-header">
        <h3 class="filter-title">人员列表</h3>
        <span class="filter-count">{{ employeeList.length }}人</span>
      </div>
      <div class="filter-actions">
        <button class="btn btn-outline">
          <span class="btn-icon">⬆</span>
          批量导入
        </button>
        <button class="btn btn-primary" @click="handleAdd">
          <span class="btn-icon">+</span>
          添加人员
        </button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th width="120">工号</th>
            <th width="100">姓名</th>
            <th width="80">性别</th>
            <th width="140">入职时间</th>
            <th width="140">职位</th>
            <th width="100">员工类型</th>
            <th width="180">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employeeList" :key="emp.id">
            <td>{{ emp.employeeId }}</td>
            <td class="font-bold">{{ emp.name }}</td>
            <td>
              <span :class="['gender-tag', emp.gender === '男' ? 'male' : 'female']">
                {{ emp.gender }}
              </span>
            </td>
            <td>{{ emp.entryDate }}</td>
            <td>{{ emp.position }}</td>
            <td>
              <span :class="['type-tag', getTypeClass(emp.type)]">
                {{ getTypeText(emp.type) }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-link" @click="handleEdit(emp)">修改</button>
              <button class="btn-link btn-delete" @click="handleDelete(emp)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <span class="pagination-info">共 {{ employeeList.length }} 条</span>
        <div class="pagination-controls">
          <select class="page-size" v-model="pageSize">
            <option value="10">10 条/页</option>
            <option value="20">20 条/页</option>
            <option value="50">50 条/页</option>
          </select>
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            &lt;
          </button>
          <span class="page-number">{{ currentPage }}</span>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
            &gt;
          </button>
          <span class="page-info">前往</span>
          <input type="number" class="page-input" v-model="jumpPage" :max="totalPages" />
          <span class="page-info">页</span>
        </div>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <div v-if="dialogVisible" class="modal-overlay" @click.self="dialogVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '修改人员信息' : '添加人员' }}</h3>
          <button class="modal-close" @click="dialogVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>
                  工号
                </label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="form.employeeId"
                  placeholder="请输入工号"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>
                  姓名
                </label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="form.name"
                  placeholder="请输入姓名"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>
                  性别
                </label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" value="男" v-model="form.gender" />
                    <span class="radio-text">男</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" value="女" v-model="form.gender" />
                    <span class="radio-text">女</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>
                  员工类型
                </label>
                <select class="form-select" v-model="form.type" required>
                  <option value="formal">正式员工</option>
                  <option value="part_time">兼职员工</option>
                  <option value="outsourcing">外包员工</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">部门</label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="form.department"
                  placeholder="请输入部门"
                />
              </div>
              <div class="form-group">
                <label class="form-label">职位</label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="form.position"
                  placeholder="请输入职位"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">入职日期</label>
                <input 
                  type="date" 
                  class="form-input" 
                  v-model="form.entryDate"
                />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="dialogVisible = false">取消</button>
          <button type="submit" class="btn btn-primary" @click="handleSubmit">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const employeeList = ref([
  { id: 1, employeeId: 'EMP001', name: '张伟', gender: '男', entryDate: '2021-03-15', position: '软件工程师', type: 'formal' },
  { id: 2, employeeId: 'EMP002', name: '李娜', gender: '女', entryDate: '2020-07-01', position: '产品经理', type: 'formal' },
  { id: 3, employeeId: 'EMP003', name: '王芳', gender: '女', entryDate: '2022-01-10', position: 'UI 设计师', type: 'part_time' },
  { id: 4, employeeId: 'EMP004', name: '刘洋', gender: '男', entryDate: '2019-11-20', position: '数据分析师', type: 'formal' },
  { id: 5, employeeId: 'EMP005', name: '陈静', gender: '女', entryDate: '2023-05-08', position: '测试工程师', type: 'part_time' }
])

const dialogVisible = ref(false)
const isEdit = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const jumpPage = ref(1)

const form = reactive({
  id: null,
  employeeId: '',
  name: '',
  gender: '男',
  type: 'formal',
  department: '',
  position: '',
  entryDate: ''
})

const totalPages = computed(() => Math.ceil(employeeList.value.length / pageSize.value))

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
    formal: '正式员工',
    part_time: '兼职员工',
    outsourcing: '外包员工'
  }
  return map[type] || type
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    employeeId: '',
    name: '',
    gender: '男',
    type: 'formal',
    department: '',
    position: '',
    entryDate: ''
  })
  dialogVisible.value = true
}

const handleEdit = (emp) => {
  isEdit.value = true
  Object.assign(form, { ...emp })
  dialogVisible.value = true
}

const handleDelete = (emp) => {
  if (confirm(`确定要删除 ${emp.name} 吗？`)) {
    employeeList.value = employeeList.value.filter(e => e.id !== emp.id)
  }
}

const handleSubmit = () => {
  if (isEdit.value) {
    const index = employeeList.value.findIndex(e => e.id === form.id)
    if (index !== -1) {
      employeeList.value[index] = { ...form }
    }
  } else {
    const newId = Math.max(...employeeList.value.map(e => e.id)) + 1
    employeeList.value.unshift({ ...form, id: newId })
  }
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.personnel-page {
  padding: 40px;
  min-height: calc(100vh - 80px);
  background: #f4f4f4;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  .header-left {
    .page-title {
      font-size: 30px;
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

// 按钮
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
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
}

.btn-link {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  &.btn-delete {
    color: #ff4d4f;

    &:hover {
      background: #fff1f0;
    }
  }
}

// 筛选卡片
.filter-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .filter-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .filter-title {
      font-size: 16px;
      font-weight: 600;
      color: #272b30;
      margin: 0;
    }

    .filter-count {
      font-size: 13px;
      color: #9a9fa5;
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 6px;
    }
  }
}

// 表格卡片
.table-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 16px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #595959;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
  }

  td {
    padding: 16px 12px;
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

  .gender-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 13px;

    &.male {
      background: #e6f4ff;
      color: #1890ff;
    }

    &.female {
      background: #fff0f6;
      color: #eb2f96;
    }
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
      color: #faad14;
    }

    &.type-out {
      background: #fff7e6;
      color: #faad14;
    }
  }

  .actions {
    display: flex;
    gap: 4px;
  }
}

// 分页
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;

  .pagination-info {
    font-size: 13px;
    color: #595959;
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;

    .page-size {
      padding: 4px 8px;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      font-size: 13px;
      color: #272b30;
      background: white;
    }

    .page-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 13px;
      color: #272b30;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: #252833;
        color: #252833;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .page-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      background: #252833;
      color: white;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    .page-info {
      font-size: 13px;
      color: #595959;
    }

    .page-input {
      width: 50px;
      padding: 4px;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      text-align: center;
      font-size: 13px;
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
  max-width: 600px;
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
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
      color: #272b30;
    }
  }
}

.modal-body {
  padding: 24px;
}

.form {
  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-group {
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
    .form-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
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

    .radio-group {
      display: flex;
      gap: 16px;

      .radio-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        input[type="radio"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .radio-text {
          font-size: 14px;
          color: #272b30;
        }
      }
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f0f0f0;
}
</style>
