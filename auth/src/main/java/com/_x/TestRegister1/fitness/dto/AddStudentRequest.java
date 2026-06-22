package com._x.TestRegister1.fitness.dto;

import jakarta.validation.constraints.NotBlank;

public class AddStudentRequest {

    @NotBlank
    private String username;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
