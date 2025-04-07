// model/Event.kt
package com.guero.parenttinder.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.IndexDirection
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "events")
data class Event(
    @Id val id: String? = null,
    val title: String,
    val description: String,
    val location: GeoLocation,
    @Indexed(direction = IndexDirection.ASCENDING)
    val dateTime: LocalDateTime,
    val organizerId: String,
    val participantIds: MutableList<String> = mutableListOf(),
    val maxParticipants: Int? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)