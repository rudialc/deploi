package com._x.TestRegister1.Controller;

import com._x.TestRegister1.DTO.LoginRequest;
import com._x.TestRegister1.DTO.RegisterRequest;
import com._x.TestRegister1.DTO.ResponseDto;
import com._x.TestRegister1.Jwt.JwtService;
import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.Repository.UserRepository;
import com._x.TestRegister1.Service.AuthService;
import com._x.TestRegister1.Service.CustomUserDetailsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, JwtService jwtService, AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService, UserRepository userRepository) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {
        try {
            ResponseDto response = authService.registerUser(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new ResponseDto("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new IllegalStateException("Пользователь не найден"));
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("userId", String.valueOf(user.getId()));
            extraClaims.put("role", user.getRole().name());
            String token = jwtService.generateToken(extraClaims, userDetails);

            Map<String, Object> loginResponse = new HashMap<>();
            loginResponse.put("message", "Вход выполнен успешно");
            loginResponse.put("token", token);
            loginResponse.put("username", userDetails.getUsername());
            loginResponse.put("userId", String.valueOf(user.getId()));
            loginResponse.put("role", user.getRole().name());

            return ResponseEntity.ok(loginResponse);

        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Неверное имя пользователя или пароль"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Произошла ошибка при входе: " + e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDto("error", "Не авторизован"));
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);

        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("status", "success");
        userResponse.put("message", "Данные пользователя получены");
        userResponse.put("username", userDetails.getUsername());
        userResponse.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        if (user != null) {
            userResponse.put("userId", user.getId());
            userResponse.put("role", user.getRole().name());
            userResponse.put("firstName", user.getFirstName());
            userResponse.put("lastName", user.getLastName());
        }
        userResponse.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(userResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new ResponseDto(
                "success",
                "Выход выполнен успешно"
        ));
    }
}