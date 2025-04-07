// repository/MatchRepository.kt
package com.guero.parenttinder.repository

import com.guero.parenttinder.model.Match
import com.guero.parenttinder.model.MatchStatus
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface MatchRepository : MongoRepository<Match, String> {
    fun findByParentOneIdAndParentTwoId(parentOneId: String, parentTwoId: String): Match?
    
    @Query("{ \$or: [ { 'parentOneId': ?0 }, { 'parentTwoId': ?0 } ] }")
    fun findByParentId(parentId: String): List<Match>
    
    @Query("{ \$or: [ { 'parentOneId': ?0 }, { 'parentTwoId': ?0 } ], 'status': ?1 }")
    fun findByParentIdAndStatus(parentId: String, status: MatchStatus): List<Match>
}