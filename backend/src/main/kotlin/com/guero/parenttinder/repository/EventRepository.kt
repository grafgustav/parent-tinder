// repository/EventRepository.kt
package com.guero.parenttinder.repository

import com.guero.parenttinder.model.Event
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface EventRepository : MongoRepository<Event, String> {
    fun findByOrganizerId(organizerId: String): List<Event>
    fun findByDateTimeAfter(dateTime: LocalDateTime): List<Event>
    
    @Query("{ 'participantIds': ?0 }")
    fun findByParticipantId(participantId: String): List<Event>
    
    @Query("{'location.coordinates': {\$near: {\$geometry: {\$type: 'Point', \$coordinates: [?0, ?1]}, \$maxDistance: ?2}}}")
    fun findNearbyEvents(longitude: Double, latitude: Double, maxDistanceInMeters: Int): List<Event>
}