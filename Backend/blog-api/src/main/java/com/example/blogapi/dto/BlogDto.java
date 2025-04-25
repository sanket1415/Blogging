// src/main/java/com/example/blogapi/dto/BlogDto.java
package com.example.blogapi.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogDto {
    private Long id;
    private String title;
    private String content;
    private boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDto user;
}