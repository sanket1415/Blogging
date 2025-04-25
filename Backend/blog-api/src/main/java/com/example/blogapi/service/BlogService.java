package com.example.blogapi.service;

import com.example.blogapi.dto.BlogDto;
import com.example.blogapi.dto.UserDto;
import com.example.blogapi.model.Blog;
import com.example.blogapi.model.User;
import com.example.blogapi.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserService userService;

    public BlogDto convertToDto(Blog blog) {
        BlogDto blogDto = new BlogDto();
        blogDto.setId(blog.getId());
        blogDto.setTitle(blog.getTitle());
        blogDto.setContent(blog.getContent());
        blogDto.setPublished(blog.isPublished());
        blogDto.setCreatedAt(blog.getCreatedAt());
        blogDto.setUpdatedAt(blog.getUpdatedAt());

        UserDto userDto = userService.convertToDto(blog.getUser());
        blogDto.setUser(userDto);

        return blogDto;
    }

    public Blog convertToEntity(BlogDto blogDto, User user) {
        Blog blog = new Blog();
        blog.setTitle(blogDto.getTitle());
        blog.setContent(blogDto.getContent());
        blog.setPublished(blogDto.isPublished());
        blog.setUser(user);
        blog.setCreatedAt(LocalDateTime.now());
        blog.setUpdatedAt(LocalDateTime.now());
        return blog;
    }

    public List<BlogDto> getAllBlogs(User user) {
        List<Blog> blogs = blogRepository.findByUserOrderByCreatedAtDesc(user);
        return blogs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<BlogDto> getRecentBlogs(User user) {
        List<Blog> blogs = blogRepository.findRecentByUser(user);
        return blogs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public BlogDto getBlogById(Long id, User currentUser) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        if (!blog.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to access this blog");
        }

        return convertToDto(blog);
    }

    public BlogDto createBlog(String title, String content, boolean published, User user) {
        Blog blog = new Blog();
        blog.setTitle(title);
        blog.setContent(content);
        blog.setPublished(published);
        blog.setUser(user);
        blog.setCreatedAt(LocalDateTime.now());
        blog.setUpdatedAt(LocalDateTime.now());

        Blog savedBlog = blogRepository.save(blog);
        return convertToDto(savedBlog);
    }

    public BlogDto updateBlog(Long id, String title, String content, boolean published, User currentUser) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        if (!blog.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to update this blog");
        }

        blog.setTitle(title);
        blog.setContent(content);
        blog.setPublished(published);
        blog.setUpdatedAt(LocalDateTime.now());

        Blog updatedBlog = blogRepository.save(blog);
        return convertToDto(updatedBlog);
    }

    public void deleteBlog(Long id, User currentUser) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        if (!blog.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to delete this blog");
        }

        blogRepository.delete(blog);
    }
}