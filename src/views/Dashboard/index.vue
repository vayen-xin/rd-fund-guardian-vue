<template>
  <div class="home-page">
    <h1 class="page-title">首页</h1>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-badge employee">员工总数</div>
        <div class="stat-value">128</div>
        <div class="stat-sub">较上月 +3</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-badge equipment">在职设备</div>
        <div class="stat-value">64</div>
        <div class="stat-sub">设备在线率 92%</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-badge project">项目数量</div>
        <div class="stat-value">12</div>
        <div class="stat-sub">进行中 8 个</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-badge attendance">本月打卡</div>
        <div class="stat-value">3,840</div>
        <div class="stat-sub">异常记录 6 条</div>
      </div>
    </div>

    <!-- 快速入口 -->
    <div class="quick-links-card">
      <h2 class="card-title">快速入口</h2>
      <div class="quick-links-grid">
        <router-link to="/employees" class="quick-link">
          <div class="quick-link-icon employee">→</div>
          <div class="quick-link-info">
            <div class="quick-link-title">人员管理</div>
            <div class="quick-link-desc">查看与管理员工信息</div>
          </div>
        </router-link>
        
        <router-link to="/equipment" class="quick-link">
          <div class="quick-link-icon equipment">→</div>
          <div class="quick-link-info">
            <div class="quick-link-title">设备管理</div>
            <div class="quick-link-desc">管理研发设备资产</div>
          </div>
        </router-link>
        
        <router-link to="/projects/list" class="quick-link">
          <div class="quick-link-icon project">→</div>
          <div class="quick-link-info">
            <div class="quick-link-title">项目列表</div>
            <div class="quick-link-desc">查看所有研发项目</div>
          </div>
        </router-link>
        
        <router-link to="/logs" class="quick-link">
          <div class="quick-link-icon log">→</div>
          <div class="quick-link-info">
            <div class="quick-link-title">操作日志</div>
            <div class="quick-link-desc">系统操作记录查询</div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 工作台页面
</script>

<style scoped lang="scss">
.home-page {
  padding: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #272b30;
  line-height: 40px;
  letter-spacing: -0.6px;
  margin-bottom: 28px;
}

// 统计卡片
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fcfcfc;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  
  .stat-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 12px;
    
    &.employee {
      background: #e8f0fe;
      color: #3b5bdb;
    }
    
    &.equipment {
      background: #e6f9f0;
      color: #0d9f5f;
    }
    
    &.project {
      background: #fff8e6;
      color: #d48806;
    }
    
    &.attendance {
      background: #fce8f3;
      color: #c2185b;
    }
  }
  
  .stat-value {
    font-size: 32px;
    font-weight: 600;
    color: #272b30;
    line-height: 40px;
    letter-spacing: -0.6px;
  }
  
  .stat-sub {
    font-size: 13px;
    color: #9a9fa5;
    margin-top: 4px;
  }
}

// 快速入口
.quick-links-card {
  background: #fcfcfc;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #272b30;
    margin-bottom: 16px;
  }
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #f4f4f4;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    border-color: #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .quick-link-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    
    &.employee {
      background: #e8f0fe;
    }
    
    &.equipment {
      background: #e6f9f0;
    }
    
    &.project {
      background: #fff8e6;
    }
    
    &.log {
      background: #f0f0ff;
    }
  }
  
  .quick-link-info {
    .quick-link-title {
      font-size: 14px;
      font-weight: 600;
      color: #272b30;
    }
    
    .quick-link-desc {
      font-size: 12px;
      color: #9a9fa5;
      margin-top: 2px;
    }
  }
}
</style>
