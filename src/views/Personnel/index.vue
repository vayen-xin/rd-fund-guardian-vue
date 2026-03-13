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
          <span class="icon">+</span>
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
          <span class="icon">⬆</span>
          批量导入
        </button>
        <button class="btn btn-primary" @click="handleAdd">
          <span class="icon">+</span>
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
          <button class="btn btn-outline" @click="dialogVisible = false">取消</button>
          <button class="btn btn-primary" @click="handleSubmit">确认</button>
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
  padding: var(--spacing-4xl);
  min-height: calc(100vh - 80px);
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3xl);

  .header-left {
    .page-title {
      font-size: var(--font-4xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .page-subtitle {
      font-size: var(--font-md);
      color: var(--text-secondary);
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
  font-size: var(--font-md);
  font-weight: 500;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  .icon {
    font-size: 16px;
    font-weight: bold;
  }

  &.btn-primary {
    background: var(--primary);
    color: white;

    &:hover {
      background: var(--primary-hover);
    }
  }

  &.btn-outline {
    background: white;
    color: var(--text-primary);
    border: 1px solid var(--border-dark);

    &:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
  }
}

.btn-link {
  background: none;
  border: none;
  color: var(--info);
  cursor: pointer;
  font-size: var(--font-md);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
  }

  &.btn-delete {
    color: var(--danger);

    &:hover {
      background: #fff1f0;
    }
  }
}

// 筛选卡片
.filter-card {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .filter-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .filter-title {
      font-size: var(--font-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .filter-count {
      font-size: var(--font-sm);
      color: var(--text-hint);
      background: var(--bg-secondary);
      padding: 2px 8px;
      border-radius: var(--radius-md);
    }
  }
}

// 表格卡片
.table-card {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: var(--spacing-lg) var(--spacing-md);
    font-size: var(--font-sm);
    font-weight: 600;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-light);
    background: var(--bg-secondary);
  }

  td {
    padding: var(--spacing-lg) var(--spacing-md);
    font-size: var(--font-md);
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-light);
  }

  tr:hover td {
    background: var(--bg-secondary);
  }

  .font-bold {
    font-weight: 600;
  }

  .gender-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--radius-md);
    font-size: var(--font-sm);

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
    border-radius: var(--radius-md);
    font-size: var(--font-sm);

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
    gap: var(--spacing-xs);
  }
}

// 分页
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-2xl);
  border-top: 1px solid var(--border-light);

  .pagination-info {
    font-size: var(--font-sm);
    color: var(--text-secondary);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .page-size {
      padding: 4px 8px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-sm);
      color: var(--text-primary);
      background: white;
    }

    .page-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      background: white;
      cursor: pointer;
      font-size: var(--font-sm);
      color: var(--text-primary);
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: var(--primary);
        color: var(--primary);
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
      background: var(--primary);
      color: white;
      border-radius: var(--radius-md);
      font-size: var(--font-sm);
      font-weight: 500;
    }

    .page-info {
      font-size: var(--font-sm);
      color: var(--text-secondary);
    }

    .page-input {
      width: 50px;
      padding: 4px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      text-align: center;
      font-size: var(--font-sm);
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
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2xl);
  border-bottom: 1px solid var(--border-light);

  .modal-title {
    font-size: var(--font-2xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 28px;
    color: var(--text-hint);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    transition: all 0.2s;

    &:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
  }
}

.modal-body {
  padding: var(--spacing-2xl);
}

.form {
  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-2xl);
    margin-bottom: var(--spacing-2xl);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-group {
    .form-label {
      display: block;
      font-size: var(--font-md);
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
      font-weight: 500;

      .required {
        color: var(--danger);
        margin-right: 2px;
      }
    }

    .form-input,
    .form-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-md);
      color: var(--text-primary);
      background: white;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(37, 40, 51, 0.1);
      }

      &::placeholder {
        color: var(--text-hint);
      }
    }

    .radio-group {
      display: flex;
      gap: var(--spacing-lg);

      .radio-label {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        cursor: pointer;

        input[type="radio"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .radio-text {
          font-size: var(--font-md);
          color: var(--text-primary);
        }
      }
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  border-top: 1px solid var(--border-light);
}
</style>
