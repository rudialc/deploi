import { useCallback, useEffect, useState, useRef } from 'react'; // добавлен useRef
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, Paper, Stack,
  TextField, Typography, CircularProgress, List, ListItem,
  ListItemAvatar, Avatar, ListItemText, IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {
  addCoachStudent,
  getCoachStudents,
  getStudentActivities,
  getStudentRecommendations,
  removeCoachStudent,
  searchStudents, // нужно добавить в coachApi.js
} from '../services/coachApi';
import { resolveMediaUrl } from '../services/api';

const CoachDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  const loadStudents = useCallback(async () => {
    try {
      const { data } = await getCoachStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // debounced поиск
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchStudents(value);
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleAddStudentFromSearch = async (username) => {
    setError('');
    try {
      await addCoachStudent(username);
      setSearchQuery('');
      setSearchResults([]);
      await loadStudents();
    } catch (err) {
      const body = err.response?.data;
      const msg =
        typeof body === 'string'
          ? body
          : body?.message || body?.error || 'Не удалось добавить ученика';
      setError(String(msg));
    }
  };

  const loadStudentData = async (studentId) => {
    setLoading(true)
    setError('')
    try {
      const [actRes, recRes] = await Promise.all([
        getStudentActivities(studentId),
        getStudentRecommendations(studentId),
      ])
      setActivities(actRes.data)
      setRecommendations(recRes.data)
    } catch (e) {
      setError('Не удалось загрузить данные ученика')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectStudent = (id) => {
    setSelectedId(id)
    loadStudentData(id)
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    setError('')
    if (!studentUsername.trim()) return
    try {
      await addCoachStudent(studentUsername.trim())
      setStudentUsername('')
      await loadStudents()
    } catch (err) {
      const body = err.response?.data
      const msg =
        typeof body === 'string'
          ? body
          : body?.message || body?.error || 'Не удалось добавить ученика'
      setError(String(msg))
    }
  }

  const handleRemove = async (id) => {
    try {
      await removeCoachStudent(id)
      if (selectedId === id) {
        setSelectedId(null)
        setActivities([])
        setRecommendations([])
      }
      await loadStudents()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Stack spacing={4}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            Кабинет тренера
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.65)' }}>
            Найдите ученика по имени или email и добавьте в список.
          </Typography>

          {/* Поле поиска с debounce */}
          <TextField
            label="Поиск ученика"
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
            InputProps={{
              endAdornment: searchLoading ? <CircularProgress size={20} /> : <SearchIcon />,
            }}
          />

          {/* Результаты поиска */}
          {searchResults.length > 0 && (
            <List sx={{ mt: 1, bgcolor: 'rgba(15,23,42,0.5)', borderRadius: 1 }}>
              {searchResults.map((user) => (
                <ListItem
                  key={user.studentId}
                  secondaryAction={
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddStudentFromSearch(user.username)}
                    >
                      Добавить
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={resolveMediaUrl(user.avatarUrl) || undefined}>
                      {user.firstName?.charAt(0) || user.username?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}
                    secondary={user.username}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {error && (
            <Typography variant="body2" sx={{ color: '#fca5a5' }}>
              {error}
            </Typography>
          )}
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="stretch">
        <Paper sx={{ p: 3, flex: { lg: '0 0 320px' }, maxWidth: { lg: 360 } }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Ученики
          </Typography>
          <Stack spacing={1.5}>
            {students.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.55)' }}>
                Пока никого нет — добавьте первого ученика выше.
              </Typography>
            ) : (
              students.map((s) => (
                <Card
                  key={s.studentId}
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    borderColor: selectedId === s.studentId ? 'rgba(125,211,252,0.6)' : undefined,
                    background:
                      selectedId === s.studentId
                        ? 'rgba(125,211,252,0.08)'
                        : 'rgba(15,23,42,0.5)',
                  }}
                  onClick={() => handleSelectStudent(s.studentId)}
                >
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Box>
                        <Typography fontWeight={600}>{s.username}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.9)' }}>
                          {[s.firstName, s.lastName].filter(Boolean).join(' ') || '—'}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(s.studentId)
                        }}
                      >
                        Убрать
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, flex: 1, minHeight: 360 }}>
          {!selectedId ? (
            <Typography variant="body1" sx={{ color: 'rgba(226,232,240,0.6)' }}>
              Выберите ученика слева.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="secondary" indicatorColor="secondary">
                <Tab label="Тренировки" />
                <Tab label="Рекомендации ИИ" />
              </Tabs>
              {loading ? (
                <Typography variant="body2">Загрузка…</Typography>
              ) : tab === 0 ? (
                <Stack spacing={2}>
                  {activities.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.55)' }}>
                      Пока нет тренировок.
                    </Typography>
                  ) : (
                    activities.map((a) => (
                      <Card
                        key={a.id}
                        variant="outlined"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/activity/${a.id}`, { state: { activity: a } })}
                      >
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                              {String(a.type || '').toLowerCase()}
                            </Typography>
                            <Chip label={`${a.duration ?? 0} мин`} size="small" />
                          </Stack>
                          <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.65)', mt: 1 }}>
                            Калории: {a.caloriesBurned ?? 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {recommendations.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.55)' }}>
                      Рекомендаций пока нет (появятся после тренировок с ИИ).
                    </Typography>
                  ) : (
                    recommendations.map((r) => (
                      <Card key={r.id} variant="outlined">
                        <CardContent>
                          <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.9)' }}>
                            Активность {r.activityId}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                            {r.recommendation}
                          </Typography>
                          <Button
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={() => navigate(`/activity/${r.activityId}`, { state: {} })}
                          >
                            Открыть карточку
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Stack>
              )}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Stack>
  )
}

export default CoachDashboard
