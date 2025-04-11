// service/AuthService.kt
package com.guero.parenttinder.service

import com.guero.parenttinder.exception.BadRequestException
import com.guero.parenttinder.model.User
import com.guero.parenttinder.repository.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import com.guero.parenttinder.exception.InvalidCredentialsException

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
            password = password,
            firstName = firstName,
            lastName = lastName,
            isActive = true
        )
        
        return userRepository.save(user)
    }
    
    fun login(email: String, password: String): String {
        // Find user by email
        val user = userRepository.findByEmail(email)
            ?: throw InvalidCredentialsException("Invalid email or password")
        
        // Verify password
        if (password != user.password) {
            throw InvalidCredentialsException("Invalid email or password")
        }
        
        // Generate JWT token
        return user.id.toString()
    }
    
    fun getCurrentUserId(): String {
        val authentication = SecurityContextHolder.getContext().authentication
        return authentication.name
    }
}