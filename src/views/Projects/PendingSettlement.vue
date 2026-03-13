<template>
  <div class="pending-settlement-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">待结算项目</h1>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-form">
        <div class="form-item">
          <label class="form-label">项目名称</label>
          <input 
            type="text" 
            class="form-input" 
            placeholder="搜索项目名称"
            v-model="searchName"
          />
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
          导出 Excel
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
            <th width="100">创建人</th>
            <th width="150">关联资源</th>
            <th width="150">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(project, index) in projectList" :key="project.id">
            <td>{{ index + 1 }}</td>
            <td class="font-bold">{{ project.name }}</td>
            <td>{{ project.startDate }}</td>
            <td>{{ project.endDate }}</td>
            <td>{{ project.creator }}</td>
            <td>
              <div class="resource-info">
                <span>{{ project.employeeCount }}人</span>
                <span class="resource-divider">/</span>
                <span>{{ project.deviceCount }}设备</span>
              </div>
            </td>
            <td>
              <div class="actions">
                <button class="btn-tag btn-success" @click="handleSettle(project)">结算</button>
                <button class="btn-link" @click="handleDetail(project)">详情</button>
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

const searchName = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)

const projectList = ref([
  { id: 1, name: 'AI 算法研发', startDate: '2026-02-10', endDate: '2026-02-28', creator: '陈静', employeeCount: 2, deviceCount: 1 },
  { id: 2, name: '移动端 App 重构', startDate: '2026-01-20', endDate: '2026-02-25', creator: '李娜', employeeCount: 3, deviceCount: 1 },
  { id: 3, name: '安全审计系统', startDate: '2026-01-01', endDate: '2026-02-20', creator: '赵磊', employeeCount: 2, deviceCount: 1 },
  { id: 4, name: '报表自动化', startDate: '2026-02-05', endDate: '2026-02-28', creator: '李娜', employeeCount: 3, deviceCount: 2 },
  { id: 5, name: '云架构迁移', startDate: '2026-01-05', endDate: '2026-02-18', creator: '张伟', employeeCount: 4, deviceCount: 2 }
])

const totalPages = computed(() => Math.ceil(projectList.value.length / 10))

const handleSearch = () => {
  currentPage.value = 1
}

const handleSettle = (project) => {
  router.push(`/projects/${project.id}/settlement`)
}

const handleDetail = (project) => {
  router.push(`/projects/${project.id}`)
}
</script>

<style scoped lang="scss">
.pending-settlement-page {
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

    .form-input {
      padding: 8px 12px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-md);
      color: var(--text-primary);
      background: white;
      min-width: 200px;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }

      &::placeholder {
        color: var(--text-hint);
      }
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .date-separator {
        color: var(--text-hint);
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

.btn-link {
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
}

.btn-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &.btn-success {
    background: #f6ffed;
    color: #52c41a;

    &:hover {
      background: #b7eb8f;
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
    gap: var(--spacing-sm);
    align-items: center;
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
