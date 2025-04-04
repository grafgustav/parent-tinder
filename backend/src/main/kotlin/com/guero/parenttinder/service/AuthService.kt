// service/AuthService.kt
package com.example.parenttinder.service

import com.example.parenttinder.exception.BadRequestException
import com.example.parenttinder.model.User
import com.example.parenttinder.repository.UserRepository
import com.example.parenttinder.security.JwtTokenProvider
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authenticationManager: AuthenticationManager
) {
    
    fun register(email: String, password: String, firstName: String, lastName: String): User {
        if (userRepository.existsByEmail(email)) {
            throw BadRequestException("Email is already in use")
        }
        
        val user = User(
            email = email,
            password = passwordEncoder.encode(password),
            firstName = firstName,
            lastName = lastName,
            isActive = true
        )
        
        return userRepository.save(user)
    }
    
    fun login(email: String, password: String): String {
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(email, password)
        )
        
        SecurityContextHolder.getContext().authentication = authentication
        return jwtTokenProvider.generateToken(email)
    }
    
    fun getCurrentUserId(): String {
        val authentication = SecurityContextHolder.getContext().authentication
        return authentication.name
    }
}