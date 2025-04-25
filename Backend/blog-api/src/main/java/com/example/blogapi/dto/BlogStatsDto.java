// src/main/java/com/example/blogapi/dto/BlogStatsDto.java
package com.example.blogapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BlogStatsDto {
    private long totalBlogs;
    private long publishedBlogs;
    private long draftBlogs;
}