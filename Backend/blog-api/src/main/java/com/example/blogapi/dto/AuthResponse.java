// src/main/java/com/example/blogapi/dto/AuthResponse.java
package com.example.blogapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDto user;
}