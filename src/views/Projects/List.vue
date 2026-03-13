<template>
  <div class="project-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">项目列表</h1>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-form">
        <div class="form-item">
          <label class="form-label">项目状态</label>
          <select class="form-select" v-model="statusFilter">
            <option value="">全部</option>
            <option value="ongoing">进行中</option>
            <option value="ended">已结束</option>
            <option value="settled">已结算</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">时间范围</label>
          <div class="date-range">
            <input 
              type="date" 
              class="form-input" 
              v-model="startDate"
            />
            <span class="date-separator">至</span>
            <input 
              type="date" 
              class="form-input" 
              v-model="endDate"
            />
          </div>
        </div>
        <button class="btn btn-primary" @click="handleSearch">查询</button>
      </div>
      <div class="filter-actions">
        <button class="btn btn-outline">
          <span class="icon">⬇</span>
          导出列表
        </button>
        <button class="btn btn-primary" @click="handleCreate">
          <span class="icon">+</span>
          创建项目
        </button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th width="60">序号</th>
            <th width="200">项目名称</th>
            <th width="120">开始时间</th>
            <th width="120">结束时间</th>
            <th width="100">状态</th>
            <th width="150">关联资源</th>
            <th width="150">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(project, index) in filteredList" :key="project.id">
            <td>{{ index + 1 }}</td>
            <td class="font-bold">{{ project.name }}</td>
            <td>{{ project.startDate }}</td>
            <td>{{ project.endDate || '—' }}</td>
            <td>
              <span :class="['status-tag', project.status]">
                <span class="status-dot"></span>
                {{ getStatusText(project.status) }}
              </span>
            </td>
            <td>
              <div class="resource-info">
                <span>{{ project.employeeCount }}人</span>
                <span class="resource-divider">/</span>
                <span>{{ project.deviceCount }}设备</span>
              </div>
            </td>
            <td>
              <div class="actions">
                <button class="btn-text" @click="handleDetail(project)">详情</button>
                <button 
                  v-if="project.status === 'ongoing'" 
                  class="btn-text btn-warning"
                  @click="handleEnd(project)"
                >
                  结束
                </button>
                <button 
                  v-if="project.status === 'ended'" 
                  class="btn-text btn-success"
                  @click="handleSettle(project)"
                >
                  结算
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <span class="pagination-info">共 {{ projectList.length }} 个项目，第 {{ currentPage }} / {{ totalPages }} 页</span>
        <div class="pagination-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            &lt;
          </button>
          <button 
            v-for="page in totalPages" 
            :key="page"
            :class="['page-num', currentPage === page ? 'active' : '']"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
            &gt;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)

const projectList = ref([
  { id: 1, name: '智能客服系统', startDate: '2026-01-10', endDate: '2026-02-15', status: 'settled', employeeCount: 3, deviceCount: 2 },
  { id: 2, name: '数据平台 V2', startDate: '2026-02-01', endDate: '', status: 'ongoing', employeeCount: 5, deviceCount: 3 },
  { id: 3, name: 'AI 算法研发', startDate: '2026-02-10', endDate: '2026-02-28', status: 'ended', employeeCount: 2, deviceCount: 1 },
  { id: 4, name: '自动化测试框架', startDate: '2025-11-01', endDate: '2025-12-31', status: 'settled', employeeCount: 2, deviceCount: 2 },
  { id: 5, name: '供应链优化', startDate: '2026-01-15', endDate: '', status: 'ongoing', employeeCount: 4, deviceCount: 2 }
])

const filteredList = computed(() => {
  let list = projectList.value
  
  if (statusFilter.value) {
    list = list.filter(item => item.status === statusFilter.value)
  }
  
  if (startDate.value) {
    list = list.filter(item => item.startDate >= startDate.value)
  }
  
  if (endDate.value) {
    list = list.filter(item => !item.endDate || item.endDate <= endDate.value)
  }
  
  return list
})

const totalPages = computed(() => Math.ceil(filteredList.value.length / 10))

const getStatusText = (status) => {
  const map = {
    ongoing: '进行中',
    ended: '已结束',
    settled: '已结算'
  }
  return map[status] || status
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleCreate = () => {
  router.push('/projects/create')
}

const handleDetail = (project) => {
  router.push(`/projects/${project.id}`)
}

const handleEnd = (project) => {
  if (confirm(`确定要结束项目"${project.name}"吗？`)) {
    project.status = 'ended'
    project.endDate = new Date().toISOString().split('T')[0]
  }
}

const handleSettle = (project) => {
  router.push(`/projects/${project.id}/settlement`)
}
</script>

<style scoped lang="scss">
.project-list-page {
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
  align-items: flex-start;
}

.filter-form {
  display: flex;
  gap: var(--spacing-2xl);
  align-items: flex-end;
  flex: 1;

  .form-item {
    .form-label {
      display: block;
      font-size: var(--font-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
    }

    .form-select,
    .form-input {
      padding: 8px 12px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-md);
      color: var(--text-primary);
      background: white;
      min-width: 140px;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .date-separator {
        color: var(--text-hint);
        font-size: var(--font-md);
      }
    }
  }
}

.filter-actions {
  display: flex;
  gap: var(--spacing-md);
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

.btn-text {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: var(--font-md);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
  }

  &.btn-warning {
    color: var(--warning);

    &:hover {
      background: #fff7e6;
    }
  }

  &.btn-success {
    color: var(--success);

    &:hover {
      background: #f6ffed;
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

  .status-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    border-radius: var(--radius-md);
    font-size: var(--font-sm);

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    &.ongoing {
      background: #e6f4ff;
      color: #1890ff;

      .status-dot {
        background: #1890ff;
      }
    }

    &.ended {
      background: #fff7e6;
      color: #faad14;

      .status-dot {
        background: #faad14;
      }
    }

    &.settled {
      background: #f6ffed;
      color: #52c41a;

      .status-dot {
        background: #52c41a;
      }
    }
  }

  .resource-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-md);
    color: var(--text-primary);

    .resource-divider {
      color: var(--text-hint);
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
</style>
