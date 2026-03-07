<template>
  <div class="login-container">
    <!-- 左侧品牌区 -->
    <div class="login-left">
      <div class="brand-header">
        <div class="logo">
          <span>研发费用合规智能管理桌面系统</span>
        </div>
      </div>
      
      <div class="brand-content">
        <div class="brand-image">
          <div class="image-placeholder">
            <div class="mountain"></div>
            <div class="sun"></div>
          </div>
        </div>
        
        <h1 class="brand-title">智能管理</h1>
        
        <ul class="brand-features">
          <li>
            <el-icon class="feature-icon"><CircleCheck /></el-icon>
            <span>轻量高效</span>
          </li>
          <li>
            <el-icon class="feature-icon"><CircleCheck /></el-icon>
            <span>审计友好</span>
          </li>
          <li>
            <el-icon class="feature-icon"><CircleCheck /></el-icon>
            <span>政策对齐</span>
          </li>
          <li>
            <el-icon class="feature-icon"><CircleCheck /></el-icon>
            <span>责任可溯</span>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- 右侧登录表单 -->
    <div class="login-right">
      <div class="login-header">
        <h1>登录</h1>
        <p>欢迎回来，请输入您的账号信息</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入您的账号"
            size="large"
            prefix-icon="Message"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入您的密码"
            size="large"
            prefix-icon="Lock"
            show-password
          >
            <template #suffix>
              <a href="javascript:void(0)" class="forgot-password">忘记密码？</a>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
            style="height: 44px; font-size: 16px;"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p class="tips">需要新建账号请联系系统管理员</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { login } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 临时关闭验证，直接跳转
        // const res = await login(loginForm)
        // userStore.setToken(res.data.token)
        
        // 临时设置 token，方便测试
        userStore.setToken('test-token-123456')
        
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error: any) {
        console.error('登录失败:', error)
        // 如果是网络错误，给个友好提示
        if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
          ElMessage.error('后端服务未启动，请联系管理员')
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  background: #ffffff;
}

// 左侧品牌区
.login-left {
  width: 480px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
  
  .brand-header {
    padding: 24px 32px;
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      
      &::before {
        content: '';
        width: 32px;
        height: 32px;
        background: #1f2937;
        border-radius: 8px;
        display: inline-block;
      }
    }
  }
  
  .brand-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    
    .brand-image {
      width: 280px;
      height: 200px;
      margin-bottom: 48px;
      
      .image-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, #e0f2fe 0%, #fff 100%);
        border-radius: 12px;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        
        .mountain {
          width: 200px;
          height: 120px;
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
          border-radius: 120px 120px 0 0;
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            top: -10px;
            right: 20px;
            width: 20px;
            height: 20px;
            background: #fbbf24;
            border-radius: 50%;
          }
        }
        
        .sun {
          position: absolute;
          top: 30px;
          right: 60px;
          width: 40px;
          height: 40px;
          background: #fbbf24;
          border-radius: 50%;
        }
      }
    }
    
    .brand-title {
      font-size: 28px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 32px;
    }
    
    .brand-features {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        font-size: 15px;
        color: #4b5563;
        
        .feature-icon {
          color: #10b981;
          font-size: 18px;
        }
      }
    }
  }
}

// 右侧登录表单
.login-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  
  .login-header {
    text-align: center;
    margin-bottom: 48px;
    
    h1 {
      font-size: 32px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 14px;
      color: #9ca3af;
    }
  }
  
  .login-form {
    width: 100%;
    max-width: 400px;
    
    .el-form-item {
      margin-bottom: 24px;
    }
    
    .forgot-password {
      font-size: 13px;
      color: #3b82f6;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .login-btn {
      width: 100%;
      margin-top: 16px;
      height: 44px;
      font-size: 16px;
    }
  }
  
  .login-footer {
    margin-top: 24px;
    text-align: center;
    
    .tips {
      font-size: 13px;
      color: #9ca3af;
    }
  }
}

// 响应式
@media (max-width: 1024px) {
  .login-left {
    display: none;
  }
  
  .login-right {
    padding: 24px;
  }
}
</style>
