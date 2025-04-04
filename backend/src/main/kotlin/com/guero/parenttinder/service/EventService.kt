// service/EventService.kt
package com.example.parenttinder.service

import com.example.parenttinder.exception.ResourceNotFoundException
import com.example.parenttinder.model.Event
import com.example.parenttinder.repository.EventRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val parentProfileService: ParentProfileService
) {
    
    fun createEvent(event: Event): Event {
        return eventRepository.save(event)
    }
    
    fun getEvent(id: String): Event {
        return eventRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Event not found with id: $id") }
    }
    
    fun updateEvent(id: String, event: Event, userId: String): Event {
        val existingEvent = getEvent(id)
        
        if (existingEvent.organizerId != userId) {
            throw AccessDeniedException("Only the organizer can update the event")
        }
        
        val updatedEvent = event.copy(
            id = id,
            organizerId = existingEvent.organizerId,
            createdAt = existingEvent.createdAt,
            updatedAt = LocalDateTime.now()
        )
        
        return eventRepository.save(updatedEvent)
    }
    
    fun deleteEvent(id: String, userId: String) {
        val event = getEvent(id)
        
        if (event.organizerId != userId) {
            throw AccessDeniedException("Only the organizer can delete the event")
        }
        
        eventRepository.delete(event)
    }
    
    fun joinEvent(eventId: String, userId: String): Event {
        val event = getEvent(eventId)
        
        if (event.participantIds.contains(userId)) {
            return event
        }
        
        if (event.maxParticipants != null && event.participantIds.size >= event.maxParticipants) {
            throw IllegalStateException("Event has reached maximum participants")
        }
        
        event.participantIds.add(userId)
        return eventRepository.save(event.copy(updatedAt = LocalDateTime.now()))
    }
    
    fun leaveEvent(eventId: String, userId: String): Event {
        val event = getEvent(eventId)
        
        if (!event.participantIds.contains(userId)) {
            return event
        }
        
        event.participantIds.remove(userId)
        return eventRepository.save(event.copy(updatedAt = LocalDateTime.now()))
    }
    
    fun findUpcomingEvents(): List<Event> {
        return eventRepository.findByDateTimeAfter(LocalDateTime.now())
    }
    
    fun findNearbyEvents(parentId: String, maxDistanceInMeters: Int): List<Event> {
        val parentProfile = parentProfileService.getProfile(parentId)
        parentProfile.location ?: throw IllegalStateException("Parent location not set")
        
        return eventRepository.findNearbyEvents(
            parentProfile.location.longitude,
            parentProfile.location.latitude,
            maxDistanceInMeters
        )
    }
    
    fun getEventsByOrganizer(organizerId: String): List<Event> {
        return eventRepository.findByOrganizerId(organizerId)
    }
    
    fun getEventsByParticipant(participantId: String): List<Event> {
        return eventRepository.findByParticipantId(participantId)
    }
}