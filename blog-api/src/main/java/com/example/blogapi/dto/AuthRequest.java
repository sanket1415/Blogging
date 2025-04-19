// src/main/java/com/example/blogapi/dto/AuthRequest.java
package com.example.blogapi.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}