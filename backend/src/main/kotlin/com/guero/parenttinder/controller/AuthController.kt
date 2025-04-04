// controller/AuthController.kt
package com.example.parenttinder.controller

import com.example.parenttinder.dto.AuthResponse
import com.example.parenttinder.dto.LoginRequest
import com.example.parenttinder.dto.RegisterRequest
import com.example.parenttinder.dto.UserDto
import com.example.parenttinder.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<AuthResponse> {
        val user = authService.register(
            email = request.email,
            password = request.password,
            firstName = request.firstName,
            lastName = request.lastName
        )
        
        val token = authService.login(request.email, request.password)
        
        return ResponseEntity.ok(
            AuthResponse(
                token = token,
                user = UserDto(
                    id = user.id!!,
                    email = user.email,
                    firstName = user.firstName,
                    lastName = user.lastName
                )
            )
        )
    }
    
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        val token = authService.login(request.email, request.password)
        val userId = authService.getCurrentUserId()
        
        // You'll need to implement a method to get user details by ID
        val user = userService.findByEmail(request.email)
            ?: throw IllegalStateException("User not found after login")
        
        return ResponseEntity.ok(
            AuthResponse(
                token = token,
                user = UserDto(
                    id = user.id!!,
                    email = user.email,
                    firstName = user.firstName,
                    lastName = user.lastName
                )
            )
        )
    }
}