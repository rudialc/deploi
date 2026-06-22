package com._x.TestRegister1.fitness.web;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.fitness.dto.UserProfileRequest;
import com._x.TestRegister1.fitness.dto.UserProfileResponse;
import com._x.TestRegister1.fitness.service.FitnessActivityService;
import com._x.TestRegister1.fitness.service.UserProfileService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserProfileService profileService;
    private final FitnessActivityService fitnessActivityService; // для requireUser

    public ProfileController(UserProfileService profileService,
                             FitnessActivityService fitnessActivityService) {
        this.profileService = profileService;
        this.fitnessActivityService = fitnessActivityService;
    }

    @GetMapping
    public UserProfileResponse getProfile(Authentication authentication) {
        var user = fitnessActivityService.requireUser(authentication);
        return profileService.getProfile(user);
    }

    @PutMapping
    public UserProfileResponse updateProfile(@RequestBody UserProfileRequest request,
                                             Authentication authentication) {
        var user = fitnessActivityService.requireUser(authentication);
        return profileService.updateProfile(user, request);
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file,
                                      Authentication authentication) {
    User user = fitnessActivityService.requireUser(authentication);
    if (file.isEmpty()) {
        return ResponseEntity.badRequest().body("Файл не выбран");
    }

    // Создаём папку для пользователя, если её нет
    Path userDir = Paths.get("uploads", "avatars", String.valueOf(user.getId())).toAbsolutePath().normalize();
    try {
        Files.createDirectories(userDir);
    } catch (IOException e) {
        return ResponseEntity.internalServerError().body("Ошибка создания папки");
    }

    // Сохраняем файл под уникальным именем
    String originalFilename = file.getOriginalFilename();
    String extension = "";
    if (originalFilename != null && originalFilename.contains(".")) {
        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
    }
    String fileName = UUID.randomUUID() + extension;
    Path filePath = userDir.resolve(fileName);

    try {
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException e) {
        return ResponseEntity.internalServerError().body("Ошибка сохранения файла");
    }

    // Формируем URL для доступа к файлу
    String avatarUrl = "/uploads/avatars/" + user.getId() + "/" + fileName;

    // Сохраняем URL в профиле
    profileService.updateAvatar(user, avatarUrl);

    return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
}
}