import { useEffect, useState } from 'react';
import { getActivities, getUserProfile } from '../services/api';
import { Paper, Typography, Stack, Grid, Chip, Skeleton, Box } from '@mui/material';

const DashboardSummary = () => {
  const [stats, setStats] = useState({
  totalActivities: 0,
  weekActivities: 0,
  lastActivity: null,
  avgCalories: 0,
});
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actRes, profRes] = await Promise.all([
          getActivities(),         // последние активности
          getUserProfile(),        // профиль
        ]);
        const activities = actRes.data || [];
        const lastWeek = activities.filter(a => {
          if (!a.createdAt) return false;
          return new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        });
        
        setStats({
          totalActivities: activities.length,
          weekActivities: lastWeek.length,
          lastActivity: activities[0] || null,
          avgCalories: lastWeek.length
            ? Math.round(lastWeek.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0) / lastWeek.length)
            : 0,
        });
        setProfile(profRes.data);
      } catch (err) {
        console.error('Ошибка загрузки дашборда', err);

        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
      }

      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 4, mb: 4 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rectangular" height={100} />
      </Paper>
    );
  }

  return (
    
    <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, rgba(20,24,38,0.95) 0%, rgba(10,13,24,0.9) 100%)' }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={600}>
          Сводка
        </Typography>
        <Grid container spacing={3}>
          <Grid xs={6} sm={3}>
            <Typography variant="overline" color="text.secondary">Всего тренировок</Typography>
            <Typography variant="h4" fontWeight={700}>{stats.totalActivities}</Typography>
          </Grid>
          <Grid xs={6} sm={3}>
            <Typography variant="overline" color="text.secondary">За неделю</Typography>
            <Typography variant="h4" fontWeight={700}>{stats.weekActivities}</Typography>
          </Grid>
          <Grid xs={6} sm={3}>
            <Typography variant="overline" color="text.secondary">Сред. калорий (нед.)</Typography>
            <Typography variant="h4" fontWeight={700}>{stats.avgCalories}</Typography>
          </Grid>
          <Grid xs={6} sm={3}>
            <Typography variant="overline" color="text.secondary">Последняя</Typography>
            {stats.lastActivity ? (
              <Chip label={`${getActivityLabel(stats.lastActivity.type)} ${stats.lastActivity.duration}мин`} />
            ) : (
              <Typography variant="body2" color="text.secondary">—</Typography>
            )}
          </Grid>
        </Grid>
        {profile?.fitnessGoal && (
          <Typography variant="body2" color="text.secondary">
            Цель: {profile.fitnessGoal}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};


const getActivityLabel = (type) => {
  const labels = { RUNNING: 'Бег', WALKING: 'Ходьба', CYCLING: 'Велосипед', SWIMMING: 'Плавание' };
  return labels[type?.toUpperCase()] || type || 'Тренировка';
};

export default DashboardSummary;