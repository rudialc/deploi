package com._x.TestRegister1.fitness.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
    
import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.fitness.entity.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUser(User user);
}