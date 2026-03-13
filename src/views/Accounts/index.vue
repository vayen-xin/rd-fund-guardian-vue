<template>
  <div class="account-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">账号管理</h1>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-left">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索用户名"
            v-model="searchQuery"
          />
        </div>
      </div>
      <div class="filter-actions">
        <button class="btn btn-outline">
          <span class="icon">🔑</span>
          修改密码
        </button>
        <button class="btn btn-primary" @click="handleAdd">
          <span class="icon">+</span>
          添加账号
        </button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th width="60">序号</th>
            <th width="300">用户名</th>
            <th>创建时间</th>
            <th width="120">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(account, index) in filteredList" :key="account.id">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="user-info">
                <div class="user-avatar">{{ account.avatar }}</div>
                <div class="user-details">
                  <div class="user-name">
                    {{ account.username }}
                    <span v-if="account.isCurrent" class="current-tag">当前账号</span>
                  </div>
                </div>
              </div>
            </td>
            <td>
              <div class="datetime">
                <div class="date">{{ account.createdAt.split(' ')[0] }}</div>
                <div class="time">{{ account.createdAt.split(' ')[1] }}</div>
              </div>
            </td>
            <td>
              <span :class="['status-tag', account.status]">
                <span class="status-dot"></span>
                {{ account.status === 'active' ? '启用' : '停用' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 底部统计 -->
      <div class="table-footer">
        <span class="footer-info">共 {{ accountList.length }} 个账号（含当前登录账号）</span>
        <span class="footer-stats">
          启用 <strong class="text-success">{{ activeCount }}</strong> · 停用 <strong class="text-danger">{{ inactiveCount }}</strong>
        </span>
      </div>
    </div>

    <!-- 添加账号弹窗 -->
    <div v-if="dialogVisible" class="modal-overlay" @click.self="dialogVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">添加账号</h3>
          <button class="modal-close" @click="dialogVisible = false">×</button>
        </div>
        <div class="modal-body">
          <form class="form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                用户名
              </label>
              <input 
                type="text" 
                class="form-input" 
                v-model="form.username"
                placeholder="请输入用户名"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                密码
              </label>
              <input 
                type="password" 
                class="form-input" 
                v-model="form.password"
                placeholder="请输入密码"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                确认密码
              </label>
              <input 
                type="password" 
                class="form-input" 
                v-model="form.confirmPassword"
                placeholder="请再次输入密码"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">角色</label>
              <select class="form-select" v-model="form.role">
                <option value="admin">管理员</option>
                <option value="manager">项目经理</option>
                <option value="operator">操作员</option>
              </select>
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
const dialogVisible = ref(false)

const accountList = ref([
  { id: 1, username: 'admin', avatar: 'N', createdAt: '2026-01-01 00:00:00', status: 'active', isCurrent: true },
  { id: 2, username: 'manager01', avatar: '1', createdAt: '2026-01-15 09:30:00', status: 'active', isCurrent: false },
  { id: 3, username: 'operator01', avatar: '1', createdAt: '2026-01-20 14:22:00', status: 'active', isCurrent: false },
  { id: 4, username: 'operator02', avatar: '2', createdAt: '2026-02-01 08:05:00', status: 'active', isCurrent: false },
  { id: 5, username: '张伟', avatar: '伟', createdAt: '2026-02-10 10:00:00', status: 'active', isCurrent: false },
  { id: 6, username: '李娜', avatar: '娜', createdAt: '2026-02-10 10:04:00', status: 'inactive', isCurrent: false },
  { id: 7, username: '王芳', avatar: '芳', createdAt: '2026-02-15 09:00:00', status: 'active', isCurrent: false }
])

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: 'operator'
})

const filteredList = computed(() => {
  if (!searchQuery.value) {
    return accountList.value
  }
  return accountList.value.filter(item => 
    item.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const activeCount = computed(() => 
  accountList.value.filter(item => item.status === 'active').length
)

const inactiveCount = computed(() => 
  accountList.value.filter(item => item.status === 'inactive').length
)

const handleAdd = () => {
  Object.assign(form, {
    username: '',
    password: '',
    confirmPassword: '',
    role: 'operator'
  })
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (form.password !== form.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  const newId = Math.max(...accountList.value.map(a => a.id)) + 1
  accountList.value.push({
    id: newId,
    username: form.username,
    avatar: form.username.charAt(0),
    createdAt: new Date().toISOString().replace('T', ' '),
    status: 'active',
    isCurrent: false
  })
  
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.account-page {
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
    flex: 1;
    max-width: 300px;
  }
}

// 搜索框
.search-box {
  position: relative;

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

  .user-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-md);
      font-weight: 600;
      flex-shrink: 0;
    }

    .user-details {
      .user-name {
        font-weight: 600;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .current-tag {
          font-size: var(--font-xs);
          color: var(--text-hint);
          background: var(--bg-secondary);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-weight: 400;
        }
      }
    }
  }

  .datetime {
    .date {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .time {
      font-size: var(--font-sm);
      color: var(--text-hint);
    }
  }

  .status-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: var(--radius-md);
    font-size: var(--font-sm);

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    &.active {
      background: #f6ffed;
      color: #52c41a;

      .status-dot {
        background: #52c41a;
      }
    }

    &.inactive {
      background: #f5f5f5;
      color: #8c8c8c;

      .status-dot {
        background: #8c8c8c;
      }
    }
  }
}

// 表格底部
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-2xl);
  border-top: 1px solid var(--border-light);

  .footer-info {
    font-size: var(--font-sm);
    color: var(--text-hint);
  }

  .footer-stats {
    font-size: var(--font-sm);
    color: var(--text-secondary);

    strong {
      font-weight: 600;

      &.text-success {
        color: #52c41a;
      }

      &.text-danger {
        color: #ff4d4f;
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
  max-width: 500px;
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
  .form-group {
    margin-bottom: var(--spacing-2xl);

    &:last-child {
      margin-bottom: 0;
    }

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
