<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧品牌区 -->
      <div class="login-left">
        <div class="brand-content">
          <div class="brand-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M4 24C4 12.9543 12.9543 4 24 4V4C35.0457 4 44 12.9543 44 24V24C44 35.0457 35.0457 44 24 44V44C12.9543 44 4 35.0457 4 24V24Z" fill="#272B30"/>
              <rect x="14" y="20" width="4" height="8" rx="2" fill="white"/>
              <rect x="22" y="18" width="4" height="12" rx="2" fill="url(#grad1)"/>
              <rect x="30" y="20" width="4" height="8" rx="2" fill="white"/>
              <defs>
                <linearGradient id="grad1" x1="24" y1="18" x2="24" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stop-color="white"/>
                  <stop offset="1" stop-color="#D0D0D0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <h1 class="brand-title">研发费用合规<br/>智能管理系统</h1>
          
          <div class="brand-image">
            <div class="illustration">
              <div class="mountain"></div>
              <div class="sun"></div>
            </div>
          </div>
          
          <ul class="brand-features">
            <li>
              <span class="feature-icon">✓</span>
              <span>轻量高效 - 聚焦核心统计场景</span>
            </li>
            <li>
              <span class="feature-icon">✓</span>
              <span>审计友好 - 结算即生成完整审计包</span>
            </li>
            <li>
              <span class="feature-icon">✓</span>
              <span>政策对齐 - 严格遵循高企八类费用口径</span>
            </li>
            <li>
              <span class="feature-icon">✓</span>
              <span>责任可溯 - 全操作留痕快速定位</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-right">
        <div class="login-box">
          <div class="login-header">
            <h2>欢迎回来</h2>
            <p>请输入您的账号信息以登录系统</p>
          </div>
          
          <form class="login-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <input
                type="text"
                class="form-input"
                v-model="username"
                placeholder="请输入账号"
                required
              />
            </div>
            
            <div class="form-group">
              <input
                type="password"
                class="form-input"
                v-model="password"
                placeholder="请输入密码"
                required
              />
            </div>
            
            <button type="submit" class="login-btn" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>
          
          <div class="login-footer">
            <p>需要新建账号请联系系统管理员</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    // Mock 登录
    userStore.setToken('test-token-123456')
    userStore.setUserInfo({
      id: 1,
      username: username.value,
      role: 'admin'
    })
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  background: #f4f4f4;
}

.login-container {
  width: 100%;
  height: 100%;
  display: flex;
}

// 左侧品牌区
.login-left {
  width: 480px;
  background: #fcfcfc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border-right: 1px solid #f4f4f4;
  
  .brand-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .brand-logo {
      margin-bottom: 24px;
    }
    
    .brand-title {
      font-size: 20px;
      font-weight: 600;
      color: #272b30;
      line-height: 1.4;
      text-align: center;
      margin-bottom: 40px;
    }
    
    .brand-image {
      width: 280px;
      height: 200px;
      margin-bottom: 40px;
      
      .illustration {
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
    
    .brand-features {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        font-size: 14px;
        color: #272b30;
        
        .feature-icon {
          color: #0d9f5f;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
  }
}

// 右侧登录表单
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  
  .login-box {
    width: 100%;
    max-width: 400px;
    background: #fcfcfc;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 32px;
    
    h2 {
      font-size: 24px;
      font-weight: 600;
      color: #272b30;
      margin-bottom: 8px;
    }
    
    p {
      font-size: 14px;
      color: #9a9fa5;
    }
  }
  
  .login-form {
    .form-group {
      margin-bottom: 20px;
      
      .form-input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        font-size: 16px;
        color: #272b30;
        background: white;
        transition: all 0.2s;
        
        &:focus {
          outline: none;
          border-color: #272b30;
          box-shadow: 0 0 0 3px rgba(39, 43, 48, 0.1);
        }
        
        &::placeholder {
          color: #9a9fa5;
        }
      }
    }
    
    .login-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      font-weight: 600;
      color: white;
      background: #272b30;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 8px;
      
      &:hover {
        background: #1a1d21;
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
  
  .login-footer {
    margin-top: 24px;
    text-align: center;
    
    p {
      font-size: 13px;
      color: #9a9fa5;
    }
  }
}

// 响应式
@media (max-width: 1024px) {
  .login-left {
    display: none;
  }
}
</style>
