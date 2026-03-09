<template>
  <div class="accounts-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">账号管理</h1>
        <span class="page-subtitle">管理系统用户账号和权限</span>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">
          添加用户
        </el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table :data="userList" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTag(row.role)">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="warning" size="small" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)

const userList = ref([
  { id: 1, username: 'admin', email: 'admin@system.com', phone: '13800138000', role: 'admin', lastLoginAt: '2026-03-09 08:00:00', status: 1 },
  { id: 2, username: 'zhangwei', email: 'zhangwei@company.com', phone: '13800138001', role: 'manager', lastLoginAt: '2026-03-08 17:30:00', status: 1 },
  { id: 3, username: 'lina', email: 'lina@company.com', phone: '13800138002', role: 'manager', lastLoginAt: '2026-03-08 18:00:00', status: 1 },
  { id: 4, username: 'wangqiang', email: 'wangqiang@company.com', phone: '13800138003', role: 'normal', lastLoginAt: '2026-03-07 09:15:00', status: 0 }
])

const getRoleTag = (role: string) => {
  const tagMap: Record<string, any> = {
    admin: 'danger',
    manager: 'warning',
    normal: ''
  }
  return tagMap[role] || ''
}

const getRoleText = (role: string) => {
  const textMap: Record<string, string> = {
    admin: '管理员',
    manager: '项目经理',
    normal: '普通用户'
  }
  return textMap[role] || role
}

const handleAdd = () => {
  ElMessage.info('添加用户功能开发中')
}

const handleEdit = (row: any) => {
  ElMessage.info('编辑用户功能开发中')
}

const handleToggleStatus = async (row: any) => {
  const action = row.status === 1 ? '禁用' : '启用'
  await ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  row.status = row.status === 1 ? 0 : 1
  ElMessage.success(`${action}成功`)
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定要删除 ${row.username} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  userList.value = userList.value.filter(u => u.id !== row.id)
  ElMessage.success('删除成功')
}
</script>

<style scoped lang="scss">
.accounts-page {
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
}
</style>
