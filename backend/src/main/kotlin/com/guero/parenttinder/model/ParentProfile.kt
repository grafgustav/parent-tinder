// model/ParentProfile.kt
package com.example.parenttinder.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "parent_profiles")
data class ParentProfile(
    @Id val id: String? = null,
    val firstName: String,
    val lastName: String,
    @Indexed(unique = true) val email: String,
    val bio: String? = null,
    val interests: List<String> = emptyList(),
    val children: List<Child> = emptyList(),
    val location: GeoLocation? = null,
    val profilePicture: String? = null,
    @Indexed val userId: String,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)