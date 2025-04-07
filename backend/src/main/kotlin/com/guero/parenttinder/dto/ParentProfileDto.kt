// dto/ParentProfileDto.kt
package com.guero.parenttinder.dto

import com.guero.parenttinder.model.Child
import com.guero.parenttinder.model.GeoLocation
import com.guero.parenttinder.model.ParentProfile
import jakarta.validation.constraints.NotBlank

data class ParentProfileDto(
    @field:NotBlank(message = "First name is required")
    val firstName: String,
    
    @field:NotBlank(message = "Last name is required")
    val lastName: String,
    
    val bio: String? = null,
    val interests: List<String> = emptyList(),
    val children: List<Child> = emptyList(),
    val location: GeoLocationDto? = null,
    val profilePicture: String? = null
) {
    fun toEntity(userId: String, id: String? = null): ParentProfile {
        return ParentProfile(
            id = id,
            firstName = firstName,
            lastName = lastName,
            email = "", // Will be filled from user service
            bio = bio,
            interests = interests,
            children = children,
            location = location?.let { GeoLocation(it.latitude, it.longitude, it.address) },
            profilePicture = profilePicture,
            userId = userId
        )
    }
}