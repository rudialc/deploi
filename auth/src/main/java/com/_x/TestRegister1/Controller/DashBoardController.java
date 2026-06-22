package com._x.TestRegister1.Controller;

import com._x.TestRegister1.DTO.ResponseDto;
import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.Repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
public class DashBoardController {
    private final UserRepository repository;

    public DashBoardController(UserRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = repository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // Создаем ResponseDto с данными пользователя
            Map<String, Object> data = new HashMap<>();
            data.put("user", user);

            return ResponseEntity.ok(new ResponseDto(
                    "success",
                    "Данные пользователя получены"
            ));

        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDto("error", "Ошибка при получении данных"));
        }
    }
}