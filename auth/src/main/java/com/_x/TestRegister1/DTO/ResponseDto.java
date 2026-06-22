package com._x.TestRegister1.DTO;


public class ResponseDto {
    private String message;
    private String username;
    private String token;

    public ResponseDto(String message, String username) {
        this.message = message;
        this.username = username;
    }

    public ResponseDto(String message, String username, String token) {
        this.message = message;
        this.username = username;
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public String getUsername() {
        return username;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
