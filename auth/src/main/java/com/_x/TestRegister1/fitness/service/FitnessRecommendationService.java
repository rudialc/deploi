package com._x.TestRegister1.fitness.service;

import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.fitness.entity.Recommendation;
import com._x.TestRegister1.fitness.repository.RecommendationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FitnessRecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final FitnessActivityService fitnessActivityService;

    public FitnessRecommendationService(RecommendationRepository recommendationRepository,
                                        FitnessActivityService fitnessActivityService) {
        this.recommendationRepository = recommendationRepository;
        this.fitnessActivityService = fitnessActivityService;
    }

    @Transactional(readOnly = true)
    public List<Recommendation> listForAthlete(Authentication authentication, String athleteUserId) {
        User me = fitnessActivityService.requireUser(authentication);
        fitnessActivityService.assertCanAccessAthlete(me, athleteUserId);
        return recommendationRepository.findByUserIdOrderByCreatedAtDesc(athleteUserId);
    }

    @Transactional(readOnly = true)
    public Recommendation getForActivity(Authentication authentication, String activityId) {
        User me = fitnessActivityService.requireUser(authentication);
        Recommendation rec = recommendationRepository.findByActivityId(activityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Рекомендация не найдена"));
        fitnessActivityService.assertCanAccessAthlete(me, rec.getUserId());
        return rec;
    }
}
