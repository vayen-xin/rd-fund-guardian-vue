<template>
  <div class="project-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">项目管理</h1>
        <span class="page-subtitle">创建和管理研发项目，跟踪项目进度</span>
      </div>
      <div class="header-right">
        <router-link to="/projects/create">
          <el-button type="primary" icon="Plus">
            创建项目
          </el-button>
        </router-link>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="项目状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
            <el-option label="已结算" value="settled" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="filterForm.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="至">
          <el-date-picker
            v-model="filterForm.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 项目列表 -->
    <div class="table-card">
      <el-table :data="projectList" v-loading="loading" style="width: 100%">
        <el-table-column prop="projectId" label="项目编号" width="140" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="参与人员" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.employeeCount }}人</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用设备" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="warning">{{ row.deviceCount }}台</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="项目状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结算金额" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.settlementAmount" class="amount-text">
              ¥{{ formatAmount(row.settlementAmount) }}
            </span>
            <span v-else class="empty-text">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-dropdown trigger="click" @command="handleAction">
              <el-button link type="primary" size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    v-if="row.status === 'ongoing'" 
                    command="end" 
                    :disabled="!canEndProject(row)"
                  >
                    结束项目
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="row.status === 'ended'" 
                    command="settle"
                  >
                    发起结算
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    删除项目
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 结束项目对话框 -->
    <el-dialog
      v-model="endDialogVisible"
      title="结束项目"
      width="400px"
      @close="handleCloseEndDialog"
    >
      <el-form :model="endForm" label-width="80px">
        <el-form-item label="结束日期" required>
          <el-date-picker
            v-model="endForm.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="endDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmEnd" :loading="ending">
          确认结束
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()

// 筛选表单
const filterForm = reactive({
  status: '',
  startDate: '',
  endDate: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 列表数据
const projectList = ref<any[]>([])
const loading = ref(false)

// 结束项目对话框
const endDialogVisible = ref(false)
const ending = ref(false)
const currentProject = ref<any>(null)
const endForm = reactive({
  endDate: ''
})

// Mock 数据
const mockProjects = [
  {
    id: 1,
    projectId: 'PRJ202601001',
    name: '智能客服系统研发',
    description: '新一代 AI 驱动的智能客服平台，集成自然语言处理与知识图谱技术',
    startDate: '2026-01-10',
    endDate: '2026-02-15',
    status: 'settled',
    settlementAmount: 128500.00,
    employeeCount: 5,
    deviceCount: 3,
    createdBy: { id: 1, name: '张伟' },
    createdAt: '2026-01-05T14:30:00.000+08:00'
  },
  {
    id: 2,
    projectId: 'PRJ202602001',
    name: '数据中台 V2.0 升级',
    description: '企业级大数据分析平台升级，提升数据处理能力',
    startDate: '2026-02-01',
    endDate: '',
    status: 'ongoing',
    settlementAmount: null,
    employeeCount: 8,
    deviceCount: 5,
    createdBy: { id: 1, name: '张伟' },
    createdAt: '2026-01-28T09:15:00.000+08:00'
  },
  {
    id: 3,
    projectId: 'PRJ202601002',
    name: '移动端 APP 开发',
    description: 'iOS 和 Android 双平台移动应用开发',
    startDate: '2026-01-15',
    endDate: '2026-03-01',
    status: 'ended',
    settlementAmount: null,
    employeeCount: 6,
    deviceCount: 4,
    createdBy: { id: 2, name: '李娜' },
    createdAt: '2026-01-10T11:20:00.000+08:00'
  },
  {
    id: 4,
    projectId: 'PRJ202603001',
    name: '物联网设备管理平台',
    description: 'IoT 设备接入与管理平台研发',
    startDate: '2026-03-01',
    endDate: '',
    status: 'ongoing',
    settlementAmount: null,
    employeeCount: 4,
    deviceCount: 2,
    createdBy: { id: 1, name: '张伟' },
    createdAt: '2026-02-25T16:00:00.000+08:00'
  },
  {
    id: 5,
    projectId: 'PRJ202512001',
    name: 'AI 算法优化项目',
    description: '深度学习模型优化与性能提升',
    startDate: '2025-12-01',
    endDate: '2026-01-31',
    status: 'settled',
    settlementAmount: 95000.00,
    employeeCount: 3,
    deviceCount: 2,
    createdBy: { id: 3, name: '王强' },
    createdAt: '2025-11-25T10:00:00.000+08:00'
  }
]

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    ongoing: 'success',
    ended: 'warning',
    settled: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    ongoing: '进行中',
    ended: '已结束',
    settled: '已结算'
  }
  return textMap[status] || status
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 判断是否可以结束项目
const canEndProject = (row: any) => {
  return row.status === 'ongoing'
}

// 加载数据
const loadProjects = async () => {
  loading.value = true
  try {
    // TODO: 调用实际 API
    // const res = await getProjects(filterForm, pagination)
    // 使用 Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))
    projectList.value = mockProjects
    pagination.total = mockProjects.length
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadProjects()
  ElMessage.success('搜索完成')
}

// 重置
const handleReset = () => {
  filterForm.status = ''
  filterForm.startDate = ''
  filterForm.endDate = ''
  pagination.page = 1
  loadProjects()
}

// 分页变化
const handleSizeChange = () => {
  loadProjects()
}

const handlePageChange = () => {
  loadProjects()
}

// 查看详情
const handleViewDetail = (row: any) => {
  router.push(`/projects/${row.id}`)
}

// 编辑
const handleEdit = (row: any) => {
  ElMessage.info('编辑功能开发中')
}

// 操作下拉
const handleAction = async (command: string) => {
  if (command === 'end') {
    endDialogVisible.value = true
  } else if (command === 'settle') {
    if (currentProject.value) {
      router.push(`/projects/${currentProject.value.id}/settlement`)
    }
  } else if (command === 'delete') {
    await ElMessageBox.confirm('确定要删除这个项目吗？删除后无法恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('删除成功（Mock）')
  }
}

// 关闭结束对话框
const handleCloseEndDialog = () => {
  endForm.endDate = ''
  currentProject.value = null
}

// 确认结束项目
const handleConfirmEnd = async () => {
  if (!endForm.endDate) {
    ElMessage.warning('请选择结束日期')
    return
  }
  ending.value = true
  try {
    // TODO: 调用 API
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('项目已结束')
    endDialogVisible.value = false
    loadProjects()
  } catch (error) {
    ElMessage.error('结束项目失败')
  } finally {
    ending.value = false
  }
}

onMounted(() => {
  loadProjects()
})
</script>

<style scoped lang="scss">
.project-list-page {
  padding: 24px;
}

// 页面头部
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

// 筛选卡片
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

// 表格卡片
.table-card {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .amount-text {
    font-weight: 600;
    color: #0d9f5f;
  }

  .empty-text {
    color: #9a9fa5;
  }

  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
