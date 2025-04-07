// service/ParentProfileService.kt
package com.guero.parenttinder.service

import com.guero.parenttinder.exception.ResourceNotFoundException
import com.guero.parenttinder.model.ParentProfile
import com.guero.parenttinder.repository.ParentProfileRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class ParentProfileService(private val parentProfileRepository: ParentProfileRepository) {
    
    fun createProfile(profile: ParentProfile): ParentProfile {
        return parentProfileRepository.save(profile)
    }
    
    fun getProfile(id: String): ParentProfile {
        return parentProfileRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Profile not found with id: $id") }
    }
    
    fun getProfileByUserId(userId: String): ParentProfile? {
        return parentProfileRepository.findByUserId(userId)
    }
    
    fun updateProfile(id: String, profile: ParentProfile): ParentProfile {
        val existingProfile = getProfile(id)
        val updatedProfile = profile.copy(
            id = id,
            createdAt = existingProfile.createdAt,
            updatedAt = LocalDateTime.now()
        )
        return parentProfileRepository.save(updatedProfile)
    }
    
    fun findNearbyParents(parentId: String, maxDistance: Int): List<ParentProfile> {
        val currentParent = getProfile(parentId)
        currentParent.location ?: throw IllegalStateException("Current parent location is not set")
        
        return parentProfileRepository.findNearbyParents(
            currentParent.location.longitude,
            currentParent.location.latitude,
            maxDistance
        ).filter { it.id != parentId }
    }
}