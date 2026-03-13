<template>
  <div class="operation-log-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">操作日志</h1>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-form">
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
        <div class="form-item">
          <label class="form-label">操作人</label>
          <input 
            type="text" 
            class="form-input" 
            placeholder="请输入操作人姓名"
            v-model="operatorName"
          />
        </div>
        <button class="btn btn-primary" @click="handleSearch">查询</button>
      </div>
      <div class="filter-actions">
        <button class="btn btn-outline">
          <span class="icon">⬇</span>
          导出日志
        </button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th width="60">序号</th>
            <th width="180">操作时间</th>
            <th width="150">操作人</th>
            <th>操作内容</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in logList" :key="log.id">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="datetime">
                <div class="date">{{ log.date }}</div>
                <div class="time">{{ log.time }}</div>
              </div>
            </td>
            <td>
              <div class="operator-info">
                <div class="operator-avatar">{{ log.operator.charAt(0) }}</div>
                <span class="operator-name">{{ log.operator }}</span>
              </div>
            </td>
            <td class="log-content">{{ log.content }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <div class="pagination-left">
          <button class="page-btn-jump">K</button>
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage = 1">
            &lt;&lt;
          </button>
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            &lt;
          </button>
          <button 
            v-for="page in displayPages" 
            :key="page"
            :class="['page-num', currentPage === page ? 'active' : '']"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
            &gt;
          </button>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage = totalPages">
            &gt;&gt;
          </button>
          <button class="page-btn-jump">X</button>
        </div>
        <div class="pagination-right">
          <span class="pagination-info">共 <strong>{{ totalRecords }}</strong> 条</span>
          <span class="pagination-info">每页</span>
          <select class="page-size-select" v-model="pageSize">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span class="pagination-info">条</span>
          <span class="pagination-info">第 <strong>{{ currentPage }}</strong> / {{ totalPages }} 页</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const startDate = ref('')
const endDate = ref('')
const operatorName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(285)

const logList = ref([
  { id: 1, date: '2026-03-01', time: '17:45:00', operator: 'admin', content: '添加了员工「陈静」' },
  { id: 2, date: '2026-03-01', time: '14:42:00', operator: '张伟', content: '修改了员工「李娜」的职位为「高级技师」' },
  { id: 3, date: '2026-03-01', time: '06:22:00', operator: '李娜', content: '删除了员工「赵磊」' },
  { id: 4, date: '2026-03-01', time: '04:45:00', operator: '王芳', content: '批量导入了 8 名员工信息' },
  { id: 5, date: '2026-02-28', time: '13:51:00', operator: '刘洋', content: '手动添加了打卡记录「张伟·2026-02-28」' },
  { id: 6, date: '2026-02-28', time: '08:40:00', operator: '陈静', content: '修改了打卡记录「王芳·2026-03-01」，数据来源变更为手动录入' },
  { id: 7, date: '2026-02-28', time: '06:12:00', operator: 'admin', content: '删除了打卡记录「刘洋·2026-03-05」' },
  { id: 8, date: '2026-02-27', time: '09:27:00', operator: '张伟', content: '导入了 15 条打卡记录' },
  { id: 9, date: '2026-02-27', time: '02:25:00', operator: '李娜', content: '导入了 23 条打卡记录' },
  { id: 10, date: '2026-02-26', time: '15:06:00', operator: '王芳', content: '修改了设备「SM001 冲压机」的折旧单价为 ¥45.00/h' }
])

const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

const displayPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

const handleSearch = () => {
  currentPage.value = 1
}
</script>

<style scoped lang="scss">
.operation-log-page {
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
      min-width: 140px;

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

  .operator-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .operator-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-sm);
      font-weight: 600;
    }

    .operator-name {
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .log-content {
    color: var(--text-primary);
    line-height: 1.6;
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

  .pagination-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .pagination-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .pagination-info {
      font-size: var(--font-sm);
      color: var(--text-secondary);

      strong {
        color: var(--text-primary);
        font-weight: 600;
      }
    }

    .page-size-select {
      padding: 4px 8px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-sm);
      color: var(--text-primary);
      background: white;
      min-width: 60px;
    }
  }

  .page-btn {
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

  .page-btn-jump {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    cursor: pointer;
    font-size: var(--font-sm);
    color: var(--text-hint);
    font-weight: 600;

    &:hover {
      color: var(--text-primary);
    }
  }
}
</style>
