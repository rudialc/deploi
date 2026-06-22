package com._x.TestRegister1.fitness.dto;

public class CoachStudentResponse {

    private Long studentId;
    private String username;
    private String firstName;
    private String lastName;

    public CoachStudentResponse() {
    }

    public CoachStudentResponse(Long studentId, String username, String firstName, String lastName) {
        this.studentId = studentId;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
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
}
