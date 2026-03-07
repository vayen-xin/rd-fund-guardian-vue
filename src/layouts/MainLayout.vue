<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside width="240px">
      <div class="logo">
        <el-icon :size="24"><DataAnalysis /></el-icon>
        <span>资金合规管理系统</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        background-color="#1f2937"
        text-color="#9ca3af"
        active-text-color="#2563EB"
        router
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon><component :is="route.meta?.icon" /></el-icon>
          <span>{{ route.meta?.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主体内容 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header>
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute">{{ currentRoute.meta?.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 主题切换 -->
          <el-button
            text
            :icon="appStore.isDark ? 'Sunny' : 'Moon'"
            @click="appStore.toggleTheme"
            title="切换主题"
          />
          
          <span class="username">{{ userStore.userInfo?.username || '用户' }}</span>
          <el-dropdown @command="handleCommand">
            <el-avatar :size="32" icon="User" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { logout as logoutApi } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)
const currentRoute = computed(() => route.matched[route.matched.length - 1])

const menuRoutes = [
  { path: '/dashboard', meta: { title: '工作台', icon: 'DataAnalysis' } },
  { path: '/projects', meta: { title: '项目管理', icon: 'FolderOpened' } },
  { path: '/employees', meta: { title: '员工管理', icon: 'User' } },
  { path: '/equipment', meta: { title: '设备管理', icon: 'Monitor' } },
  { path: '/logs', meta: { title: '操作日志', icon: 'Document' } }
]

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await logoutApi()
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
}

.el-aside {
  background-color: #1f2937;
  color: white;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #374151;
  }
  
  .el-menu {
    border-right: none;
  }
}

.el-header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .username {
      font-size: 14px;
      color: #1f2937;
    }
  }
}

.el-main {
  background-color: #f9fafb;
  padding: 24px;
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
