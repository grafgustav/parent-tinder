// repository/MessageRepository.kt
package com.guero.parenttinder.repository

import com.guero.parenttinder.model.Message
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface MessageRepository : MongoRepository<Message, String> {
    @Query("{ \$or: [ { 'senderId': ?0, 'receiverId': ?1 }, { 'senderId': ?1, 'receiverId': ?0 } ] }")
    fun findConversation(userId1: String, userId2: String, sort: Sort): List<Message>
    
    fun countByReceiverIdAndReadFalse(receiverId: String): Long
    
    @Query("{ \$or: [ { 'senderId': ?0 }, { 'receiverId': ?0 } ] }")
    fun findByUserId(userId: String): List<Message>
}