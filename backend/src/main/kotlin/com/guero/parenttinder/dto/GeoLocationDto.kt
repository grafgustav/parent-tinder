// dto/GeoLocationDto.kt
package com.guero.parenttinder.dto

data class GeoLocationDto(
    val latitude: Double,
    val longitude: Double,
    val address: String? = null
)