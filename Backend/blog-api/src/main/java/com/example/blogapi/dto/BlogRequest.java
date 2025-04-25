// src/main/java/com/example/blogapi/dto/BlogRequest.java
package com.example.blogapi.dto;

import lombok.Data;

@Data
public class BlogRequest {
    private String title;
    private String content;
    private boolean published;
}