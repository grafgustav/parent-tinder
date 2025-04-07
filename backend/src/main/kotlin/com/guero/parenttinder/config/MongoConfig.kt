// config/MongoConfig.kt
package com.guero.parenttinder.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.config.EnableMongoAuditing
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean

@Configuration
@EnableMongoAuditing
class MongoConfig {

    @Bean
    fun validatingMongoEventListener(validator: LocalValidatorFactoryBean): ValidatingMongoEventListener {
        return ValidatingMongoEventListener(validator)
    }
}