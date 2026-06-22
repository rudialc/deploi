import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('userId') || null,
    role: localStorage.getItem('role') || null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const p = action.payload
      const username = p.username ?? p.user?.sub ?? ''
      const userId = String(p.userId ?? '')
      const role = p.role ?? 'USER'
      const display =
        [p.firstName, p.lastName].filter(Boolean).join(' ').trim() || username
      state.token = p.token
      state.userId = userId
      state.role = role
      state.user = { sub: username, given_name: display, name: display }

      localStorage.setItem('token', p.token)
      localStorage.setItem('userId', userId)
      localStorage.setItem('role', role)
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.userId = null
      state.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userId')
      localStorage.removeItem('role')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
