// security/UserDetailsServiceImpl.kt
package com.guero.parenttinder.security

import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.Collections

@Service
class UserDetailsServiceImpl(
    private val userService: com.guero.parenttinder.service.UserService
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user = userService.findByEmail(username)
            ?: throw UsernameNotFoundException("User with email $username not found")
        
        return User
            .withUsername(username)
            .password(user.password)
            .authorities(Collections.emptyList())
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(!user.isActive)
            .build()
    }
}