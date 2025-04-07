// repository/UserRepository.kt
package com.guero.parenttinder.repository

import com.guero.parenttinder.model.User
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : MongoRepository<User, String> {
    fun findByEmail(email: String): User?
    fun existsByEmail(email: String): Boolean
}