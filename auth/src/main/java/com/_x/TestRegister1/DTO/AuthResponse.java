package com._x.TestRegister1.DTO;

public record AuthResponse(
        String token,
        String username,
        String message
) {
}
