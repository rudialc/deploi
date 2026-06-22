package com._x.TestRegister1.fitness.dto;

import com._x.TestRegister1.fitness.entity.ActivityType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.Map;

public class ActivityRequest {

    private String userId;

    @NotNull
    private ActivityType type;

    @NotNull
    @Positive
    private Integer duration;

    @NotNull
    @Positive
    private Integer caloriesBurned;

    private LocalDateTime startTime;
    private Map<String, Object> additionalMetrics;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public ActivityType getType() {
        return type;
    }

    public void setType(ActivityType type) {
        this.type = type;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getCaloriesBurned() {
        return caloriesBurned;
    }

    public void setCaloriesBurned(Integer caloriesBurned) {
        this.caloriesBurned = caloriesBurned;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public Map<String, Object> getAdditionalMetrics() {
        return additionalMetrics;
    }

    public void setAdditionalMetrics(Map<String, Object> additionalMetrics) {
        this.additionalMetrics = additionalMetrics;
    }
}
