// dto/EventDto.kt
package com.guero.parenttinder.dto

import com.guero.parenttinder.model.Event
import com.guero.parenttinder.model.GeoLocation
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

data class EventDto(
    @field:NotBlank(message = "Title is required")
    val title: String,
    
    @field:NotBlank(message = "Description is required")
    val description: String,
    
    @field:NotNull(message = "Location is required")
    val location: GeoLocationDto,
    
    @field:NotNull(message = "Date and time are required")
    @field:Future(message = "Date and time must be in the future")
    val dateTime: LocalDateTime,
    
    val maxParticipants: Int? = null
) {
    fun toEntity(organizerId: String, id: String? = null): Event {
        return Event(
            id = id,
            title = title,
            description = description,
            location = GeoLocation(location.latitude, location.longitude, location.address),
            dateTime = dateTime,
            organizerId = organizerId,
            maxParticipants = maxParticipants
        )
    }
}