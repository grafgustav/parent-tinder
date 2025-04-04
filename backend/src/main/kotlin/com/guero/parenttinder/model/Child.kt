// model/Child.kt
package com.example.parenttinder.model

import java.time.LocalDate

data class Child(
    val name: String,
    val birthDate: LocalDate,
    val gender: String? = null,
    val interests: List<String> = emptyList()
) {
    val age: Int
        get() = birthDate.until(LocalDate.now()).years
}