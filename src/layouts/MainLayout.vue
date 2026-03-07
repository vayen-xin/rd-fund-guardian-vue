<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-content">
        <!-- Logo -->
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <path d="M4 24C4 12.9543 12.9543 4 24 4V4C35.0457 4 44 12.9543 44 24V24C44 35.0457 35.0457 44 24 44V44C12.9543 44 4 35.0457 4 24V24Z" fill="#272B30"/>
            <rect x="14" y="20" width="4" height="8" rx="2" fill="white"/>
            <rect x="22" y="18" width="4" height="12" rx="2" fill="url(#logoGrad1)"/>
            <rect x="30" y="20" width="4" height="8" rx="2" fill="white"/>
            <defs>
              <linearGradient id="logoGrad1" x1="24" y1="18" x2="24" y2="30" gradientUnits="userSpaceOnUse">
                <stop stop-color="white"/>
                <stop offset="1" stop-color="#D0D0D0"/>
              </linearGradient>
            </defs>
          </svg>
          <span class="logo-text">研发费用合规<br/>智能管理系统</span>
        </div>

        <!-- 首页 -->
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path clip-rule="evenodd" fill-rule="evenodd" :fill="$route.path === '/' ? '#272b30' : '#6F767E'" d="M2.5 9.5L10 2.5L17.5 9.5V17.5C17.5 17.7761 17.2761 18 17 18H13.5C13.2239 18 13 17.7761 13 17.5V12.5C13 12.2239 12.7761 12 12.5 12H7.5C7.22386 12 7 12.2239 7 12.5V17.5C7 17.7761 6.77614 18 6.5 18H3C2.72386 18 2.5 17.7761 2.5 17.5V9.5Z"/>
          </svg>
          <span>首页</span>
          <div v-if="$route.path === '/'" class="active-dot"></div>
        </router-link>

        <!-- 基础数据 -->
        <div class="nav-section">
          <div class="section-header">
            <span class="section-emoji">📚</span>
            <span class="section-title">基础数据</span>
          </div>
          <div class="section-items">
            <router-link to="/employees" class="nav-item" :class="{ active: $route.path === '/employees' }">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path clip-rule="evenodd" fill-rule="evenodd" :fill="$route.path === '/employees' ? '#272b30' : '#6F767E'" d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10ZM10 11.5C6.5 11.5 3.5 13.5 3.5 16V17.5C3.5 17.7761 3.72386 18 4 18H16C16.2761 18 16.5 17.7761 16.5 17.5V16C16.5 13.5 13.5 11.5 10 11.5Z"/>
              </svg>
              <span>人员管理</span>
              <div v-if="$route.path === '/employees'" class="active-dot"></div>
            </router-link>
            <router-link to="/equipment" class="nav-item" :class="{ active: $route.path === '/equipment' }">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path clip-rule="evenodd" fill-rule="evenodd" :fill="$route.path === '/equipment' ? '#272b30' : '#6F767E'" d="M15.5 10.5L11 6L12.5 4.5C13.0523 3.94772 13.0523 3.05228 12.5 2.5C11.9477 1.94772 11.0523 1.94772 10.5 2.5L9 4L4.5 8.5C3.5 9.5 3 11 3 12.5V15H5.5C7 15 8.5 14.5 9.5 13.5L14 9L15.5 10.5C16.0523 11.0523 16.9477 11.0523 17.5 10.5C18.0523 9.94772 18.0523 9.05228 17.5 8.5L15.5 10.5Z"/>
              </svg>
              <span>设备管理</span>
              <div v-if="$route.path === '/equipment'" class="active-dot"></div>
            </router-link>
          </div>
        </div>

        <!-- 项目管理 -->
        <div class="nav-section">
          <div class="section-header">
            <span class="section-emoji">📁</span>
            <span class="section-title">项目管理</span>
          </div>
          <div class="section-items">
            <router-link to="/projects/list" class="nav-item" :class="{ active: $route.path.startsWith('/projects') }">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path clip-rule="evenodd" fill-rule="evenodd" :fill="$route.path.startsWith('/projects') ? '#272b30' : '#6F767E'" d="M2 5C2 4.44772 2.44772 4 3 4H7.27614C7.70924 4 8.12455 4.17186 8.43098 4.47829L9.52171 5.56902C9.82814 5.87545 10.2434 6.04731 10.6765 6.04731H17C17.5523 6.04731 18 6.49503 18 7.04731V15C18 15.5523 17.5523 16 17 16H3C2.44772 16 2 15.5523 2 15V5Z"/>
              </svg>
              <span>项目列表</span>
              <div v-if="$route.path.startsWith('/projects')" class="active-dot"></div>
            </router-link>
          </div>
        </div>

        <!-- 系统管理 -->
        <div class="nav-section">
          <div class="section-header">
            <span class="section-emoji">⚙️</span>
            <span class="section-title">系统管理</span>
          </div>
          <div class="section-items">
            <router-link to="/logs" class="nav-item" :class="{ active: $route.path === '/logs' }">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path clip-rule="evenodd" fill-rule="evenodd" :fill="$route.path === '/logs' ? '#272b30' : '#6F767E'" d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V4ZM5 5V15H15V5H5Z"/>
              </svg>
              <span>操作日志</span>
              <div v-if="$route.path === '/logs'" class="active-dot"></div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- 底部用户信息 -->
      <div class="sidebar-footer">
        <div class="user-avatar">管</div>
        <div class="user-info">
          <span class="user-name">管理员</span>
          <span class="user-email">admin@system.com</span>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 2L14 6L10 10M14 6H6M6 3H3C2.44772 3 2 3.44772 2 4V12C2 12.5523 2.44772 13 3 13H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = async () => {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  height: 100vh;
  background: #f4f4f4;
}

// 侧边栏
.sidebar {
  width: 260px;
  background: #fcfcfc;
  flex-shrink: 0;
  box-shadow: inset -1px 0 0 #f4f4f4;
  display: flex;
  flex-direction: column;
  
  .sidebar-content {
    flex: 1;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px;
    
    .logo-text {
      font-size: 13px;
      font-weight: 600;
      color: #272b30;
      line-height: 1.5;
    }
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    
    span {
      font-size: 14px;
      font-weight: 600;
      color: #6f767e;
    }
    
    &:hover {
      background: #f4f4f4;
      
      span {
        color: #272b30;
      }
    }
    
    &.active {
      background: #efefef;
      box-shadow: inset 0px -2px 1px 0px rgba(0, 0, 0, 0.05), inset 0px 1px 1px 0px white;
      
      span {
        color: #272b30;
      }
      
      .active-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #272b30;
        margin-left: auto;
      }
    }
  }
  
  .nav-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      
      &:hover {
        background: #f4f4f4;
      }
      
      .section-emoji {
        font-size: 14px;
      }
      
      .section-title {
        font-size: 13px;
        font-weight: 600;
        color: #9a9fa5;
      }
    }
    
    .section-items {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 2px;
      margin-left: 8px;
      padding-left: 12px;
      border-left: 1px solid #efefef;
    }
  }
  
  .sidebar-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #f4f4f4;
    
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffbc99;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      
      .user-name {
        font-size: 13px;
        font-weight: 600;
        color: #272b30;
        line-height: 18px;
      }
      
      .user-email {
        font-size: 11px;
        color: #9a9fa5;
        line-height: 16px;
      }
    }
    
    .logout-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #9a9fa5;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        color: #272b30;
      }
    }
  }
}

// 主内容区
.main-content {
  flex: 1;
  overflow: auto;
  padding: 40px;
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
