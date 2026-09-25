import { apiRequest } from './client.js'

export const authApi = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: data }),
  me: () => apiRequest('/auth/me'),
  updateMe: (data) => apiRequest('/auth/me', { method: 'PATCH', body: data }),
  changePassword: (currentPassword, newPassword) =>
    apiRequest('/auth/password', { method: 'PATCH', body: { currentPassword, newPassword } }),
}

export const complaintsApi = {
  list: (params) => apiRequest('/complaints', { params }),
  stats: () => apiRequest('/complaints/stats'),
  get: (id) => apiRequest(`/complaints/${id}`),
  create: (data) => apiRequest('/complaints', { method: 'POST', body: data }),
  updateStatus: (id, status, note) =>
    apiRequest(`/complaints/${id}/status`, { method: 'PATCH', body: { status, note } }),
  assign: (id, agentId) => apiRequest(`/complaints/${id}/assign`, { method: 'PATCH', body: { agentId } }),
  comment: (id, text) => apiRequest(`/complaints/${id}/comments`, { method: 'POST', body: { text } }),
}

export const usersApi = {
  list: (params) => apiRequest('/users', { params }),
  createStaff: (data) => apiRequest('/users', { method: 'POST', body: data }),
  setActive: (id, isActive) => apiRequest(`/users/${id}`, { method: 'PATCH', body: { isActive } }),
}
