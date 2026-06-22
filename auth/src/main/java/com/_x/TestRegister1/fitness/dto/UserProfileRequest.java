package com._x.TestRegister1.fitness.dto;

import java.time.LocalDate;

public class UserProfileRequest {
    private Double weightKg;
    private Double heightCm;
    private String gender;
    private String phone;
    private LocalDate birthDate;
    private String fitnessGoal;
    private String wearableDevice;

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Double getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Double heightCm) {
        this.heightCm = heightCm;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getFitnessGoal() {
        return fitnessGoal;
    }

    public void setFitnessGoal(String fitnessGoal) {
        this.fitnessGoal = fitnessGoal;
    }

    public String getWearableDevice() {
        return wearableDevice;
    }

    public void setWearableDevice(String wearableDevice) {
        this.wearableDevice = wearableDevice;
    }
}