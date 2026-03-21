// API 基础配置
const API_BASE_URL = 'http://localhost:8080/api/v1';

// 请求封装：自动添加 token，统一错误处理
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(err.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// 通用 CRUD 方法
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>) => {
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return apiFetch<T>(url);
  },
  post: <T>(endpoint: string, body?: any) => apiFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: any) => apiFetch<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),
};

// 认证相关
export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ userId: number; username: string; name: string; role: string; token: string }>('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  current: () => api.get<{ id: number; username: string; name: string; role: string; companyId: number }>('/auth/current'),
};

// 项目管理
export const projectApi = {
  list: (params?: { page?: number; size?: number; status?: string; name?: string }) =>
    api.get<any>('/projects', params),
  get: (id: number) => api.get<any>(`/projects/${id}`),
  create: (body: any) => api.post('/projects', body),
  update: (id: number, body: any) => api.put(`/projects/${id}`, body),
  delete: (id: number) => api.delete(`/projects/${id}`),
  updateStatus: (id: number, status: string) => api.put(`/projects/${id}/status`, null, { status }), // body 参数转为 query
  // 项目设备关联
  addDevice: (projectId: number, body: any) => api.post(`/projects/${projectId}/equipments`, body),
  removeDevice: (projectId: number, equipmentId: number) => api.delete(`/projects/${projectId}/equipments/${equipmentId}`),
  listDevices: (projectId: number) => api.get<any[]>(`/projects/${projectId}/equipments`),
};

// 月度数据
export const monthlyApi = {
  get: (projectId: number, month: string) =>
    api.get<any>(`/projects/${projectId}/monthly/${month}`),
  save: (projectId: number, month: string, data: { costData: string; grandTotal: number }) =>
    api.put(`/projects/${projectId}/monthly/${month}`, data),
  list: (projectId: number) => api.get<any[]>(`/projects/${projectId}/monthly`),
  inherit: (projectId: number, body: { fromMonth: string; toMonth: string }) =>
    api.post(`/projects/${projectId}/monthly/inherit`, body),
};

// 结算
export const settlementApi = {
  create: (projectId: number, settlementMonth: string) =>
    api.post<any>(`/settlements/${projectId}/create?settlementMonth=${settlementMonth}`),
  list: (projectId: number, month?: string) => {
    const endpoint = month ? `settlements/${projectId}?month=${month}` : `settlements/${projectId}`;
    return api.get<any[]>(endpoint);
  },
  reSettle: (projectId: number, settlementMonth: string) =>
    api.post<any>(`/settlements/${projectId}/re-settle?settlementMonth=${settlementMonth}`),
};

// 公司管理
export const companyApi = {
  list: () => api.get<any[]>('/companies'),
  get: (id: number) => api.get<any>(`/companies/${id}`),
  create: (body: any) => api.post('/companies', body),
  update: (id: number, body: any) => api.put(`/companies/${id}`, body),
  delete: (id: number) => api.delete(`/companies/${id}`),
};

// 设备管理
export const deviceApi = {
  list: (companyId?: number) => {
    const endpoint = companyId ? `/devices?companyId=${companyId}` : '/devices';
    return api.get<any[]>(endpoint);
  },
  create: (body: any) => api.post('/devices', body),
  update: (id: number, body: any) => api.put(`/devices/${id}`, body),
  delete: (id: number) => api.delete(`/devices/${id}`),
};

// 员工管理（未来扩展，当前直接使用项目关联接口）
export const employeeApi = {
  // 项目员工关联
  projectList: (projectId: number) => api.get<any[]>(`/projects/${projectId}/employees`),
  projectAdd: (projectId: number, body: any) => api.post(`/projects/${projectId}/employees`, body),
  projectRemove: (projectId: number, employeeId: number) =>
    api.delete(`/projects/${projectId}/employees/${employeeId}`),
};

// 修正：updateStatus 需要支持 query 参数
const originalPost = api.post;
api.post = function<T>(endpoint: string, body?: any): Promise<T> {
  // 如果 body 中有特殊标记，转换为 query 参数
  if (body && typeof body === 'object' && (body as any).__query__) {
    const params = new URLSearchParams();
    Object.entries(body).forEach(([k, v]) => {
      if (k !== '__query__' && v !== undefined && v !== null) {
        params.append(k, String(v));
      }
    });
    const url = params.toString() ? `${endpoint}?${params}` : endpoint;
    return apiFetch<T>(url, { method: 'POST' });
  }
  return originalPost<T>(endpoint, body);
};
