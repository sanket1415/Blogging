package com.example.blogapi.repository;

import com.example.blogapi.model.Blog;
import com.example.blogapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT b FROM Blog b WHERE b.user = ?1 ORDER BY b.createdAt DESC")
    List<Blog> findRecentByUser(User user, Pageable pageable);

    default List<Blog> findRecentByUser(User user) {
        return findRecentByUser(user, org.springframework.data.domain.PageRequest.of(0, 5));
    }

    long countByUserAndPublishedTrue(User user);

    long countByUserAndPublishedFalse(User user);
}