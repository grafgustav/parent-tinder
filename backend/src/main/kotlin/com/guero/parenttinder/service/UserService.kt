// service/UserService.kt
package com.example.parenttinder.service

import com.example.parenttinder.model.User
import com.example.parenttinder.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class UserService(private val userRepository: UserRepository) {

    fun findByEmail(email: String): User? {
        return userRepository.findByEmail(email)
    }
    
    fun findById(id: String): User? {
        return userRepository.findById(id).orElse(null)
    }
}