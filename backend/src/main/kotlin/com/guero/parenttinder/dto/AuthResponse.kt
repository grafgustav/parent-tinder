// dto/AuthResponse.kt
package com.example.parenttinder.dto

data class AuthResponse(
    val token: String,
    val user: UserDto
)