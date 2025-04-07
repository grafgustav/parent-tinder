// service/UserService.kt
package com.guero.parenttinder.service

import com.guero.parenttinder.model.User
import com.guero.parenttinder.repository.UserRepository
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