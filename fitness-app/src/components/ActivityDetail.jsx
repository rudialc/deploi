import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getActivityById, getActivityRecommendation } from "../services/api";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Skeleton,
  Grid,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Загружаем активность
        const activityRes = await getActivityById(id);
        const baseActivity = activityRes.data;

        // 2. Загружаем рекомендацию (может не существовать, но бэкенд вернет даже дефолтную)
        let recommendation = null;
        try {
          const recRes = await getActivityRecommendation(id);
          recommendation = recRes.data;
        } catch (recErr) {
          console.warn("Рекомендация не загружена:", recErr);
          // не критично – оставляем null
        }

        // 3. Объединяем данные
        const merged = {
          // базовая информация об активности
          id: baseActivity.id,
          type: baseActivity.type,
          duration: baseActivity.duration,
          caloriesBurned: baseActivity.caloriesBurned,
          createdAt: baseActivity.createdAt,
          startTime: baseActivity.startTime,
          // поля рекомендации
          recommendation: recommendation?.recommendation,
          improvements: recommendation?.improvements || [],
          suggestions: recommendation?.suggestions || [],
          safety: recommendation?.safety || [],
          activityType: recommendation?.activityType, // если нужно
        };

        setActivity(merged);
      } catch (err) {
        console.error("Ошибка загрузки данных активности:", err);
        setError("Не удалось загрузить тренировку");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Обработка состояний загрузки и ошибок
  if (loading) {
    return (
      <Paper sx={{ p: 6, maxWidth: 720, mx: "auto" }}>
        <Stack spacing={3}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="rectangular" height={120} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
        </Stack>
      </Paper>
    );
  }

  if (error || !activity) {
    return (
      <Paper sx={{ p: 6, maxWidth: 720, mx: "auto", textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || "Тренировка не найдена"}</Alert>
        <ButtonLike onClick={() => navigate(-1)}>← Вернуться к списку тренировок</ButtonLike>
      </Paper>
    );
  }

  // Далее рендеринг с использованием activity (как было, но без зависимости от location.state)
  const createdAt = activity.createdAt ? new Date(activity.createdAt) : null;

  const metrics = [
    {
      label: "Длительность",
      value: activity.duration,
      suffix: "мин",
      description: "Общее время тренировки",
    },
    {
      label: "Калории",
      value: activity.caloriesBurned,
      suffix: "ккал",
      description: "Энергия, которую вы потратили во время активности",
    },
  ];

  const activityTypeLabel = getActivityLabel(activity.type);

  return (
    <Stack spacing={4} sx={{ maxWidth: 960, mx: "auto" }}>
      {/* Основная карточка тренировки */}
      <Paper
        sx={{
          p: { xs: 4, md: 6 },
          background:
            "linear-gradient(135deg, rgba(18,25,40,0.95) 0%, rgba(12,18,34,0.9) 100%)",
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack spacing={1}>
              <Typography
                variant="overline"
                sx={{ color: "rgba(125,211,252,0.7)", letterSpacing: 3 }}
              >
                Обзор тренировки
              </Typography>
              <Typography variant="h4" fontWeight={700} textTransform="capitalize">
                {activityTypeLabel}
              </Typography>
            </Stack>
            <Stack spacing={1} alignItems="flex-end">
              <Chip
                label={`${activity.caloriesBurned ?? 0} ккал`}
                sx={{
                  background: "rgba(139,107,255,0.18)",
                  color: "#c3b5ff",
                  fontWeight: 600,
                }}
              />
              {createdAt && (
                <Typography variant="caption" sx={{ color: "rgba(148,163,184,0.7)" }}>
                  Добавлено: {createdAt.toLocaleString("ru-RU")}
                </Typography>
              )}
            </Stack>
          </Stack>

          <Grid container spacing={3} columns={12}>
            {metrics.map((metric) => (
              <Grid  xs={12} sm={6} key={metric.label}>
                <MetricCard {...metric} />
              </Grid>
            ))}
          </Grid>

          <Typography variant="body2" sx={{ color: "rgba(226,232,240,0.65)" }}>
            Продолжайте изучать рекомендации ниже, чтобы улучшить эту тренировку
            и приблизиться к своим целям.
          </Typography>

          <Stack direction="row" spacing={2}>
            <ButtonLike onClick={() => navigate(-1)}>
              ← Вернуться к списку тренировок
            </ButtonLike>
          </Stack>
        </Stack>
      </Paper>

      {}
      {(activity.recommendation ||
        activity.improvements.length > 0 ||
        activity.suggestions.length > 0 ||
        activity.safety.length > 0) && (
        <Paper sx={{ p: { xs: 4, md: 5 }, display: "flex", flexDirection: "column", gap: 3 }}>
          {activity.recommendation && (
            <Stack spacing={1.5}>
              <Typography variant="overline" sx={{ color: "rgba(125,211,252,0.7)", letterSpacing: 3 }}>
                ИИ-рекомендации
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(226,232,240,0.8)" }}>
                {activity.recommendation}
              </Typography>
            </Stack>
          )}

          {activity.improvements.length > 0 && (
            <InsightSection title="Что улучшить" items={activity.improvements} />
          )}

          {activity.suggestions.length > 0 && (
            <InsightSection title="Советы" items={activity.suggestions} />
          )}

          {activity.safety.length > 0 && (
            <InsightSection title="Правила безопасности" items={activity.safety} />
          )}
        </Paper>
      )}
    </Stack>
  );
};

const getActivityLabel = (type) => {
  const labels = {
    running: "Бег",
    walking: "Ходьба",
    cycling: "Велосипед",
    swimming: "Плавание",
  };
  return labels[type?.toLowerCase()] || type || "Фитнес-сессия";
};

const InsightSection = ({ title, items }) => (
  <Stack spacing={1.5}>
    <Typography variant="subtitle1" fontWeight={600}>
      {title}
    </Typography>
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0 }}>
      {items.map((item, index) => (
        <Typography
          key={`${title}-${index}`}
          component="li"
          variant="body2"
          sx={{ color: "rgba(226,232,240,0.7)" }}
        >
          • {item}
        </Typography>
      ))}
    </Stack>
  </Stack>
);

const ButtonLike = ({ onClick, children }) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      appearance: "none",
      border: "1px solid rgba(148,163,184,0.25)",
      borderRadius: 12,
      background: "rgba(15,23,42,0.5)",
      color: "#e2e8f0",
      fontWeight: 600,
      cursor: "pointer",
      px: 3,
      py: 1.25,
      transition: "all 0.2s ease",
      textAlign: "left",
      ":hover": {
        borderColor: "rgba(125,211,252,0.6)",
        color: "#7dd3fc",
      },
    }}
  >
    {children}
  </Box>
);

const MetricCard = ({ label, value, suffix, description }) => (
  <Card
    variant="outlined"
    sx={{
      height: "100%",
      background:
        "linear-gradient(145deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.65) 100%)",
      border: "1px solid rgba(148,163,184,0.18)",
    }}
  >
    <CardContent>
      <Stack spacing={1.5}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "rgba(226,232,240,0.65)",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{ display: "flex", alignItems: "baseline", gap: 1 }}
        >
          {value ?? "--"}
          {suffix && (
            <Typography
              component="span"
              variant="h6"
              sx={{ color: "rgba(226,232,240,0.55)", fontWeight: 500 }}
            >
              {suffix}
            </Typography>
          )}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: "rgba(226,232,240,0.55)" }}>
            {description}
          </Typography>
        )}
      </Stack>
    </CardContent>
  </Card>
);

export default ActivityDetail;