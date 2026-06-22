import { useState } from 'react'
import { Button, Stack, TextField, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { loginRequest, registerRequest } from '../services/authApi'

const AuthScreen = ({ onLoggedIn }) => {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [registerRole, setRegisterRole] = useState('USER')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const { data } = await loginRequest(username, password)
      onLoggedIn({
        token: data.token,
        username: data.username,
        userId: data.userId,
        role: data.role || 'USER',
      })
    } catch (err) {
      const body = err.response?.data
      const msg =
        typeof body === 'string'
          ? body
          : body?.error || body?.message || 'Не удалось войти'
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await registerRequest({ username, email, password, firstName, lastName, role: registerRole })
      setInfo('Регистрация успешна. Войдите с теми же данными.')
      setMode('login')
    } catch (err) {
      const body = err.response?.data
      const msg =
        typeof body === 'string'
          ? body
          : body?.username || body?.message || body?.error || 'Ошибка регистрации'
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={mode === 'login' ? handleLogin : handleRegister}
      sx={{ width: '100%', maxWidth: 420 }}
    >
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={mode}
        onChange={(_, v) => v && setMode(v)}
        sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600 } }}
      >
        <ToggleButton value="login">Вход</ToggleButton>
        <ToggleButton value="register">Регистрация</ToggleButton>
      </ToggleButtonGroup>

      {error ? (
        <Typography variant="body2" sx={{ color: '#fca5a5' }}>
          {error}
        </Typography>
      ) : null}
      {info ? (
        <Typography variant="body2" sx={{ color: 'rgba(125,211,252,0.9)' }}>
          {info}
        </Typography>
      ) : null}

      <TextField
        label="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        fullWidth
        autoComplete="username"
      />
      {mode === 'register' ? (
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoComplete="email"
        />
      ) : null}
      <TextField
        label="Пароль от 6 символов"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />
      {mode === 'register' ? (
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.75)', fontWeight: 600 }}>
            Роль
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={registerRole}
            onChange={(_, v) => v && setRegisterRole(v)}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600 } }}
          >
            <ToggleButton value="USER">Спортсмен</ToggleButton>
            <ToggleButton value="TRAINER">Тренер</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      ) : null}
      {mode === 'register' ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
          />
        </Stack>
      ) : null}

      <Button type="submit" variant="contained" size="large" disabled={loading}>
        {loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
      </Button>
    </Stack>
  )
}

export default AuthScreen
