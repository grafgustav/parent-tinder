// controller/MatchController.kt
package com.example.parenttinder.controller

import com.example.parenttinder.dto.MatchResponseDto
import com.example.parenttinder.model.Match
import com.example.parenttinder.model.MatchStatus
import com.example.parenttinder.service.AuthService
import com.example.parenttinder.service.MatchService
import com.example.parenttinder.service.ParentProfileService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/matches")
class MatchController(
    private val matchService: MatchService,
    private val parentProfileService: ParentProfileService,
    private val authService: AuthService
) {
    
    @PostMapping("/{profileId}")
    fun createMatch(@PathVariable profileId: String): ResponseEntity<Match> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(
            matchService.createMatch(parentProfile.id!!, profileId)
        )
    }
    
    @PutMapping("/{matchId}/accept")
    fun acceptMatch(@PathVariable matchId: String): ResponseEntity<Match> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(
            matchService.updateMatchStatus(matchId, parentProfile.id!!, MatchStatus.ACCEPTED)
        )
    }
    
    @PutMapping("/{matchId}/reject")
    fun rejectMatch(@PathVariable matchId: String): ResponseEntity<Match> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        return ResponseEntity.ok(
            matchService.updateMatchStatus(matchId, parentProfile.id!!, MatchStatus.REJECTED)
        )
    }
    
    @GetMapping
    fun getMatches(
        @RequestParam status: MatchStatus? = null
    ): ResponseEntity<List<MatchResponseDto>> {
        val userId = authService.getCurrentUserId()
        val parentProfile = parentProfileService.getProfileByUserId(userId)
            ?: return ResponseEntity.badRequest().build()
            
        val matches = matchService.getMatches(parentProfile.id!!, status)
        val matchDtos = matches.map { match ->
            // Determine the other parent's ID
            val otherParentId = if (match.parentOneId == parentProfile.id) match.parentTwoId else match.parentOneId
            val otherParent = parentProfileService.getProfile(otherParentId)
            
            MatchResponseDto(
                id = match.id!!,
                status = match.status,
                createdAt = match.createdAt,
                parent = otherParent
            )
        }
        
        return ResponseEntity.ok(matchDtos)
    }
}