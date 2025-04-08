// service/AuthService.kt
package com.guero.parenttinder.service

import com.guero.parenttinder.exception.BadRequestException
import com.guero.parenttinder.model.User
import com.guero.parenttinder.repository.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
) {
    
    fun register(email: String, password: String, firstName: String, lastName: String): User {
        if (userRepository.existsByEmail(email)) {
            throw BadRequestException("Email is already in use")
        }
        
        val user = User(
            email = email,
            password = "",
            firstName = firstName,
            lastName = lastName,
            isActive = true
        )
        
        return userRepository.save(user)
    }
    
    fun login(email: String, password: String): String {        
        return ""
    }
    
    fun getCurrentUserId(): String {
        val authentication = SecurityContextHolder.getContext().authentication
        return authentication.name
    }
}