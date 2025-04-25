// src/main/java/com/example/blogapi/dto/UserDto.java
package com.example.blogapi.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String bio;
}