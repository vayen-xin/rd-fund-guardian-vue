import { get, post } from '@/utils/request'
import type { LoginRequest, LoginResponse, User } from '@/types/api'

// 登录
export function login(data: LoginRequest) {
  return post<LoginResponse>('/auth/login', data)
}

// 登出
export function logout() {
  return post('/auth/logout')
}

// 获取当前用户信息
export function getCurrentUser() {
  return get<User>('/auth/current')
}
