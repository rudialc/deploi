package com._x.TestRegister1.fitness.repository;

import com._x.TestRegister1.fitness.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository extends JpaRepository<Recommendation, String> {

    List<Recommendation> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Recommendation> findByActivityId(String activityId);
}
