package com._x.TestRegister1.fitness.web;

import com._x.TestRegister1.fitness.entity.Recommendation;
import com._x.TestRegister1.fitness.service.FitnessRecommendationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final FitnessRecommendationService fitnessRecommendationService;

    public RecommendationController(FitnessRecommendationService fitnessRecommendationService) {
        this.fitnessRecommendationService = fitnessRecommendationService;
    }

    @GetMapping("/activity/{activityId}")
    public Recommendation byActivity(@PathVariable String activityId, Authentication authentication) {
        return fitnessRecommendationService.getForActivity(authentication, activityId);
    }
}
