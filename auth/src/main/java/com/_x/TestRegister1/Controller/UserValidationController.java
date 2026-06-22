package com._x.TestRegister1.Controller;

import com._x.TestRegister1.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserValidationController {

    private final UserRepository userRepository;

    public UserValidationController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}/validate")
    public ResponseEntity<Boolean> validateUser(@PathVariable String userId) {
        try {
            long id = Long.parseLong(userId);
            return ResponseEntity.ok(userRepository.existsById(id));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(false);
        }
    }
}
