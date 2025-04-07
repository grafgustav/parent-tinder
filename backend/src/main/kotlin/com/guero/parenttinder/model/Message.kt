// model/Message.kt
package com.guero.parenttinder.model

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "messages")
@CompoundIndex(def = "{'senderId': 1, 'receiverId': 1}")
data class Message(
    @Id val id: String? = null,
    val senderId: String,
    val receiverId: String,
    val content: String,
    val sentAt: LocalDateTime = LocalDateTime.now(),
    val read: Boolean = false
)