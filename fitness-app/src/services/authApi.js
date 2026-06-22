import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const authClient = axios.create({
  baseURL: `${baseURL.replace(/\/$/, '')}/auth`,
})

export const loginRequest = (username, password) =>
  authClient.post('/login', { username, password })

export const registerRequest = ({ username, email, password, firstName, lastName, role }) =>
  authClient.post('/register', { username, email, password, firstName, lastName, role })
