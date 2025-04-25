// src/main/java/com/example/blogapi/dto/SignupRequest.java
package com.example.blogapi.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
}