import { Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { getActivities } from '../services/api'

const ActivityList = ({ refreshSignal = 0 }) => {
  const [activities, setActivities] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await getActivities()
        setActivities(response.data)
      } catch (error) {
        console.error(error)
      }
    }
    
    fetchActivities()
  }, [refreshSignal])

  const summary = useMemo(() => {
    if (!activities.length) {
      return { totalDuration: 0, totalCalories: 0 }
    }

    return activities.reduce(
      (acc, activity) => ({
        totalDuration: acc.totalDuration + Number(activity.duration || 0),
        totalCalories: acc.totalCalories + Number(activity.caloriesBurned || 0),
      }),
      { totalDuration: 0, totalCalories: 0 },
    )
  }, [activities])

  if (!activities.length) {
    return (
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(12,18,34,0.9) 100%)',
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Нет активностей
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.6)' }}>
            Добавьте свою первую тренировку, чтобы получать персональные рекомендации и отслеживать прогресс.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
        <Chip
          label={`Общая длительность · ${summary.totalDuration} мин`}
          color="primary"
          sx={{
            fontWeight: 600,
            background: 'rgba(139,107,255,0.18)',
            color: '#c3b5ff',
            px: 1.5,
            py: 0.5,
          }}
        />
        <Chip
          label={`Сожжено калорий · ${summary.totalCalories}`}
          sx={{
            fontWeight: 600,
            background: 'rgba(125,211,252,0.18)',
            color: '#b6ecff',
            px: 1.5,
            py: 0.5,
          }}
        />
      </Stack>
      <Grid container spacing={2.5}>
        {activities.map((activity) => {
          const createdAt = activity.createdAt ? new Date(activity.createdAt) : null

          return (
            <Grid item xs={12} sm={6} key={activity.id}>
              <Card
                onClick={() => navigate(`/activity/${activity.id}`, { state: { activity } })}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  ':hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 25px 45px rgba(139,107,255,0.35)',
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {activity.type?.toLowerCase() || 'Активность'}
                      </Typography>
                      <Chip
                        label={`${activity.duration ?? 0} мин`}
                        size="small"
                        sx={{
                          background: 'rgba(139,107,255,0.18)',
                          color: '#c3b5ff',
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                    <Stack spacing={1.25}>
                      <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.65)' }}>
                        Сожжено калорий: <strong>{activity.caloriesBurned ?? 0}</strong>
                      </Typography>
                      {createdAt && (
                        <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                          Добавлено: {createdAt.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.45)' }}>
                      Нажмите, чтобы получить персональные рекомендации и советы по улучшению этой тренировки.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Stack>
  )
}

export default ActivityList