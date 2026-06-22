package com._x.TestRegister1.fitness.service;

import com._x.TestRegister1.Models.User;
import com._x.TestRegister1.fitness.dto.UserProfileRequest;
import com._x.TestRegister1.fitness.dto.UserProfileResponse;
import com._x.TestRegister1.fitness.entity.UserProfile;
import com._x.TestRegister1.fitness.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class UserProfileService {

    private final UserProfileRepository profileRepo;

    public UserProfileService(UserProfileRepository profileRepo) {
        this.profileRepo = profileRepo;
    }

    public UserProfileResponse getProfile(User user) {
        UserProfile profile = profileRepo.findByUser(user)
                .orElse(createEmptyProfile(user));
        return mapToResponse(profile);
    }

    @Transactional
    public UserProfileResponse updateProfile(User user, UserProfileRequest request) {
        UserProfile profile = profileRepo.findByUser(user)
                .orElse(createEmptyProfile(user));

        profile.setWeightKg(request.getWeightKg());
        profile.setHeightCm(request.getHeightCm());
        profile.setGender(request.getGender());
        profile.setPhone(request.getPhone());
        profile.setBirthDate(request.getBirthDate());
        profile.setFitnessGoal(request.getFitnessGoal());
        profile.setWearableDevice(request.getWearableDevice());
        profile.setUpdatedAt(LocalDate.now());

        profile = profileRepo.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public void updateAvatar(User user, String avatarUrl) {
        UserProfile profile = profileRepo.findByUser(user)
            .orElse(createEmptyProfile(user));
        profile.setAvatarUrl(avatarUrl);
        profile.setUpdatedAt(LocalDate.now());
        profileRepo.save(profile);
}

    private UserProfile createEmptyProfile(User user) {
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setCreatedAt(LocalDate.now());
        return profile;
    }

    private UserProfileResponse mapToResponse(UserProfile profile) {
        User user = profile.getUser();

        UserProfileResponse response = new UserProfileResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setAvatarUrl(profile.getAvatarUrl());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setWeightKg(profile.getWeightKg());
        response.setHeightCm(profile.getHeightCm());
        response.setGender(profile.getGender());
        response.setPhone(profile.getPhone());
        response.setBirthDate(profile.getBirthDate());
        response.setFitnessGoal(profile.getFitnessGoal());
        response.setWearableDevice(profile.getWearableDevice());

        return response;
    }
}