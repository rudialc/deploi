package com._x.TestRegister1.Service;

import com._x.TestRegister1.DTO.LoginRequest;
import com._x.TestRegister1.DTO.RegisterRequest;
import com._x.TestRegister1.DTO.ResponseDto;
import com._x.TestRegister1.Jwt.JwtService;
import com._x.TestRegister1.Models.Role;
import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }


    public ResponseDto registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCreatedAt(LocalDateTime.now());
        user.setActive(true);
        user.setRole(resolveRegistrationRole(request.getRole()));

        userRepository.save(user);


        return new ResponseDto(
                "Регистрация прошла успешно! Теперь вы можете войти в систему.",
                user.getUsername()
        );
    }


    public ResponseDto loginUser(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Неверный пароль");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Пользователь в оффлайне");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", String.valueOf(user.getId()));
        extraClaims.put("role", user.getRole().name());
        String token = jwtService.generateToken(extraClaims, userDetails);

        return new ResponseDto(
                "Вход выполнен успешно",
                user.getUsername(),
                token
        );
    }

    private Role resolveRegistrationRole(String roleRaw) {
        if (roleRaw == null || roleRaw.isBlank()) {
            return Role.USER;
        }
        String r = roleRaw.trim().toUpperCase();
        if ("TRAINER".equals(r)) {
            return Role.TRAINER;
        }
        if ("USER".equals(r)) {
            return Role.USER;
        }
        throw new RuntimeException("Роль должна быть USER или TRAINER");
    }
}

