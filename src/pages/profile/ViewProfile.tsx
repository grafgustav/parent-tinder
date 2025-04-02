// src/pages/profile/ViewProfile.tsx
import React, { useState, useEffect } from 'react';
import './ViewProfile.css';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  bio: string;
  interests: string[];
  children: { age: number }[];
  profileImage?: string;
}

interface ViewProfileProps {
  navigateTo?: (page: string) => void;
}

const ViewProfile: React.FC<ViewProfileProps> = ({ navigateTo }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load user data from local storage
    const loadUserData = () => {
      const storedData = localStorage.getItem('parentConnectUser');
      if (storedData) {
        try {
          const userData = JSON.parse(storedData);
          setProfile(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      setIsLoading(false);
    };
    
    loadUserData();
  }, []);
  
  if (isLoading) {
    return <div className="loading-profile">Loading profile data...</div>;
  }
  
  if (!profile) {
    return (
      <div className="profile-not-found">
        <h2>Profile Not Found</h2>
        <p>Please complete your registration to create a profile.</p>
        <button 
          className="register-btn"
          onClick={() => navigateTo && navigateTo('register')}
        >
          Create Profile
        </button>
      </div>
    );
  }
  
  return (
    <div className="view-profile-container">
      <div className="profile-header">
        <div className="profile-image-container">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-placeholder">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="profile-info">
          <h1>{profile.firstName} {profile.lastName}</h1>
          <p className="profile-location">{profile.location}</p>
          <button 
            className="edit-profile-btn"
            onClick={() => navigateTo && navigateTo('editProfile')}
          >
            Edit Profile
          </button>
        </div>
      </div>
      
      <div className="profile-body">
        <div className="profile-card">
          <h2>About Me</h2>
          <p className="profile-bio">
            {profile.bio || "No bio information added yet."}
          </p>
        </div>
        
        <div className="profile-card">
          <h2>Children</h2>
          {profile.children.length > 0 ? (
            <div className="children-list">
              {profile.children.map((child, index) => (
                <div className="child-item" key={index}>
                  <span className="child-label">Child {index + 1}:</span>
                  <span className="child-age">{child.age} years old</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No children added yet.</p>
          )}
        </div>
        
        <div className="profile-card">
          <h2>Interests</h2>
          {profile.interests.length > 0 ? (
            <div className="interests-list">
              {profile.interests.map((interest, index) => (
                <span className="interest-tag" key={index}>
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="no-data">No interests added yet.</p>
          )}
        </div>
        
        <div className="profile-card contact-card">
          <h2>Contact Information</h2>
          <p className="contact-info">
            <span className="contact-label">Email:</span>
            <span className="contact-value">{profile.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;