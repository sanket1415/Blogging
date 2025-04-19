package com.example.blogapi.controller;

import com.example.blogapi.dto.BlogDto;
import com.example.blogapi.dto.BlogRequest;
import com.example.blogapi.dto.BlogStatsDto;
import com.example.blogapi.model.Blog;
import com.example.blogapi.model.User;
import com.example.blogapi.repository.BlogRepository;
import com.example.blogapi.service.BlogService;
import com.example.blogapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private BlogService blogService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<BlogDto>> getAllBlogs() {
        User currentUser = userService.getCurrentUser();
        List<BlogDto> blogDtos = blogService.getAllBlogs(currentUser);
        return ResponseEntity.ok(blogDtos);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<BlogDto>> getRecentBlogs() {
        User currentUser = userService.getCurrentUser();
        List<BlogDto> blogDtos = blogService.getRecentBlogs(currentUser);
        return ResponseEntity.ok(blogDtos);
    }

    @GetMapping("/stats")
    public ResponseEntity<BlogStatsDto> getBlogStats() {
        User currentUser = userService.getCurrentUser();
        long totalBlogs = blogRepository.countByUserAndPublishedTrue(currentUser) +
                blogRepository.countByUserAndPublishedFalse(currentUser);
        long publishedBlogs = blogRepository.countByUserAndPublishedTrue(currentUser);
        long draftBlogs = blogRepository.countByUserAndPublishedFalse(currentUser);

        return ResponseEntity.ok(new BlogStatsDto(totalBlogs, publishedBlogs, draftBlogs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogDto> getBlogById(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        // Check if the blog belongs to the current user
        if (!blog.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(blogService.convertToDto(blog));
    }

    @PostMapping
    public ResponseEntity<BlogDto> createBlog(@RequestBody BlogRequest blogRequest) {
        User currentUser = userService.getCurrentUser();

        Blog blog = new Blog();
        blog.setTitle(blogRequest.getTitle());
        blog.setContent(blogRequest.getContent());
        blog.setPublished(blogRequest.isPublished());
        blog.setUser(currentUser);
        blog.setCreatedAt(LocalDateTime.now());
        blog.setUpdatedAt(LocalDateTime.now());

        Blog savedBlog = blogRepository.save(blog);

        return ResponseEntity.status(HttpStatus.CREATED).body(blogService.convertToDto(savedBlog));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogDto> updateBlog(@PathVariable Long id, @RequestBody BlogRequest blogRequest) {
        User currentUser = userService.getCurrentUser();
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        // Check if the blog belongs to the current user
        if (!blog.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        blog.setTitle(blogRequest.getTitle());
        blog.setContent(blogRequest.getContent());
        blog.setPublished(blogRequest.isPublished());
        blog.setUpdatedAt(LocalDateTime.now());

        Blog updatedBlog = blogRepository.save(blog);

        return ResponseEntity.ok(blogService.convertToDto(updatedBlog));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        // Check if the blog belongs to the current user
        if (!blog.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        blogRepository.delete(blog);

        return ResponseEntity.ok().build();
    }
}