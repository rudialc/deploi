import { api } from './api'
export const searchStudents = (query) => api.get('/coach/search-students', { params: { query } });
export const getCoachStudents = () => api.get('/coach/students')
export const addCoachStudent = (username) => api.post('/coach/students', { username })
export const removeCoachStudent = (studentId) => api.delete(`/coach/students/${studentId}`)
export const getStudentActivities = (studentId) => api.get(`/coach/students/${studentId}/activities`)
export const getStudentRecommendations = (studentId) => api.get(`/coach/students/${studentId}/recommendations`)
