<template>
  <div class="logs-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">操作日志</h1>
        <span class="page-subtitle">查看系统操作记录，支持按模块、操作人、时间筛选</span>
      </div>
      <div class="header-right">
        <el-button icon="Download" @click="handleExport">
          导出日志
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="操作模块">
          <el-select v-model="filterForm.module" placeholder="全部模块" clearable style="width: 140px">
            <el-option label="项目管理" value="project" />
            <el-option label="员工管理" value="employee" />
            <el-option label="设备管理" value="equipment" />
            <el-option label="系统管理" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filterForm.action" placeholder="全部操作" clearable style="width: 140px">
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="查询" value="query" />
            <el-option label="导出" value="export" />
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="filterForm.operator" placeholder="输入操作人姓名" style="width: 160px" clearable />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 日志列表 -->
    <div class="table-card">
      <el-table :data="logList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="module" label="模块" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getModuleTag(row.module)">
              {{ getModuleText(row.module) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="100">
          <template #default="{ row }">
            <span class="action-text">{{ getActionText(row.action) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="ip" label="IP 地址" width="140" />
        <el-table-column prop="duration" label="耗时 (ms)" width="90" align="right">
          <template #default="{ row }">
            <span :class="getDurationClass(row.duration)">{{ row.duration }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 200 ? 'success' : 'danger'" size="small">
              {{ row.status === 200 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="操作时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="操作日志详情" width="700px">
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item label="日志 ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ getModuleText(currentLog.module) }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ getActionText(currentLog.action) }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLog.operator }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">
          <el-tag :type="getMethodTag(currentLog.method)">{{ currentLog.method }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请求 URL">{{ currentLog.url }}</el-descriptions-item>
        <el-descriptions-item label="IP 地址">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="User Agent">
          <div class="ua-text">{{ currentLog.userAgent }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="请求参数">
          <pre class="json-preview">{{ JSON.stringify(currentLog.requestParams, null, 2) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="响应状态码">
          <el-tag :type="currentLog.responseStatus === 200 ? 'success' : 'danger'">
            {{ currentLog.responseStatus }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentLog.duration }} ms</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentLog.createdAt }}</el-descriptions-item>
        <el-descriptions-item v-if="currentLog.errorMsg" label="错误信息">
          <div class="error-text">{{ currentLog.errorMsg }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const detailDialogVisible = ref(false)
const currentLog = ref<any>(null)

// 筛选表单
const filterForm = reactive({
  module: '',
  action: '',
  operator: '',
  dateRange: [] as string[]
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 列表数据
const logList = ref<any[]>([])

// Mock 数据
const mockLogs = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  module: ['project', 'employee', 'equipment', 'system'][Math.floor(Math.random() * 4)],
  action: ['create', 'update', 'delete', 'query', 'login', 'logout'][Math.floor(Math.random() * 6)],
  operator: ['张伟', '李娜', '王强', '赵敏', '系统'][Math.floor(Math.random() * 5)],
  ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
  method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
  url: ['/api/v1/projects', '/api/v1/employees', '/api/v1/equipment', '/api/v1/auth/login'][Math.floor(Math.random() * 4)],
  requestParams: { page: 1, pageSize: 10 },
  responseStatus: Math.random() > 0.1 ? 200 : 500,
  duration: Math.floor(Math.random() * 500) + 10,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toLocaleString('zh-CN'),
  errorMsg: Math.random() > 0.9 ? 'Internal Server Error' : null
}))

// 工具函数
const getModuleTag = (module: string) => {
  const tagMap: Record<string, any> = {
    project: '',
    employee: 'success',
    equipment: 'warning',
    system: 'info'
  }
  return tagMap[module] || ''
}

const getModuleText = (module: string) => {
  const textMap: Record<string, string> = {
    project: '项目管理',
    employee: '员工管理',
    equipment: '设备管理',
    system: '系统管理'
  }
  return textMap[module] || module
}

const getActionText = (action: string) => {
  const textMap: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    query: '查询',
    export: '导出',
    login: '登录',
    logout: '登出'
  }
  return textMap[action] || action
}

const getMethodTag = (method: string) => {
  const tagMap: Record<string, any> = {
    GET: 'info',
    POST: 'success',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return tagMap[method] || ''
}

const getDurationClass = (duration: number) => {
  if (duration < 100) return 'duration-fast'
  if (duration < 300) return 'duration-normal'
  return 'duration-slow'
}

// 加载数据
const loadLogs = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    logList.value = mockLogs.slice(
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize
    )
    pagination.total = mockLogs.length
  } catch (error) {
    ElMessage.error('加载日志失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadLogs()
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = () => {
  filterForm.module = ''
  filterForm.action = ''
  filterForm.operator = ''
  filterForm.dateRange = []
  pagination.page = 1
  loadLogs()
}

// 分页
const handleSizeChange = () => loadLogs()
const handlePageChange = () => loadLogs()

// 查看详情
const handleViewDetail = (row: any) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped lang="scss">
.logs-page {
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

  .action-text {
    font-weight: 500;
    color: #272b30;
  }

  .duration-fast {
    color: #0d9f5f;
  }

  .duration-normal {
    color: #d48806;
  }

  .duration-slow {
    color: #c2185b;
  }

  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}

.ua-text {
  font-size: 12px;
  color: #6f767e;
  word-break: break-all;
  line-height: 1.6;
}

.json-preview {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #272b30;
  max-height: 200px;
  overflow: auto;
  margin: 0;
}

.error-text {
  color: #c2185b;
  font-family: monospace;
  font-size: 13px;
}
</style>
