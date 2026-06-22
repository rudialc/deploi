package com._x.TestRegister1.fitness.dto;

public class CoachStudentFullResponse {
    private Long studentId;
    private String username;
    private String firstName;
    private String lastName;
    private String avatarUrl;

    // конструкторы, геттеры, сеттеры
    public CoachStudentFullResponse() {}

    public CoachStudentFullResponse(Long studentId, String username, String firstName, String lastName, String avatarUrl) {
        this.studentId = studentId;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatarUrl = avatarUrl;
    }

   public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}