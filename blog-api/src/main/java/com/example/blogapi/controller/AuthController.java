package com.example.blogapi.controller;

import com.example.blogapi.dto.AuthRequest;
import com.example.blogapi.dto.AuthResponse;
import com.example.blogapi.dto.SignupRequest;
import com.example.blogapi.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
        boolean success = authService.registerUser(
                signupRequest.getName(),
                signupRequest.getEmail(),
                signupRequest.getPassword()
        );

        if (!success) {
            return new ResponseEntity<>("Email is already taken!", HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }
}