// controller/ParentProfileController.kt
package com.guero.parenttinder.controller

import com.guero.parenttinder.dto.ParentProfileDto
import com.guero.parenttinder.model.ParentProfile
import com.guero.parenttinder.service.AuthService
import com.guero.parenttinder.service.ParentProfileService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/profiles")
class ParentProfileController(
    private val parentProfileService: ParentProfileService,
    private val authService: AuthService
) {
    
    @PostMapping
    fun createProfile(@Valid @RequestBody profile: ParentProfileDto): ResponseEntity<ParentProfile> {
        val userId = authService.getCurrentUserId()
        val parentProfile = profile.toEntity(userId)
        return ResponseEntity.ok(parentProfileService.createProfile(parentProfile))
    }
    
    @GetMapping("/{id}")
    fun getProfile(@PathVariable id: String): ResponseEntity<ParentProfile> {
        return ResponseEntity.ok(parentProfileService.getProfile(id))
    }
    
    @GetMapping("/me")
    fun getMyProfile(): ResponseEntity<ParentProfile?> {
        val userId = authService.getCurrentUserId()
        val profile = parentProfileService.getProfileByUserId(userId)
        return if (profile != null) {
            ResponseEntity.ok(profile)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @PutMapping("/{id}")
    fun updateProfile(
        @PathVariable id: String,
        @Valid @RequestBody profile: ParentProfileDto
    ): ResponseEntity<ParentProfile> {
        val userId = authService.getCurrentUserId()
        val existingProfile = parentProfileService.getProfile(id)
        
        if (existingProfile.userId != userId) {
            return ResponseEntity.status(403).build()
        }
        
        return ResponseEntity.ok(
            parentProfileService.updateProfile(id, profile.toEntity(userId, id))
        )
    }
    
    @GetMapping("/nearby")
    fun findNearbyParents(
        @RequestParam maxDistance: Int = 10000 // Default 10km
    ): ResponseEntity<List<ParentProfile>> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(
            parentProfileService.findNearbyParents(parentProfile.id!!, maxDistance)
        )
    }
}