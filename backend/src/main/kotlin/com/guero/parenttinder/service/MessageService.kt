// service/MessageService.kt
package com.guero.parenttinder.service

import com.guero.parenttinder.exception.ResourceNotFoundException
import com.guero.parenttinder.model.Message
import com.guero.parenttinder.model.MatchStatus
import com.guero.parenttinder.repository.MessageRepository
import org.springframework.data.domain.Sort
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class MessageService(
    private val messageRepository: MessageRepository,
    private val matchService: MatchService
) {
    
    fun sendMessage(message: Message): Message {
        // Check if users are matched
        val matches = matchService.getMatches(message.senderId, MatchStatus.ACCEPTED)
        val isMatched = matches.any { 
            (it.parentOneId == message.senderId && it.parentTwoId == message.receiverId) || 
            (it.parentOneId == message.receiverId && it.parentTwoId == message.senderId) 
        }
        
        if (!isMatched) {
            throw AccessDeniedException("Cannot send message to non-matched user")
        }
        
        return messageRepository.save(message)
    }
    
    fun getConversation(userId1: String, userId2: String): List<Message> {
        return messageRepository.findConversation(
            userId1, 
            userId2, 
            Sort.by(Sort.Direction.ASC, "sentAt")
        )
    }
    
    fun markAsRead(messageId: String, userId: String): Message {
        val message = messageRepository.findById(messageId)
            .orElseThrow { ResourceNotFoundException("Message not found with id: $messageId") }
        
        if (message.receiverId != userId) {
            throw AccessDeniedException("Only the recipient can mark the message as read")
        }
        
        return messageRepository.save(message.copy(read = true))
    }
    
    fun getUnreadCount(userId: String): Long {
        return messageRepository.countByReceiverIdAndReadFalse(userId)
    }
}