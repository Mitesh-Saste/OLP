package com.olp.controller;

import com.olp.dto.ProfileRequest;
import com.olp.dto.ProfileResponse;
import com.olp.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(profileService.getProfile(username));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody ProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(profileService.updateProfile(username, request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@RequestBody java.util.Map<String, String> request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        profileService.changePassword(username, request.get("currentPassword"), request.get("newPassword"));
        return ResponseEntity.ok().build();
    }
}
