package com._x.TestRegister1.fitness.repository;

import com._x.TestRegister1.fitness.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, String> {


    List<Activity> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Activity> findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(String userId,LocalDateTime start, LocalDateTime end);
}
