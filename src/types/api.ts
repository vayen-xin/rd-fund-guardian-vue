// API 类型定义

export interface User {
  id: number
  username: string
  status: number
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  username: string
  token: string
  userId: number
}

export interface Employee {
  id: number
  name: string
  type: '正式' | '兼职'
  status: number
  createdAt: string
}

export interface Equipment {
  id: number
  name: string
  depreciationRate: number
  status: number
  createdAt: string
}

export interface Project {
  id: number
  name: string
  startTime: string
  endTime?: string
  status: '进行中' | '已结束' | '已结算'
  createdBy: number
  createdAt: string
}

export interface ProjectEmployee {
  id: number
  projectId: number
  employeeId: number
  coefficient: number
  createdAt: string
}

export interface ProjectSettlement {
  id: number
  projectId: number
  laborCost: number
  directInputCost: number
  depreciationCost: number
  intangibleAmortization: number
  designTestCost: number
  outsourcingCost: number
  ipCost: number
  otherCost: number
  totalAmount: number
  settledBy: number
  settledAt: string
}

export interface OperationLog {
  id: number
  operatorId: number
  operationType: string
  operationDetail: any
  createdAt: string
}
