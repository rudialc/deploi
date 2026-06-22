package com._x.TestRegister1.fitness.web;

import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.fitness.dto.ActivityResponse;
import com._x.TestRegister1.fitness.dto.AddStudentRequest;
import com._x.TestRegister1.fitness.dto.CoachStudentFullResponse;
import com._x.TestRegister1.fitness.entity.Recommendation;
import com._x.TestRegister1.fitness.service.CoachService;
import com._x.TestRegister1.fitness.service.FitnessActivityService;
import com._x.TestRegister1.fitness.service.FitnessRecommendationService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach")
public class CoachController {

    private final CoachService coachService;
    private final FitnessActivityService fitnessActivityService;
    private final FitnessRecommendationService fitnessRecommendationService;

    public CoachController(CoachService coachService,
                           FitnessActivityService fitnessActivityService,
                           FitnessRecommendationService fitnessRecommendationService) {
        this.coachService = coachService;
        this.fitnessActivityService = fitnessActivityService;
        this.fitnessRecommendationService = fitnessRecommendationService;
    }

    @GetMapping("/students")
    public List<CoachStudentFullResponse> getMyStudents(Authentication authentication) {
        User coach = fitnessActivityService.requireUser(authentication);
        return coachService.getMyStudents(coach);
    }

    @PostMapping("/students")
    public CoachStudentFullResponse addStudent(@Valid @RequestBody AddStudentRequest request,
                                               Authentication authentication) {
        User trainer = fitnessActivityService.requireUser(authentication);
        return coachService.addStudent(trainer, request);
    }

    @DeleteMapping("/students/{studentId}")
    public void removeStudent(@PathVariable Long studentId, Authentication authentication) {
        User trainer = fitnessActivityService.requireUser(authentication);
        coachService.removeStudent(trainer, studentId);
    }

    @GetMapping("/search-students")
    public List<CoachStudentFullResponse> searchStudents(@RequestParam String query) {
        return coachService.searchStudents(query);
    }

    @GetMapping("/students/{studentId}/activities")
    public List<ActivityResponse> studentActivities(@PathVariable Long studentId, Authentication authentication) {
        return fitnessActivityService.listForAthlete(authentication, String.valueOf(studentId));
    }

    @GetMapping("/students/{studentId}/recommendations")
    public List<Recommendation> studentRecommendations(@PathVariable Long studentId, Authentication authentication) {
        return fitnessRecommendationService.listForAthlete(authentication, String.valueOf(studentId));
    }
}