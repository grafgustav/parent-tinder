// controller/EventController.kt
package com.example.parenttinder.controller

import com.example.parenttinder.dto.EventDto
import com.example.parenttinder.model.Event
import com.example.parenttinder.service.AuthService
import com.example.parenttinder.service.EventService
import com.example.parenttinder.service.ParentProfileService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/events")
class EventController(
    private val eventService: EventService,
    private val parentProfileService: ParentProfileService,
    private val authService: AuthService
) {
    
    @PostMapping
    fun createEvent(@Valid @RequestBody eventDto: EventDto): ResponseEntity<Event> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        val event = eventDto.toEntity(parentProfile.id!!)
        return ResponseEntity.ok(eventService.createEvent(event))
    }
    
    @GetMapping("/{id}")
    fun getEvent(@PathVariable id: String): ResponseEntity<Event> {
        return ResponseEntity.ok(eventService.getEvent(id))
    }
    
    @PutMapping("/{id}")
    fun updateEvent(
        @PathVariable id: String,
        @Valid @RequestBody eventDto: EventDto
    ): ResponseEntity<Event> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        val event = eventDto.toEntity(parentProfile.id!!)
        return ResponseEntity.ok(eventService.updateEvent(id, event, parentProfile.id!!))
    }
    
    @DeleteMapping("/{id}")
    fun deleteEvent(@PathVariable id: String): ResponseEntity<Unit> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        eventService.deleteEvent(id, parentProfile.id!!)
        return ResponseEntity.noContent().build()
    }
    
    @PostMapping("/{id}/join")
    fun joinEvent(@PathVariable id: String): ResponseEntity<Event> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(eventService.joinEvent(id, parentProfile.id!!))
    }
    
    @PostMapping("/{id}/leave")
    fun leaveEvent(@PathVariable id: String): ResponseEntity<Event> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(eventService.leaveEvent(id, parentProfile.id!!))
    }
    
    @GetMapping("/upcoming")
    fun getUpcomingEvents(): ResponseEntity<List<Event>> {
        return ResponseEntity.ok(eventService.findUpcomingEvents())
    }
    
    @GetMapping("/nearby")
    fun getNearbyEvents(
        @RequestParam maxDistance: Int = 10000 // Default 10km
    ): ResponseEntity<List<Event>> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(eventService.findNearbyEvents(parentProfile.id!!, maxDistance))
    }
    
    @GetMapping("/organized")
    fun getOrganizedEvents(): ResponseEntity<List<Event>> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(eventService.getEventsByOrganizer(parentProfile.id!!))
    }
    
    @GetMapping("/participating")
    fun getParticipatingEvents(): ResponseEntity<List<Event>> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(eventService.getEventsByParticipant(parentProfile.id!!))
    }
}