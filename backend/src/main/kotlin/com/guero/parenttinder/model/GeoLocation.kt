// model/GeoLocation.kt
package com.guero.parenttinder.model

import org.springframework.data.mongodb.core.geo.GeoJsonPoint
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed

data class GeoLocation(
    val address: String? = null,
    @field:GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    val coordinates: GeoJsonPoint
) {
    constructor(latitude: Double, longitude: Double, address: String? = null) : 
        this(address, GeoJsonPoint(longitude, latitude))
    
    val latitude: Double
        get() = coordinates.y
    
    val longitude: Double
        get() = coordinates.x
}