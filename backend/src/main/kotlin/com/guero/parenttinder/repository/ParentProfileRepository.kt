// repository/ParentProfileRepository.kt
package com.guero.parenttinder.repository

import com.guero.parenttinder.model.ParentProfile
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ParentProfileRepository : MongoRepository<ParentProfile, String> {
    fun findByEmail(email: String): ParentProfile?
    fun findByUserId(userId: String): ParentProfile?
    
    @Query("{'location.coordinates': {\$near: {\$geometry: {\$type: 'Point', \$coordinates: [?0, ?1]}, \$maxDistance: ?2}}}")
    fun findNearbyParents(longitude: Double, latitude: Double, maxDistanceInMeters: Int): List<ParentProfile>
}