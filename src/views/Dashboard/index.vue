<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="24">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #3b82f6;">
              <el-icon :size="24"><FolderOpened /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">2</div>
              <div class="stat-label">进行中项目</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #10b981;">
              <el-icon :size="24"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">已结算项目</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f59e0b;">
              <el-icon :size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">3</div>
              <div class="stat-label">员工总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #8b5cf6;">
              <el-icon :size="24"><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">3</div>
              <div class="stat-label">设备总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>项目资金分布</span>
          </template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>月度费用趋势</span>
          </template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 快捷入口 -->
    <el-card class="quick-actions" style="margin-top: 24px;">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      
      <el-row :gutter="16">
        <el-col :span="6">
          <el-button class="action-btn" @click="$router.push('/projects/create')">
            <el-icon><Plus /></el-icon>
            创建项目
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button class="action-btn" @click="$router.push('/employees')">
            <el-icon><User /></el-icon>
            员工管理
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button class="action-btn" @click="$router.push('/equipment')">
            <el-icon><Monitor /></el-icon>
            设备管理
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button class="action-btn" @click="$router.push('/logs')">
            <el-icon><Document /></el-icon>
            操作日志
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 最近项目 -->
    <el-card style="margin-top: 24px;">
      <template #header>
        <div class="card-header">
          <span>最近项目</span>
          <el-button text type="primary" @click="$router.push('/projects/list')">查看全部</el-button>
        </div>
      </template>
      
      <el-table :data="recentProjects" style="width: 100%">
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="startTime" label="开始时间" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button text type="primary" @click="$router.push(`/projects/${row.id}`)">详情</el-button>
            <el-button text type="primary" v-if="row.status === '已结束'" @click="$router.push(`/projects/${row.id}/settlement`)">结算</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const pieChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()
const recentProjects = ref([
  { id: 1, name: 'AI 算法研发', startTime: '2026-02-01', status: '进行中' },
  { id: 2, name: '数据分析平台', startTime: '2026-02-15', status: '进行中' }
])

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    '进行中': '',
    '已结束': 'warning',
    '已结算': 'success'
  }
  return types[status] || ''
}

// 初始化图表
onMounted(() => {
  // 饼图
  if (pieChartRef.value) {
    const pieChart = echarts.init(pieChartRef.value)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { top: '5%', left: 'center' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 1048, name: '人工费用' },
          { value: 735, name: '直接投入' },
          { value: 580, name: '折旧费用' },
          { value: 484, name: '其他费用' }
        ]
      }]
    })
  }
  
  // 折线图
  if (lineChartRef.value) {
    const lineChart = echarts.init(lineChartRef.value)
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月']
      },
      yAxis: {
        type: 'value',
        name: '金额（元）'
      },
      series: [{
        data: [820, 932, 901, 934, 1290, 1330],
        type: 'line',
        smooth: true,
        areaStyle: {}
      }]
    })
  }
  
  // 响应式
  window.addEventListener('resize', () => {
    pieChartRef.value && echarts.getInstanceByDom(pieChartRef.value)?.resize()
    lineChartRef.value && echarts.getInstanceByDom(lineChartRef.value)?.resize()
  })
})
</script>

<style scoped lang="scss">
.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .stat-info {
      flex: 1;
      
      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .stat-label {
        font-size: 14px;
        color: #6b7280;
        margin-top: 4px;
      }
    }
  }
}

.chart {
  height: 300px;
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-btn {
  width: 100%;
  height: 60px;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
