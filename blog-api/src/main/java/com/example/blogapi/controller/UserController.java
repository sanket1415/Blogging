package com.example.blogapi.controller;

import com.example.blogapi.dto.PasswordUpdateRequest;
import com.example.blogapi.dto.UserDto;
import com.example.blogapi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getUserProfile() {
        UserDto userDto = userService.getUserProfile();
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateUserProfile(@RequestBody UserDto userDto) {
        UserDto updatedUserDto = userService.updateUserProfile(userDto);
        return ResponseEntity.ok(updatedUserDto);
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody PasswordUpdateRequest passwordRequest) {
        boolean success = userService.updatePassword(
                passwordRequest.getCurrentPassword(),
                passwordRequest.getNewPassword()
        );

        if (!success) {
            return ResponseEntity.badRequest().body("Current password is incorrect");
        }

        return ResponseEntity.ok().build();
    }
}