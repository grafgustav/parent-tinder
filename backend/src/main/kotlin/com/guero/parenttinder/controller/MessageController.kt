// controller/MessageController.kt
package com.guero.parenttinder.controller

import com.guero.parenttinder.dto.MessageDto
import com.guero.parenttinder.model.Message
import com.guero.parenttinder.service.AuthService
import com.guero.parenttinder.service.MessageService
import com.guero.parenttinder.service.ParentProfileService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

//@RestController
@RequestMapping("/api/messages")
class MessageController(
    private val messageService: MessageService,
    private val parentProfileService: ParentProfileService,
    private val authService: AuthService
) {
    
    @PostMapping
    fun sendMessage(@Valid @RequestBody messageDto: MessageDto): ResponseEntity<Message> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        val message = Message(
            senderId = parentProfile.id!!,
            receiverId = messageDto.receiverId,
            content = messageDto.content
        )
        
        return ResponseEntity.ok(messageService.sendMessage(message))
    }
    
    @GetMapping("/conversations/{receiverId}")
    fun getConversation(@PathVariable receiverId: String): ResponseEntity<List<Message>> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(
            messageService.getConversation(parentProfile.id!!, receiverId)
        )
    }
    
    @PutMapping("/{id}/read")
    fun markAsRead(@PathVariable id: String): ResponseEntity<Message> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(
            messageService.markAsRead(id, parentProfile.id!!)
        )
    }
    
    @GetMapping("/unread/count")
    fun getUnreadCount(): ResponseEntity<Map<String, Long>> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        val count = messageService.getUnreadCount(parentProfile.id!!)
        return ResponseEntity.ok(mapOf("count" to count))
    }
}