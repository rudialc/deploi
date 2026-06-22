package com._x.TestRegister1.Repository;

import com._x.TestRegister1.Models.Role;
import com._x.TestRegister1.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByUsername(String username);

    List<User> findByRoleAndUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        Role role, String usernameQuery, String emailQuery);

    boolean existsById(Long id);
}