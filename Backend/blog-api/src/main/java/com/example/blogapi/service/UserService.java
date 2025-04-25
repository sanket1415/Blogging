package com.example.blogapi.service;

import com.example.blogapi.dto.UserDto;
import com.example.blogapi.model.User;
import com.example.blogapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDto getUserProfile() {
        User user = getCurrentUser();
        return convertToDto(user);
    }

    public UserDto updateUserProfile(UserDto userDto) {
        User user = getCurrentUser();
        user.setName(userDto.getName());
        if (userDto.getBio() != null) {
            user.setBio(userDto.getBio());
        }
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }

    public boolean updatePassword(String currentPassword, String newPassword) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    public UserDto convertToDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setBio(user.getBio());
        return userDto;
    }
}