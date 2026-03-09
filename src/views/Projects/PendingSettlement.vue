<template>
  <div class="pending-settlement-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">待结算项目</h1>
        <span class="page-subtitle">已结束但尚未结算的项目列表</span>
      </div>
    </div>

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
        <el-table-column label="预计结算金额" width="140" align="right">
          <template #default="{ row }">
            <span class="estimated-amount">¥{{ row.estimatedAmount?.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleSettle(row)">
              发起结算
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

const projectList = ref([
  { id: 1, projectId: 'PRJ202601001', name: '智能客服系统研发', startDate: '2026-01-10', endDate: '2026-02-15', employeeCount: 5, deviceCount: 3, estimatedAmount: 128500, endedAt: '2026-02-15 16:30:00' },
  { id: 2, projectId: 'PRJ202601002', name: '移动端 APP 开发', startDate: '2026-01-15', endDate: '2026-03-01', employeeCount: 6, deviceCount: 4, estimatedAmount: 95000, endedAt: '2026-03-01 17:00:00' }
])

const handleSettle = (row: any) => {
  router.push(`/projects/${row.id}/settlement`)
  ElMessage.info('跳转到结算页面')
}
</script>

<style scoped lang="scss">
.pending-settlement-page {
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

.table-card {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .estimated-amount {
    font-weight: 600;
    color: #0d9f5f;
  }
}
</style>
