// service/MatchService.kt
package com.guero.parenttinder.service

import com.guero.parenttinder.exception.ResourceNotFoundException
import com.guero.parenttinder.model.Match
import com.guero.parenttinder.model.MatchStatus
import com.guero.parenttinder.repository.MatchRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class MatchService(
    private val matchRepository: MatchRepository,
    private val parentProfileService: ParentProfileService
) {
    
    fun createMatch(parentOneId: String, parentTwoId: String): Match {
        // Check they're not the same person
        if (parentOneId == parentTwoId) {
            throw IllegalArgumentException("Cannot match with yourself")
        }
        
        // Check if reverse match exists (other parent already liked this one)
        val existingReverseMatch = matchRepository.findByParentOneIdAndParentTwoId(parentTwoId, parentOneId)
        if (existingReverseMatch != null) {
            // Auto-accept the match if the other parent already liked this one
            return matchRepository.save(
                existingReverseMatch.copy(
                    status = MatchStatus.ACCEPTED,
                    updatedAt = LocalDateTime.now()
                )
            )
        }
        
        // Check if they're already matched
        val existingMatch = matchRepository.findByParentOneIdAndParentTwoId(parentOneId, parentTwoId)
        if (existingMatch != null) {
            return existingMatch
        }
        
        // Verify both parents exist
        parentProfileService.getProfile(parentOneId)
        parentProfileService.getProfile(parentTwoId)
        
        return matchRepository.save(
            Match(
                parentOneId = parentOneId,
                parentTwoId = parentTwoId,
                status = MatchStatus.PENDING
            )
        )
    }
    
    fun updateMatchStatus(matchId: String, parentId: String, status: MatchStatus): Match {
        val match = matchRepository.findById(matchId)
            .orElseThrow { ResourceNotFoundException("Match not found with id: $matchId") }
        
        // Only the parentTwo (the one who received the match request) can accept or reject
        if (match.parentTwoId != parentId) {
            throw AccessDeniedException("Only the matched parent can accept or reject")
        }
        
        return matchRepository.save(match.copy(status = status, updatedAt = LocalDateTime.now()))
    }
    
    fun getMatches(parentId: String, status: MatchStatus? = null): List<Match> {
        return if (status != null) {
            matchRepository.findByParentIdAndStatus(parentId, status)
        } else {
            matchRepository.findByParentId(parentId)
        }
    }
    
    fun getMatch(matchId: String): Match {
        return matchRepository.findById(matchId)
            .orElseThrow { ResourceNotFoundException("Match not found with id: $matchId") }
    }
}