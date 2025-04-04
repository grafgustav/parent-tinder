#!/bin/bash

# Check if we're already in the parenttinder directory
if [ "$(basename $(pwd))" != "parenttinder" ]; then
  echo "Error: Current directory is not 'parenttinder'. Please navigate to the parenttinder directory."
  exit 1
fi

# Create directories
mkdir -p config
mkdir -p controller
mkdir -p model
mkdir -p repository
mkdir -p security
mkdir -p service
mkdir -p exception

# Create main application file
touch ParentTinderApplication.kt

# Create config files
touch config/MongoConfig.kt
touch config/SecurityConfig.kt

# Create controller files
touch controller/AuthController.kt
touch controller/EventController.kt
touch controller/MatchController.kt
touch controller/MessageController.kt
touch controller/ParentProfileController.kt

# Create model files
touch model/Child.kt
touch model/Event.kt
touch model/GeoLocation.kt
touch model/Match.kt
touch model/MatchStatus.kt
touch model/Message.kt
touch model/ParentProfile.kt

# Create repository files
touch repository/EventRepository.kt
touch repository/MatchRepository.kt
touch repository/MessageRepository.kt
touch repository/ParentProfileRepository.kt

# Create security files
touch security/JwtAuthenticationFilter.kt
touch security/JwtTokenProvider.kt
touch security/UserDetailsServiceImpl.kt

# Create service files
touch service/AuthService.kt
touch service/EventService.kt
touch service/MatchService.kt
touch service/MessageService.kt
touch service/ParentProfileService.kt

# Create exception files
touch exception/GlobalExceptionHandler.kt
touch exception/ResourceNotFoundException.kt

echo "ParentTinder project structure created successfully!"
