import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getUserProfile, updateUserProfile, uploadAvatar, resolveMediaUrl } from '../services/api';
import {
  Paper, Typography, TextField, Button, Stack, MenuItem,
  Alert, CircularProgress, Grid, Avatar, IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const GENDERS = ['Мужской', 'Женский'];

const ProfilePage = () => {
  const role = useSelector((s) => s.auth.role);
  const isTrainer = role === "TRAINER";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    weightKg: '',
    heightCm: '',
    gender: '',
    phone: '',
    birthDate: '',
    fitnessGoal: '',
    wearableDevice: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getUserProfile();
        const data = res.data;
        setProfile(data);
        setAvatarUrl(resolveMediaUrl(data.avatarUrl));
        setForm({
          weightKg: data.weightKg || '',
          heightCm: data.heightCm || '',
          gender: data.gender || '',
          phone: data.phone || '',
          birthDate: data.birthDate || '',
          fitnessGoal: data.fitnessGoal || '',
          wearableDevice: data.wearableDevice || '',
        });
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Не удалось загрузить профиль' });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.weightKg) payload.weightKg = Number(payload.weightKg);
      if (payload.heightCm) payload.heightCm = Number(payload.heightCm);
      await updateUserProfile(payload);
      setMessage({ type: 'success', text: 'Профиль обновлён' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Ошибка сохранения' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await uploadAvatar(file);
      setAvatarUrl(resolveMediaUrl(res.data.avatarUrl));
      window.dispatchEvent(new CustomEvent('avatar-updated', { detail: res.data.avatarUrl }));
      setMessage({ type: 'success', text: 'Аватар обновлён' });
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
      setMessage({ type: 'error', text: 'Не удалось загрузить аватар' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" mb={3}>Личный кабинет</Typography>
      {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

      {/* Аватар */}
      <Stack direction="row" spacing={3} alignItems="center" mb={3}>
        <Avatar
          src={avatarUrl}
          sx={{ width: 80, height: 80 }}
        />
        <label htmlFor="avatar-upload">
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarUpload}
            disabled={uploadingAvatar}
          />
          <IconButton component="span" disabled={uploadingAvatar}>
            <PhotoCamera />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {uploadingAvatar ? 'Загрузка...' : 'Изменить фото'}
          </Typography>
        </label>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField label="Телефон" name="phone" value={form.phone} onChange={handleChange} fullWidth />
          <TextField
            label="Дата рождения"
            name="birthDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.birthDate}
            onChange={handleChange}
            fullWidth
          />
          <TextField label="Устройство (часы / браслет)" name="wearableDevice" value={form.wearableDevice} onChange={handleChange} fullWidth placeholder="Apple Watch, Garmin..." />

          {!isTrainer && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Вес (кг)" name="weightKg" type="number" value={form.weightKg} onChange={handleChange} fullWidth />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Рост (см)" name="heightCm" type="number" value={form.heightCm} onChange={handleChange} fullWidth />
                </Grid>
              </Grid>
              <TextField label="Пол" name="gender" select value={form.gender} onChange={handleChange} fullWidth>
                {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
              <TextField label="Фитнес-цель" name="fitnessGoal" value={form.fitnessGoal} onChange={handleChange} fullWidth placeholder="Похудеть, набрать массу..." />
            </>
          )}

          {isTrainer && (
            <TextField label="Специализация / О себе" name="fitnessGoal" value={form.fitnessGoal} onChange={handleChange} fullWidth placeholder="Кроссфит, реабилитация, йога..." />
          )}

          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default ProfilePage;