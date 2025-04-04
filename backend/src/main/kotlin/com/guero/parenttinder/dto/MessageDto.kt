// dto/MessageDto.kt
package com.example.parenttinder.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class MessageDto(
    @field:NotNull(message = "Receiver ID is required")
    val receiverId: String,
    
    @field:NotBlank(message = "Content is required")
    val content: String
)