// model/Match.kt
package com.example.parenttinder.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "matches")
@CompoundIndex(def = "{'parentOneId': 1, 'parentTwoId': 1}", unique = true)
data class Match(
    @Id val id: String? = null,
    val parentOneId: String,
    val parentTwoId: String,
    val status: MatchStatus = MatchStatus.PENDING,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)