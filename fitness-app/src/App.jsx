import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import { useLocation } from 'react-router';
import { useMemo, useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setCredentials, logout } from "./store/authSlice";
import { getUserProfile, resolveMediaUrl } from './services/api';
import ActivityForm from "./components/ActivityForm";
import ActivityList from "./components/ActivityList";
import ActivityDetail from "./components/ActivityDetail";
import AuthScreen from "./components/AuthScreen";
import CoachDashboard from "./components/CoachDashboard";
import SchedulePage from "./components/SchedulePage";
import DashboardSummary from "./components/DashboardSummary";
import ProfilePage from "./components/ProfilePage";
import StudentActivityPage from "./components/StudentActivityPage";


const ActivitiesPage = () => {
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
    <Grid container spacing={3} alignItems="stretch">
      <Grid xs={12} lg={4}>
        <Paper
          sx={{
            height: "100%",
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
            background:
              "linear-gradient(160deg, rgba(21, 27, 38, 0.95) 0%, rgba(12, 15, 24, 0.92) 100%)",
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={600}>
              Добавить тренировку
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "rgba(226,232,240,0.65)" }}
            >
              Фиксируйте свои достижения за секунды
            </Typography>
          </Stack>

          <ActivityForm
            onActivityAdded={() =>
              setRefreshSignal((prev) => prev + 1)
            }
          />
        </Paper>
      </Grid>

      <Grid xs={12} lg={8}>
        <Paper
          sx={{
            height: "100%",
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Последние активности
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "rgba(226,232,240,0.6)" }}
              >
                Детальные отчёты и рекомендации ИИ
              </Typography>
            </Box>
          </Stack>

          <ActivityList refreshSignal={refreshSignal} />
        </Paper>
      </Grid>
    </Grid>
  );
};

const CoachRoute = () => {
  const role = useSelector((s) => s.auth.role);
  if (role === "TRAINER") {
    return <CoachDashboard />;
  }
  return <Navigate to="/activity" replace />;
};

const AppShell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [avatarUrl, setAvatarUrl] = useState(null);
  
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);
  const role = useSelector((s) => s.auth.role);

  useEffect(() => {
  if (token) {
    getUserProfile()
      .then(res => setAvatarUrl(resolveMediaUrl(res.data.avatarUrl)))
      .catch(() => {});
  }
}, [token]);

  useEffect(() => {
    const onAvatarUpdated = (e) => setAvatarUrl(resolveMediaUrl(e.detail));
    window.addEventListener('avatar-updated', onAvatarUpdated);
    return () => window.removeEventListener('avatar-updated', onAvatarUpdated);
  }, []);

  const userName = useMemo(() => {
    if (!user) return null;
    return user.given_name || user.name || user.sub || null;
  }, [user]);

  const isTrainer = role === "TRAINER";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(139,107,255,0.25), transparent 45%), radial-gradient(circle at bottom right, rgba(125,211,252,0.22), transparent 42%), linear-gradient(180deg, #05060c 0%, #070511 100%)",
        color: "#f8fafc",
        pb: { xs: 10, md: 12 },
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(5, 6, 12, 0.82)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Toolbar sx={{ py: 2.5, px: { xs: 3, md: 6 }, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8b6bff 0%, #7dd3fc 100%)",
                boxShadow: "0 0 16px rgba(125, 211, 252, 0.5)",
              }}
            />
            <Typography variant="h6" fontWeight={700} letterSpacing={0.8}>
              FitConnect
            </Typography>
          </Stack>
         {token ? (
  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
    {isTrainer ? (
      <>
        <Button color="inherit" onClick={() => navigate("/coach/dashboard")} sx={{ fontWeight: 600 }}>
          Кабинет тренера
        </Button>
        <Button color="inherit" onClick={() => navigate("/profile")} sx={{ fontWeight: 600 }}>
        Профиль
        </Button>
        <Button color="inherit" onClick={() => navigate("/activity")} sx={{ fontWeight: 600 }}>
          Мои тренировки
        </Button>
        <Button color="inherit" onClick={() => navigate("/schedule")} sx={{ fontWeight: 600 }}>
          Расписание
        </Button>



      </>
    ) : (
      <>
      <Button color="inherit" onClick={() => navigate("/profile")} sx={{ fontWeight: 600 }}>
        Профиль
          </Button>
        <Button color="inherit" onClick={() => navigate("/activity")} sx={{ fontWeight: 600 }}>
          Мои тренировки
        </Button>
        <Button color="inherit" onClick={() => navigate("/schedule")} sx={{ fontWeight: 600 }}>
          Расписание
        </Button>
      </>
    )}
    <Stack direction="row" spacing={1} alignItems="center">
  <Avatar src={avatarUrl} sx={{ width: 32, height: 32 }} />
  <Typography variant="body2" sx={{ color: "rgba(226,232,240,0.7)", fontWeight: 500 }}>
    {userName ? `С возвращением, ${userName.split(" ")[0]}!` : "Готов к движению?"}
  </Typography>
</Stack>
    
    <Button
      variant="outlined"
      color="secondary"
      onClick={() => dispatch(logout())}
      sx={{
        borderColor: "rgba(125,211,252,0.35)",
        color: "#7dd3fc",
        ":hover": { borderColor: "rgba(125,211,252,0.65)" },
      }}
    >
      Выйти
    </Button>
  </Stack>
) : (
  <Typography variant="body2" sx={{ color: "rgba(226,232,240,0.7)", fontWeight: 500 }}>
    Вход и регистрация ниже
  </Typography>
)}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ pt: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
        {!token ? (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              minHeight: "70vh",
            }}
          >
            <Paper
              sx={{
                position: "relative",
                overflow: "hidden",
                p: { xs: 5, md: 8 },
                maxWidth: 720,
                textAlign: "left",
                background: "linear-gradient(135deg, rgba(17, 25, 40, 0.92) 0%, rgba(21, 30, 58, 0.92) 100%)",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: 280,
                  height: 280,
                  top: -120,
                  right: -140,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(125, 211, 252, 0.45) 0%, rgba(125, 211, 252, 0) 70%)",
                }}
              />
              <Stack spacing={3}>
                <Stack spacing={1.5}>
                  <Typography variant="overline" sx={{ letterSpacing: 4, color: "rgba(125,211,252,0.75)" }}>
                    Фитнес-платформа с ИИ
                  </Typography>
                  <Typography variant="h3" fontWeight={700} lineHeight={1.15}>
                     Тренировки, дневник питания и персональные рекомендации — в одном приложении.
                  </Typography>
                  <Typography variant="body1" sx={{ color: "rgba(226,232,240,0.7)" }}>
                    Зарегистрируйся как спортсмен или тренер 
                  </Typography>
                </Stack>
                <Stack spacing={2.5} alignItems="stretch">
                  <AuthScreen
                    onLoggedIn={(payload) => {
                      dispatch(setCredentials(payload));
                      navigate(payload.role === "TRAINER" ? "/coach/dashboard" : "/activity");
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "rgba(226,232,240,0.55)" }}>
                    
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        ) : (
          <Stack spacing={6}>
                 {(location.pathname === '/activity') && <DashboardSummary />}

            <Box>
              <Routes>
                <Route path="/activity" element={<ActivitiesPage />} />
                <Route path="/activity/:id" element={<ActivityDetail />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/coach/dashboard" element={<CoachRoute />} />
                <Route path="/coach/students/:studentId" element={<StudentActivityPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/" element={<Navigate to={isTrainer ? "/coach/dashboard" : "/activity"} replace />}
                 />
                <Route
                  path="/"
                  element={<Navigate to={isTrainer ? "/coach/dashboard" : "/activity"} replace />}
                />
              </Routes>
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
