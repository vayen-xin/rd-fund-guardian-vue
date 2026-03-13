<template>
  <div class="equipment-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">设备管理</h1>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-left">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索设备编号或名称"
            v-model="searchQuery"
          />
        </div>
        <div class="filter-tabs">
          <button 
            :class="['tab-btn', statusFilter === 'all' ? 'active' : '']"
            @click="statusFilter = 'all'"
          >
            全部
          </button>
          <button 
            :class="['tab-btn', statusFilter === 'active' ? 'active' : '']"
            @click="statusFilter = 'active'"
          >
            启用
          </button>
          <button 
            :class="['tab-btn', statusFilter === 'inactive' ? 'active' : '']"
            @click="statusFilter = 'inactive'"
          >
            停用
          </button>
        </div>
      </div>
      <button class="btn btn-primary" @click="handleAdd">
        <span class="icon">+</span>
        添加设备
      </button>
    </div>

    <!-- 表格区域 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th width="120">设备编号</th>
            <th width="200">设备名称</th>
            <th width="150">折旧单价</th>
            <th width="100">状态</th>
            <th width="140">创建时间</th>
            <th width="100">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="equip in filteredList" :key="equip.id">
            <td>{{ equip.equipmentId }}</td>
            <td class="font-bold">{{ equip.name }}</td>
            <td>¥ {{ equip.depreciationRate }}/小时</td>
            <td>
              <span :class="['status-tag', equip.status === 'active' ? 'active' : 'inactive']">
                {{ equip.status === 'active' ? '启用' : '停用' }}
              </span>
            </td>
            <td>{{ equip.createdAt }}</td>
            <td>
              <button class="btn-link" @click="handleEdit(equip)">修改</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <span class="pagination-info">共 {{ filteredList.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页</span>
        <div class="pagination-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            &lt;
          </button>
          <button 
            :class="['page-num', currentPage === 1 ? 'active' : '']"
            @click="currentPage = 1"
          >
            1
          </button>
          <button 
            :class="['page-num', currentPage === 2 ? 'active' : '']"
            @click="currentPage = 2"
          >
            2
          </button>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
            &gt;
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <div v-if="dialogVisible" class="modal-overlay" @click.self="dialogVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '修改设备' : '添加设备' }}</h3>
          <button class="modal-close" @click="dialogVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form" @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>
                  设备编号
                </label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="form.equipmentId"
                  placeholder="请输入设备编号"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>
                  设备名称
                </label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="form.name"
                  placeholder="请输入设备名称"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>
                  折旧单价
                </label>
                <div class="input-with-addon">
                  <span class="input-addon">¥</span>
                  <input 
                    type="number" 
                    class="form-input" 
                    v-model="form.depreciationRate"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                  <span class="input-addon">/小时</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">
                  <span class="required">*</span>
                  状态
                </label>
                <select class="form-select" v-model="form.status" required>
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">型号</label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="form.model"
                  placeholder="请输入型号"
                />
              </div>
              <div class="form-group">
                <label class="form-label">存放位置</label>
                <input 
                  type="text" 
                  class="form-input" 
                  v-model="form.location"
                  placeholder="请输入存放位置"
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

const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)

const equipmentList = ref([
  { id: 1, equipmentId: 'SM001', name: '全自动焊接机', depreciationRate: '12.50', status: 'active', createdAt: '2024-01-10', model: '', location: '' },
  { id: 2, equipmentId: 'SM002', name: '数控铣床', depreciationRate: '8.00', status: 'active', createdAt: '2024-01-15', model: '', location: '' },
  { id: 3, equipmentId: 'SM003', name: '激光切割机', depreciationRate: '20.00', status: 'active', createdAt: '2024-02-03', model: '', location: '' },
  { id: 4, equipmentId: 'SM004', name: '液压压力机', depreciationRate: '6.50', status: 'inactive', createdAt: '2024-02-18', model: '', location: '' },
  { id: 5, equipmentId: 'SM005', name: '三坐标测量仪', depreciationRate: '15.00', status: 'active', createdAt: '2024-03-01', model: '', location: '' },
  { id: 6, equipmentId: 'SM006', name: '注塑成型机', depreciationRate: '9.00', status: 'active', createdAt: '2024-03-12', model: '', location: '' },
  { id: 7, equipmentId: 'SM007', name: '工业机器人臂', depreciationRate: '25.00', status: 'active', createdAt: '2024-04-05', model: '', location: '' },
  { id: 8, equipmentId: 'SM008', name: '超声波清洗机', depreciationRate: '3.50', status: 'inactive', createdAt: '2024-04-20', model: '', location: '' },
  { id: 9, equipmentId: 'SM009', name: '空气压缩机', depreciationRate: '4.00', status: 'active', createdAt: '2024-05-08', model: '', location: '' },
  { id: 10, equipmentId: 'SM010', name: '电子显微镜', depreciationRate: '30.00', status: 'active', createdAt: '2024-05-20', model: '', location: '' }
])

const dialogVisible = ref(false)
const isEdit = ref(false)

const form = reactive({
  id: null,
  equipmentId: '',
  name: '',
  depreciationRate: '',
  status: 'active',
  model: '',
  location: ''
})

const filteredList = computed(() => {
  let list = equipmentList.value
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(item => 
      item.equipmentId.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query)
    )
  }
  
  // 状态筛选
  if (statusFilter.value !== 'all') {
    list = list.filter(item => item.status === statusFilter.value)
  }
  
  return list
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / 10))

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    equipmentId: '',
    name: '',
    depreciationRate: '',
    status: 'active',
    model: '',
    location: ''
  })
  dialogVisible.value = true
}

const handleEdit = (equip) => {
  isEdit.value = true
  Object.assign(form, { ...equip })
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (isEdit.value) {
    const index = equipmentList.value.findIndex(e => e.id === form.id)
    if (index !== -1) {
      equipmentList.value[index] = { ...form }
    }
  } else {
    const newId = Math.max(...equipmentList.value.map(e => e.id)) + 1
    equipmentList.value.unshift({ ...form, id: newId })
  }
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.equipment-page {
  padding: var(--spacing-4xl);
  min-height: calc(100vh - 80px);
}

// 页面头部
.page-header {
  margin-bottom: var(--spacing-3xl);

  .page-title {
    font-size: var(--font-4xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
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

  .filter-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    flex: 1;
  }
}

// 搜索框
.search-box {
  position: relative;
  width: 280px;

  .search-icon {
    position: absolute;
    left: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--text-hint);
  }

  .search-input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    font-size: var(--font-md);
    color: var(--text-primary);
    background: var(--bg-secondary);
    transition: all 0.2s;

    &:focus {
      outline: none;
      background: white;
      border-color: var(--primary);
    }

    &::placeholder {
      color: var(--text-hint);
    }
  }
}

// 筛选标签
.filter-tabs {
  display: flex;
  gap: var(--spacing-xs);

  .tab-btn {
    padding: 6px 16px;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    background: white;
    font-size: var(--font-md);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    &.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
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
    font-size: 18px;
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

  .status-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 10px;
    border-radius: var(--radius-md);
    font-size: var(--font-sm);

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    &.active {
      background: #f6ffed;
      color: #52c41a;

      &::before {
        background: #52c41a;
      }
    }

    &.inactive {
      background: #f5f5f5;
      color: #8c8c8c;

      &::before {
        background: #8c8c8c;
      }
    }
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
    gap: var(--spacing-xs);

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

    .page-num {
      min-width: 32px;
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

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
      }

      &.active {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
      }
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

    .input-with-addon {
      display: flex;
      align-items: center;

      .input-addon {
        padding: 8px 12px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-default);
        color: var(--text-secondary);
        font-size: var(--font-md);

        &:first-child {
          border-right: none;
          border-radius: var(--radius-md) 0 0 var(--radius-md);
        }

        &:last-child {
          border-left: none;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }
      }

      .form-input {
        border-radius: 0;
        text-align: center;
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
