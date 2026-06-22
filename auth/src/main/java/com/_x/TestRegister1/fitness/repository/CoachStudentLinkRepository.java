package com._x.TestRegister1.fitness.repository;

import com._x.TestRegister1.fitness.entity.CoachStudentLink;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CoachStudentLinkRepository extends JpaRepository<CoachStudentLink, Long> {
    List<CoachStudentLink> findByTrainerIdOrderByCreatedAtDesc(Long trainerId);
    boolean existsByTrainerIdAndStudentId(Long trainerId, Long studentId);
    Optional<CoachStudentLink> findByTrainerIdAndStudentId(Long trainerId, Long studentId);
    void deleteByTrainerIdAndStudentId(Long trainerId, Long studentId);

    List<CoachStudentLink> findByTrainerId(Long trainerId);
    Optional<CoachStudentLink> findByStudentId(Long studentId);
}