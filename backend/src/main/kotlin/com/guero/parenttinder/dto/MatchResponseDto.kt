// dto/MatchResponseDto.kt
package com.example.parenttinder.dto

import com.example.parenttinder.model.MatchStatus
import com.example.parenttinder.model.ParentProfile
import java.time.LocalDateTime

data class MatchResponseDto(
    val id: String,
    val status: MatchStatus,
    val createdAt: LocalDateTime,
    val parent: ParentProfile
)