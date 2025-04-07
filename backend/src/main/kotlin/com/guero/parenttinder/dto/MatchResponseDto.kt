// dto/MatchResponseDto.kt
package com.guero.parenttinder.dto

import com.guero.parenttinder.model.MatchStatus
import com.guero.parenttinder.model.ParentProfile
import java.time.LocalDateTime

data class MatchResponseDto(
    val id: String,
    val status: MatchStatus,
    val createdAt: LocalDateTime,
    val parent: ParentProfile
)