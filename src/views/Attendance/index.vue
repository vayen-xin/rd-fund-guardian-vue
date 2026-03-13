<template>
  <div class="attendance-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">打卡记录导入</h1>
    </div>

    <!-- 模板与导入 -->
    <div class="import-card">
      <h3 class="card-title">模板与导入</h3>
      <div class="card-actions">
        <button class="btn btn-outline">
          <span class="icon">⬇</span>
          下载导入模板
        </button>
        <button class="btn btn-outline">
          <span class="icon">⬆</span>
          上传打卡记录
        </button>
        <button class="btn btn-primary">
          <span class="icon">+</span>
          数据添加
        </button>
      </div>
    </div>

    <!-- 筛选与统计 -->
    <div class="filter-card">
      <h3 class="card-title">筛选与统计</h3>
      <div class="filter-form">
        <div class="form-item">
          <label class="form-label">工号</label>
          <input 
            type="text" 
            class="form-input" 
            placeholder="请输入工号"
            v-model="searchEmployeeId"
          />
        </div>
        <div class="form-item">
          <label class="form-label">姓名</label>
          <input 
            type="text" 
            class="form-input" 
            placeholder="请输入姓名"
            v-model="searchName"
          />
        </div>
        <div class="form-item">
          <label class="form-label">日期范围</label>
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
        <button class="btn btn-link" @click="handleReset">重置</button>
      </div>

      <!-- 日历视图 -->
      <div class="calendar-view">
        <div class="calendar-header">
          <button class="calendar-nav" @click="prevMonth">&lt;</button>
          <span class="calendar-title">{{ currentYear }}年{{ currentMonth }}月</span>
          <button class="calendar-nav" @click="nextMonth">&gt;</button>
        </div>
        <div class="calendar-grid">
          <div class="calendar-weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
          <div 
            v-for="day in calendarDays" 
            :key="day.date"
            :class="['calendar-day', day.type, day.hasRecord ? 'has-record' : '']"
          >
            <span class="day-number">{{ day.date }}</span>
            <span v-if="day.hours" class="day-hours">{{ day.hours }}h</span>
          </div>
        </div>
        <div class="calendar-legend">
          <div class="legend-item">
            <span class="legend-dot has-record"></span>
            <span class="legend-text">有打卡记录</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot current"></span>
            <span class="legend-text">查看日期范围</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot"></span>
            <span class="legend-text">无记录</span>
          </div>
        </div>
        <div class="calendar-summary">
          <span class="summary-item">
            <span class="summary-dot"></span>
            筛选结果：共 {{ totalRecords }} 条记录
          </span>
          <span class="summary-item">
            <span class="summary-dot current"></span>
            本月工时：<strong>{{ totalHours }} 小时</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- 打卡记录列表 -->
    <div class="table-card">
      <div class="table-header">
        <h3 class="table-title">打卡记录列表</h3>
        <div class="table-filters">
          <input 
            type="text" 
            class="filter-input" 
            placeholder="请输入姓名"
            v-model="filterName"
          />
          <input 
            type="date" 
            class="filter-input" 
            v-model="filterDate"
          />
          <select class="filter-select" v-model="filterSource">
            <option value="">数据来源</option>
            <option value="system">系统导入</option>
            <option value="manual">手动录入</option>
          </select>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th width="60">序号</th>
            <th width="120">工号</th>
            <th width="100">姓名</th>
            <th width="100">打卡时长</th>
            <th width="120">打卡时间</th>
            <th width="100">数据来源</th>
            <th width="150">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in filteredRecords" :key="record.id">
            <td>{{ index + 1 }}</td>
            <td>{{ record.employeeId }}</td>
            <td class="font-bold">{{ record.name }}</td>
            <td>{{ record.hours }}小时</td>
            <td>{{ record.date }}</td>
            <td>
              <span :class="['source-tag', record.source]">
                {{ record.source === 'system' ? '系统导入' : '手动录入' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="btn-link" @click="handleEdit(record)">编辑</button>
                <button class="btn-link btn-delete" @click="handleDelete(record)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <span class="pagination-info">共 {{ attendanceRecords.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页</span>
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
import { ref, computed, reactive } from 'vue'

const searchEmployeeId = ref('')
const searchName = ref('')
const startDate = ref('')
const endDate = ref('')
const filterName = ref('')
const filterDate = ref('')
const filterSource = ref('')
const currentPage = ref(1)

const currentYear = ref(2026)
const currentMonth = ref(3)
const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const calendarDays = ref([
  { date: 1, type: 'empty', hasRecord: false },
  { date: 2, type: 'record', hours: '30.0', hasRecord: true },
  { date: 3, type: 'record', hours: '31.5', hasRecord: true },
  { date: 4, type: 'record', hours: '28.0', hasRecord: true },
  { date: 5, type: 'record', hours: '38.5', hasRecord: true },
  { date: 6, type: 'record', hours: '37.0', hasRecord: true },
  { date: 7, type: 'normal', hasRecord: false },
  { date: 8, type: 'normal', hasRecord: false },
  { date: 9, type: 'record', hours: '31.5', hasRecord: true },
  { date: 10, type: 'record', hours: '31.0', hasRecord: true },
  { date: 11, type: 'record', hours: '16.0', hasRecord: true },
  { date: 12, type: 'normal', hasRecord: false },
  { date: 13, type: 'normal', hasRecord: false },
  { date: 14, type: 'normal', hasRecord: false },
  { date: 15, type: 'normal', hasRecord: false },
  { date: 16, type: 'normal', hasRecord: false },
  { date: 17, type: 'normal', hasRecord: false },
  { date: 18, type: 'normal', hasRecord: false },
  { date: 19, type: 'normal', hasRecord: false },
  { date: 20, type: 'normal', hasRecord: false },
  { date: 21, type: 'normal', hasRecord: false },
  { date: 22, type: 'normal', hasRecord: false },
  { date: 23, type: 'normal', hasRecord: false },
  { date: 24, type: 'normal', hasRecord: false },
  { date: 25, type: 'normal', hasRecord: false },
  { date: 26, type: 'normal', hasRecord: false },
  { date: 27, type: 'normal', hasRecord: false },
  { date: 28, type: 'normal', hasRecord: false },
  { date: 29, type: 'normal', hasRecord: false },
  { date: 30, type: 'normal', hasRecord: false },
  { date: 31, type: 'normal', hasRecord: false }
])

const attendanceRecords = ref([
  { id: 1, employeeId: 'EMP001', name: '张伟', hours: '8.0', date: '2026-03-02', source: 'system' },
  { id: 2, employeeId: 'EMP002', name: '李娜', hours: '7.5', date: '2026-03-02', source: 'system' },
  { id: 3, employeeId: 'EMP004', name: '刘洋', hours: '8.0', date: '2026-03-02', source: 'system' },
  { id: 4, employeeId: 'EMP006', name: '赵磊', hours: '6.5', date: '2026-03-02', source: 'system' },
  { id: 5, employeeId: 'EMP001', name: '张伟', hours: '8.0', date: '2026-03-03', source: 'system' },
  { id: 6, employeeId: 'EMP002', name: '李娜', hours: '8.0', date: '2026-03-03', source: 'system' },
  { id: 7, employeeId: 'EMP004', name: '刘洋', hours: '7.5', date: '2026-03-03', source: 'system' },
  { id: 8, employeeId: 'EMP006', name: '赵磊', hours: '8.0', date: '2026-03-03', source: 'system' },
  { id: 9, employeeId: 'EMP001', name: '张伟', hours: '8.0', date: '2026-03-04', source: 'system' },
  { id: 10, employeeId: 'EMP003', name: '王芳', hours: '4.0', date: '2026-03-04', source: 'manual' }
])

const totalRecords = computed(() => attendanceRecords.value.length)
const totalHours = computed(() => 243.5)

const filteredRecords = computed(() => {
  let list = attendanceRecords.value
  
  if (filterName.value) {
    list = list.filter(item => item.name.includes(filterName.value))
  }
  
  if (filterDate.value) {
    list = list.filter(item => item.date === filterDate.value)
  }
  
  if (filterSource.value) {
    list = list.filter(item => item.source === filterSource.value)
  }
  
  return list
})

const totalPages = computed(() => Math.ceil(filteredRecords.value.length / 10))

const prevMonth = () => {
  currentMonth.value--
  if (currentMonth.value < 1) {
    currentMonth.value = 12
    currentYear.value--
  }
}

const nextMonth = () => {
  currentMonth.value++
  if (currentMonth.value > 12) {
    currentMonth.value = 1
    currentYear.value++
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchEmployeeId.value = ''
  searchName.value = ''
  startDate.value = ''
  endDate.value = ''
}

const handleEdit = (record) => {
  console.log('编辑', record)
}

const handleDelete = (record) => {
  if (confirm(`确定要删除 ${record.name} 的打卡记录吗？`)) {
    attendanceRecords.value = attendanceRecords.value.filter(r => r.id !== record.id)
  }
}
</script>

<style scoped lang="scss">
.attendance-page {
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

// 卡片通用样式
.import-card,
.filter-card,
.table-card {
  background: var(--bg-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

// 导入卡片
.card-actions {
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

  &.btn-link {
    background: none;
    border: none;
    color: var(--info);
    padding: 4px 8px;

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
}

// 筛选表单
.filter-form {
  display: flex;
  gap: var(--spacing-2xl);
  align-items: flex-end;
  margin-bottom: var(--spacing-2xl);

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

// 日历视图
.calendar-view {
  margin-top: var(--spacing-2xl);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);

  .calendar-nav {
    background: none;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-primary);

    &:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
  }

  .calendar-title {
    font-size: var(--font-lg);
    font-weight: 600;
    color: var(--text-primary);
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.calendar-weekday {
  text-align: center;
  padding: var(--spacing-md);
  font-size: var(--font-sm);
  color: var(--text-hint);
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: var(--font-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
  }

  &.empty {
    visibility: hidden;
  }

  &.record {
    background: #f6ffed;
    color: #52c41a;
  }

  &.has-record {
    background: #f6ffed;
  }

  .day-number {
    font-weight: 500;
  }

  .day-hours {
    font-size: var(--font-xs);
    margin-top: 2px;
  }
}

.calendar-legend {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bg-secondary);

    &.has-record {
      background: #52c41a;
    }

    &.current {
      background: var(--primary);
    }
  }

  .legend-text {
    font-size: var(--font-sm);
    color: var(--text-secondary);
  }
}

.calendar-summary {
  display: flex;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);

  .summary-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-sm);
    color: var(--text-secondary);

    .summary-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--bg-secondary);

      &.current {
        background: var(--primary);
      }
    }

    strong {
      color: var(--text-primary);
      font-weight: 600;
    }
  }
}

// 表格头部
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);

  .table-title {
    font-size: var(--font-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .table-filters {
    display: flex;
    gap: var(--spacing-md);

    .filter-input,
    .filter-select {
      padding: 6px 12px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-sm);
      color: var(--text-primary);
      background: white;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }
    }
  }
}

// 表格
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

  .source-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--radius-md);
    font-size: var(--font-sm);

    &.system {
      background: #e6f4ff;
      color: #1890ff;
    }

    &.manual {
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
