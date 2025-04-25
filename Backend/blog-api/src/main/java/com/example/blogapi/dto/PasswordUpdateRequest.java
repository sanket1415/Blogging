// src/main/java/com/example/blogapi/dto/PasswordUpdateRequest.java
package com.example.blogapi.dto;

import lombok.Data;

@Data
public class PasswordUpdateRequest {
    private String currentPassword;
    private String newPassword;
}