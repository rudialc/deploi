package com._x.TestRegister1.fitness.web;

import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.fitness.dto.ActivityRequest;
import com._x.TestRegister1.fitness.dto.ActivityResponse;
import com._x.TestRegister1.fitness.entity.Activity;
import com._x.TestRegister1.fitness.repository.ActivityRepository;
import com._x.TestRegister1.fitness.service.FitnessActivityService;
import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    private final FitnessActivityService fitnessActivityService;
    private final ActivityRepository activityRepository;

    public ActivityController(FitnessActivityService fitnessActivityService, ActivityRepository activityRepository) {
        this.fitnessActivityService = fitnessActivityService;
        this.activityRepository=activityRepository;
    }

    @GetMapping
    public List<ActivityResponse> list(Authentication authentication) {
        var me = fitnessActivityService.requireUser(authentication);
        return fitnessActivityService.listForAthlete(authentication, String.valueOf(me.getId()));
    }

    @PostMapping
    public ActivityResponse track(@Valid @RequestBody ActivityRequest request, Authentication authentication) {
        return fitnessActivityService.trackForCurrentUser(authentication, request);
    }

    @GetMapping("/{activityId}")
    public ActivityResponse get(@PathVariable String activityId, Authentication authentication) {
        return fitnessActivityService.getById(authentication, activityId);
    }

    @GetMapping("/calendar")
    public List<ActivityResponse> calendar(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate start,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)LocalDate end,
        Authentication authentication
    ){
        User me = fitnessActivityService.requireUser(authentication);
        LocalDateTime staDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.plusDays(1).atStartOfDay();
        return activityRepository
        .findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(
            String.valueOf(me.getId()), staDateTime, endDateTime)
            .stream()
            .map(fitnessActivityService::toResponse)
            .toList();
        }

}
