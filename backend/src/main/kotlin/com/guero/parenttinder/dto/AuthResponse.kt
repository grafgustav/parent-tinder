// dto/AuthResponse.kt
package com.guero.parenttinder.dto

data class AuthResponse(
    val token: String,
    val user: UserDto
)