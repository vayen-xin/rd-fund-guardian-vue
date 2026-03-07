import { get, post, put, del } from '@/utils/request'
import type { Employee } from '@/types/api'

// 获取所有员工
export function getEmployees() {
  return get<Employee[]>('/employees')
}

// 创建员工
export function createEmployee(data: Partial<Employee>) {
  return post<Employee>('/employees', data)
}

// 更新员工
export function updateEmployee(id: number, data: Partial<Employee>) {
  return put<Employee>(`/employees/${id}`, data)
}

// 删除员工
export function deleteEmployee(id: number) {
  return del(`/employees/${id}`)
}
