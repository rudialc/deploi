package com._x.TestRegister1.fitness.service;

import com._x.TestRegister1.Models.Role;
import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.Repository.UserRepository;
import com._x.TestRegister1.fitness.ai.ActivityAiService;
import com._x.TestRegister1.fitness.dto.ActivityRequest;
import com._x.TestRegister1.fitness.dto.ActivityResponse;
import com._x.TestRegister1.fitness.entity.Activity;
import com._x.TestRegister1.fitness.repository.ActivityRepository;
import com._x.TestRegister1.fitness.repository.CoachStudentLinkRepository;

import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FitnessActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final CoachStudentLinkRepository coachStudentLinkRepository;
    private final ActivityAiService activityAiService;
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(FitnessActivityService.class);

    public FitnessActivityService(ActivityRepository activityRepository,
                                  UserRepository userRepository,
                                  CoachStudentLinkRepository coachStudentLinkRepository,
                                  ActivityAiService activityAiService) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.coachStudentLinkRepository = coachStudentLinkRepository;
        this.activityAiService = activityAiService;
    }

    public User requireUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    public void assertCanAccessAthlete(User accessor, String athleteUserIdStr) {
       
        if (athleteUserIdStr == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        
        log.debug("Проверка доступа: accessor.id={}, athleteUserIdStr='{}'",
              accessor.getId(), athleteUserIdStr);
              String cleanedUserId = athleteUserIdStr.trim();
       
        if (accessor.getId().toString().equals(cleanedUserId)) {
            return;
        }
        if (accessor.getRole() == Role.ADMIN) {
            return;
        }
        if (accessor.getRole() == Role.TRAINER) {
            long sid = parseUserId(athleteUserIdStr);
            if (coachStudentLinkRepository.existsByTrainerIdAndStudentId(accessor.getId(), sid)) {
                return;
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Нет доступа к данным этого пользователя");
    }

    private long parseUserId(String id) {
        try {
            return Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Некорректный id пользователя");
        }
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> listForAthlete(Authentication authentication, String athleteUserId) {
        User me = requireUser(authentication);
        assertCanAccessAthlete(me, athleteUserId);
        return activityRepository.findByUserIdOrderByCreatedAtDesc(athleteUserId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ActivityResponse trackForCurrentUser(Authentication authentication, ActivityRequest request) {
       
        
        try {

        log.info(">>> CONTROLLER START");

        User me = requireUser(authentication);

        log.info(">>> USER OK: {}", me.getUsername());

        String uid = String.valueOf(me.getId());

        Activity activity = new Activity();
        activity.setUserId(uid);
        activity.setType(request.getType());
        activity.setDuration(request.getDuration());
        activity.setCaloriesBurned(request.getCaloriesBurned());

        if (request.getStartTime() == null) {
        activity.setStartTime(LocalDateTime.now());
            } else {
        activity.setStartTime(request.getStartTime());
        }
        log.info(">>> BEFORE SAVE");

        Activity saved = activityRepository.save(activity);

        log.info(">>> SAVED: {}", saved.getId());

        log.info(">>> BEFORE AI");

        activityAiService.generateAndSave(saved);

        log.info(">>> AFTER AI");

        return toResponse(saved);


    } catch (Exception e) {

        log.error(">>> FATAL ERROR IN TRACK", e);
        throw e;
    }

    
}
    

    @Transactional(readOnly = true)
    public ActivityResponse getById(Authentication authentication, String activityId) {
        User me = requireUser(authentication);
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Активность не найдена"));
        assertCanAccessAthlete(me, activity.getUserId());
        return toResponse(activity);
    }

    public ActivityResponse toResponse(Activity a) {
        ActivityResponse r = new ActivityResponse();
        r.setId(a.getId());
        r.setUserId(a.getUserId());
        r.setType(a.getType());
        r.setDuration(a.getDuration());
        r.setCaloriesBurned(a.getCaloriesBurned());
        r.setStartTime(a.getStartTime());
        r.setAdditionalMetrics(a.getAdditionalMetrics());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }
}
