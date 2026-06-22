import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getActivitiesByRange } from "../services/api";

import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  IconButton,
  Chip,
  Skeleton,
  Alert,
  Divider,
} from "@mui/material";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";

import { ru } from "date-fns/locale";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const SchedulePage = () => {
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [dayActivities, setDayActivities] = useState([]);

  const fetchMonthActivities = useCallback(
    async (monthStart, monthEnd) => {
      queueMicrotask(() => setLoading(true));

      try {
        const startStr = format(
          monthStart,
          "yyyy-MM-dd"
        );

        const endStr = format(
          monthEnd,
          "yyyy-MM-dd"
        );

        const res =
          await getActivitiesByRange(
            startStr,
            endStr
          );

        setActivities(res.data || []);
      } catch (err) {
        console.error(
          "Ошибка загрузки календаря:",
          err
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const monthStart =
      startOfMonth(currentMonth);

    const monthEnd =
      endOfMonth(currentMonth);

    fetchMonthActivities(
      monthStart,
      monthEnd
    );
  }, [currentMonth, fetchMonthActivities]);

  useEffect(() => {
    handleDayClick(selectedDate);
  }, [activities]);

  const handleDayClick = (day) => {
    setSelectedDate(day);

    const filtered = activities.filter(
      (act) => {
        if (!act.startTime) return false;

        const actDate = parseISO(
          act.startTime
        );

        return isSameDay(actDate, day);
      }
    );

    setDayActivities(filtered);
  };

  const prevMonth = () =>
    setCurrentMonth(
      subMonths(currentMonth, 1)
    );

  const nextMonth = () =>
    setCurrentMonth(
      addMonths(currentMonth, 1)
    );

  const monthStart =
    startOfMonth(currentMonth);

  const monthEnd =
    endOfMonth(currentMonth);

  const calendarStart = startOfWeek(
    monthStart,
    {
      weekStartsOn: 1,
    }
  );

  const calendarEnd = endOfWeek(monthEnd, {
    weekStartsOn: 1,
  });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const activityDates = useMemo(
    () =>
      new Set(
        activities
          .filter((a) => a.startTime)
          .map((a) =>
            format(
              parseISO(a.startTime),
              "yyyy-MM-dd"
            )
          )
      ),
    [activities]
  );

  const stats = useMemo(() => {
    const totalWorkouts =
      activities.length;

    const totalCalories =
      activities.reduce(
        (sum, a) =>
          sum + (a.caloriesBurned || 0),
        0
      );

    const activeDays = new Set(
      activities.map((a) =>
        format(
          parseISO(a.startTime),
          "yyyy-MM-dd"
        )
      )
    ).size;

    return {
      totalWorkouts,
      totalCalories,
      activeDays,
    };
  }, [activities]);

  return (
    <Box
      sx={{
        minHeight: "100vh",

        background: `
          radial-gradient(
            circle at top left,
            rgba(59,130,246,0.12),
            transparent 25%
          ),

          radial-gradient(
            circle at top right,
            rgba(139,92,246,0.12),
            transparent 25%
          ),

          #020617
        `,

        py: 5,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,

          mx: "auto",

          display: "flex",

          flexDirection: "column",

          gap: 4,
        }}
      >
        {/* STATS */}

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={3}
        >
          <StatCard
            icon={<FitnessCenterIcon />}
            title="Тренировок"
            value={stats.totalWorkouts}
          />

          <StatCard
            icon={
              <LocalFireDepartmentIcon />
            }
            title="Калории"
            value={`${stats.totalCalories} ккал`}
          />

          <StatCard
            icon={<CalendarMonthIcon />}
            title="Активных дней"
            value={stats.activeDays}
          />
        </Stack>

        {/* CALENDAR */}

        <Box
          sx={{
            px: {
              xs: 0,
              md: 1,
            },

            py: 1,
          }}
        >
          {/* HEADER */}

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={4}
          >
            <IconButton
              onClick={prevMonth}
              sx={navButtonStyles}
            >
              <ChevronLeftIcon />
            </IconButton>

            <Typography
              sx={{
                color: "#f8fafc",

                fontWeight: 800,

                fontSize: {
                  xs: "1.2rem",
                  md: "1.6rem",
                },

                textTransform:
                  "capitalize",

                letterSpacing: 0.5,
              }}
            >
              {format(
                currentMonth,
                "LLLL yyyy",
                {
                  locale: ru,
                }
              )}
            </Typography>

            <IconButton
              onClick={nextMonth}
              sx={navButtonStyles}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          {/* CALENDAR GRID */}

          <Grid
            container
            columns={7}
            spacing={1.5}
          >
            {calendarDays.map((day) => {
              const formatted = format(
                day,
                "yyyy-MM-dd"
              );

              const hasActivity =
                activityDates.has(
                  formatted
                );

              const isCurrentMonthDay =
                isSameMonth(
                  day,
                  currentMonth
                );

              const isSelected =
                selectedDate &&
                isSameDay(
                  day,
                  selectedDate
                );

              const isToday = isSameDay(
                day,
                new Date()
              );

              const dayCount =
                activities.filter((a) =>
                  isSameDay(
                    parseISO(a.startTime),
                    day
                  )
                ).length;

              return (
                <Grid
                  item
                  xs={1}
                  key={day.toString()}
                >
                  <Box
                    onClick={() =>
                      handleDayClick(day)
                    }
                    sx={{
                      position: "relative",

                      minHeight: {
                        xs: 72,
                        sm: 88,
                        md: 100,
                      },

                      borderRadius: 4,

                      p: 1.2,

                      display: "flex",

                      flexDirection:
                        "column",

                      justifyContent:
                        "flex-start",

                      cursor: "pointer",

                      overflow: "hidden",

                      background: isSelected
                        ? "linear-gradient(145deg, rgba(59,130,246,0.32), rgba(139,92,246,0.28))"
                        : isCurrentMonthDay
                        ? "rgba(255,255,255,0.035)"
                        : "rgba(255,255,255,0.015)",

                      border: isToday
                        ? "1px solid rgba(96,165,250,0.8)"
                        : isSelected
                        ? "1px solid rgba(139,92,246,0.55)"
                        : "1px solid rgba(255,255,255,0.04)",

                      color:
                        isCurrentMonthDay
                          ? "#f1f5f9"
                          : "rgba(148,163,184,0.35)",

                      transition:
                        "all .22s ease",

                      boxShadow:
                        isSelected
                          ? "0 8px 24px rgba(59,130,246,0.22)"
                          : "none",

                      "&:hover": {
                        transform:
                          "translateY(-3px)",

                        background:
                          isSelected
                            ? "linear-gradient(145deg, rgba(59,130,246,0.38), rgba(139,92,246,0.32))"
                            : "rgba(255,255,255,0.06)",

                        border:
                          "1px solid rgba(255,255,255,0.1)",

                        boxShadow: `
                          0 12px 24px rgba(0,0,0,0.28),
                          0 0 0 1px rgba(255,255,255,0.02)
                        `,
                      },

                      "&::before":
                        hasActivity
                          ? {
                              content:
                                '""',

                              position:
                                "absolute",

                              top: 0,
                              left: 0,

                              width: 4,

                              height:
                                "100%",

                              background:
                                "linear-gradient(180deg, #38bdf8, #8b5cf6)",
                            }
                          : {},
                    }}
                  >
                    <Stack spacing={0.2}>
                      <Typography
                        sx={{
                          fontSize: {
                            xs: 14,
                            md: 16,
                          },

                          fontWeight: 800,

                          lineHeight: 1,
                        }}
                      >
                        {format(day, "d")}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 11,

                          fontWeight: 600,

                          color:
                            isCurrentMonthDay
                              ? "rgba(148,163,184,0.7)"
                              : "rgba(148,163,184,0.28)",
                        }}
                      >
                        {format(day, "EEE", {
                          locale: ru,
                        })}
                      </Typography>
                    </Stack>

                    {hasActivity && (
                      <Chip
                        label={`${dayCount}`}
                        size="small"
                        sx={{
                          mt: "auto",

                          alignSelf:
                            "flex-end",

                          height: 22,

                          fontSize: 11,

                          fontWeight: 800,

                          background:
                            "linear-gradient(135deg,#38bdf8,#8b5cf6)",

                          color: "#fff",

                          "& .MuiChip-label":
                            {
                              px: 1,
                            },
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* ACTIVITIES */}

        {selectedDate && (
          <Paper
            elevation={0}
            sx={{
              p: 3,

              borderRadius: 5,

              background:
                "rgba(255,255,255,0.03)",

              border:
                "1px solid rgba(255,255,255,0.05)",

              backdropFilter:
                "blur(20px)",
            }}
          >
            <Typography
              sx={{
                color: "#f8fafc",

                fontWeight: 700,

                fontSize: "1.2rem",

                mb: 3,
              }}
            >
              Тренировки за{" "}
              {format(
                selectedDate,
                "d MMMM yyyy",
                {
                  locale: ru,
                }
              )}
            </Typography>

            <Divider
              sx={{
                borderColor:
                  "rgba(255,255,255,0.06)",

                mb: 3,
              }}
            />

            {loading ? (
              <Stack spacing={2}>
                <Skeleton
                  variant="rounded"
                  height={80}
                />

                <Skeleton
                  variant="rounded"
                  height={80}
                />
              </Stack>
            ) : dayActivities.length >
              0 ? (
              <Stack spacing={2}>
                {dayActivities.map((act) => (
                  <Paper
                    elevation={0}
                    key={act.id}
                    onClick={() =>
                      navigate(
                        `/activity/${act.id}`
                      )
                    }
                    sx={{
                      p: 2.2,

                      borderRadius: 4,

                      cursor:
                        "pointer",

                      background:
                        "rgba(255,255,255,0.03)",

                      border:
                        "1px solid rgba(255,255,255,0.05)",

                      transition:
                        "all .22s ease",

                      "&:hover": {
                        transform:
                          "translateY(-2px)",

                        background:
                          "rgba(255,255,255,0.06)",

                        boxShadow:
                          "0 10px 24px rgba(0,0,0,0.24)",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack spacing={0.7}>
                        <Typography
                          sx={{
                            color:
                              "#f8fafc",

                            fontWeight: 700,

                            fontSize:
                              "1rem",
                          }}
                        >
                          {getActivityLabel(
                            act.type
                          )}
                        </Typography>

                        <Typography
                          sx={{
                            color:
                              "rgba(148,163,184,0.85)",

                            fontSize: 14,
                          }}
                        >
                          {format(
                            parseISO(
                              act.startTime
                            ),
                            "HH:mm"
                          )}{" "}
                          •{" "}
                          {act.duration}{" "}
                          мин
                        </Typography>
                      </Stack>

                      <Chip
                        label={`${act.caloriesBurned} ккал`}
                        sx={{
                          fontWeight: 700,

                          background:
                            "rgba(59,130,246,0.15)",

                          color:
                            "#93c5fd",

                          border:
                            "1px solid rgba(96,165,250,0.25)",
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                }}
              >
                Нет тренировок в этот день
              </Alert>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

const StatCard = ({
  icon,
  title,
  value,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,

        p: 2.5,

        borderRadius: 5,

        background:
          "rgba(255,255,255,0.03)",

        border:
          "1px solid rgba(255,255,255,0.04)",

        backdropFilter: "blur(18px)",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
      >
        <Box
          sx={{
            width: 48,
            height: 48,

            borderRadius: 3,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            background:
              "linear-gradient(135deg,#38bdf8,#8b5cf6)",

            color: "#fff",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              color:
                "rgba(148,163,184,0.8)",

              fontSize: 13,

              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "#f8fafc",

              fontWeight: 800,

              fontSize: "1.4rem",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const navButtonStyles = {
  width: 48,

  height: 48,

  color: "#e2e8f0",

  background:
    "rgba(255,255,255,0.04)",

  border:
    "1px solid rgba(255,255,255,0.06)",

  backdropFilter: "blur(10px)",

  transition: "all .2s ease",

  "&:hover": {
    transform: "scale(1.06)",

    background:
      "rgba(255,255,255,0.08)",
  },
};

const getActivityLabel = (type) => {
  const labels = {
    RUNNING: "Бег",
    WALKING: "Ходьба",
    CYCLING: "Велосипед",
    SWIMMING: "Плавание",
  };

  return (
    labels[type?.toUpperCase()] ||
    type ||
    "Тренировка"
  );
};

export default SchedulePage;