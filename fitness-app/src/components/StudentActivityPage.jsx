import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getStudentActivities } from '../services/api';
import {
  Paper, Typography, Stack, List, ListItem, ListItemText,
  Chip, Button, CircularProgress
} from '@mui/material';

const StudentActivityPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await getStudentActivities(studentId);
        setActivities(res.data);
      } catch (err) {
        console.error('Ошибка загрузки активностей ученика:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [studentId]);

  if (loading) return <CircularProgress />;

  return (
    <Stack spacing={4}>
      <Paper sx={{ p: 3 }}>
        <Button onClick={() => navigate(-1)}>← Назад к ученикам</Button>
        <Typography variant="h5" mt={2}>Активности ученика</Typography>
        {activities.length === 0 ? (
          <Typography color="text.secondary" mt={2}>Нет активностей</Typography>
        ) : (
          <List>
            {activities.map((act) => (
              <ListItem key={act.id}>
                <ListItemText
                  primary={act.type}
                  secondary={`${act.duration} мин • ${act.caloriesBurned} ккал`}
                />
                <Chip label={act.startTime ? new Date(act.startTime).toLocaleDateString() : ''} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Stack>
  );
};

export default StudentActivityPage;