import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { title: '工作台', icon: 'DataAnalysis' }
      },
      {
        path: 'projects',
        name: 'Projects',
        meta: { title: '项目管理', icon: 'FolderOpened' },
        children: [
          {
            path: '',
            redirect: '/projects/list',
          },
          {
            path: 'list',
            name: 'ProjectList',
            component: () => import('@/views/Projects/List.vue'),
            meta: { title: '项目列表' }
          },
          {
            path: 'create',
            name: 'ProjectCreate',
            component: () => import('@/views/Projects/Create.vue'),
            meta: { title: '创建项目' }
          },
          {
            path: ':id',
            name: 'ProjectDetail',
            component: () => import('@/views/Projects/Detail.vue'),
            meta: { title: '项目详情', hidden: true }
          },
          {
            path: ':id/settlement',
            name: 'ProjectSettlement',
            component: () => import('@/views/Projects/Settlement.vue'),
            meta: { title: '项目结算', hidden: true }
          }
        ]
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/views/Employees/index.vue'),
        meta: { title: '员工管理', icon: 'User' }
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/Equipment/index.vue'),
        meta: { title: '设备管理', icon: 'Monitor' }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/Logs/index.vue'),
        meta: { title: '操作日志', icon: 'Document' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫（临时关闭验证，方便测试 UI）
router.beforeEach((to, from, next) => {
  // const token = localStorage.getItem('token')
  
  // 临时关闭验证，允许直接访问
  next()
  
  // 原始逻辑（暂时注释）
  /*
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
  */
})

export default router
