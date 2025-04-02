// src/pages/profile/EditProfile.tsx
import React, { useState, useEffect, useRef } from 'react';
import './EditProfile.css';

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

interface EditProfileProps {
  navigateTo?: (page: string) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ navigateTo }) => {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    bio: '',
    interests: [],
    children: [],
    profileImage: ''
  });

  const [availableInterests, setAvailableInterests] = useState([
    'Outdoor Activities',
    'Arts & Crafts',
    'Music & Dance',
    'Sports',
    'Reading',
    'Cooking',
    'Technology',
    'Travel',
    'Board Games'
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
          setMessage({ text: 'Error loading profile data', type: 'error' });
        }
      }
      setIsLoading(false);
    };
    
    loadUserData();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const toggleInterest = (interest: string) => {
    setProfile(prev => {
      const updatedInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      
      return { ...prev, interests: updatedInterests };
    });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setMessage({ text: 'Please upload a valid image file (JPEG, PNG, GIF)', type: 'error' });
      return;
    }
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Image size should be less than 2MB', type: 'error' });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Store image as Data URL
        setProfile(prev => ({ ...prev, profileImage: event.target?.result as string }));
        setMessage({ text: 'Image uploaded successfully', type: 'success' });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const removeImage = () => {
    setProfile(prev => ({ ...prev, profileImage: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleChildAgeChange = (index: number, newAge: string) => {
    const age = parseInt(newAge) || 0;
    
    setProfile(prev => {
      const updatedChildren = [...prev.children];
      updatedChildren[index] = { age };
      return { ...prev, children: updatedChildren };
    });
  };
  
  const addChild = () => {
    setProfile(prev => ({
      ...prev,
      children: [...prev.children, { age: 0 }]
    }));
  };
  
  const removeChild = (index: number) => {
    setProfile(prev => {
      const updatedChildren = [...prev.children];
      updatedChildren.splice(index, 1);
      return { ...prev, children: updatedChildren };
    });
  };
  
  const saveProfile = () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    // Simple validation
    if (!profile.firstName || !profile.lastName || !profile.email) {
      setMessage({ text: 'Please fill out all required fields', type: 'error' });
      setIsSaving(false);
      return;
    }
    
    // Save to local storage
    try {
      localStorage.setItem('parentConnectUser', JSON.stringify(profile));
      setMessage({ text: 'Profile updated successfully', type: 'success' });
      
      // Simulate a server delay
      setTimeout(() => {
        setIsSaving(false);
      }, 800);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ text: 'Error saving profile data', type: 'error' });
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="loading-profile">Loading profile data...</div>;
  }
  
  return (
    <div className="edit-profile-container">
      <h1>Edit Your Profile</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="profile-sections">
        <div className="profile-section image-section">
          <h2>Profile Picture</h2>
          
          <div className="profile-image-container">
            {profile.profileImage ? (
              <div className="profile-image">
                <img src={profile.profileImage} alt="Profile" />
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={removeImage}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="profile-image-placeholder" onClick={triggerFileInput}>
                <span className="placeholder-text">Click to add a profile picture</span>
              </div>
            )}
          </div>
          
          <div className="image-upload-controls">
            <button 
              type="button"
              className="upload-button"
              onClick={triggerFileInput}
            >
              {profile.profileImage ? 'Change Picture' : 'Upload Picture'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/png,image/gif"
              style={{ display: 'none' }}
            />
            <p className="upload-info">Max size: 2MB. Formats: JPEG, PNG, GIF</p>
          </div>
        </div>
        
        <div className="profile-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="firstName">First Name*</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profile.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name*</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={profile.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location*</label>
            <input
              type="text"
              id="location"
              name="location"
              value={profile.location}
              onChange={handleInputChange}
              placeholder="City, State"
              required
            />
          </div>
        </div>
        
        <div className="profile-section">
          <h2>About You</h2>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              rows={5}
              placeholder="Share a little about yourself, your parenting style, and what you're looking for in parent connections..."
            />
          </div>
        </div>
        
        <div className="profile-section">
          <h2>Children</h2>
          
          {profile.children.length === 0 ? (
            <p className="no-items">No children added yet</p>
          ) : (
            profile.children.map((child, index) => (
              <div className="child-item" key={index}>
                <div className="form-group">
                  <label htmlFor={`child-${index}`}>Child {index + 1} Age</label>
                  <input
                    type="number"
                    id={`child-${index}`}
                    value={child.age}
                    onChange={(e) => handleChildAgeChange(index, e.target.value)}
                    min="0"
                    max="18"
                  />
                </div>
                <button 
                  type="button" 
                  className="remove-btn"
                  onClick={() => removeChild(index)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
          
          <button 
            type="button" 
            className="add-button"
            onClick={addChild}
          >
            + Add Child
          </button>
        </div>
        
        <div className="profile-section">
          <h2>Interests</h2>
          <p className="section-subtitle">Select the activities and topics you enjoy</p>
          
          <div className="interests-grid">
            {availableInterests.map((interest, index) => (
              <div 
                key={index}
                className={`interest-item ${profile.interests.includes(interest) ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="profile-actions">
        <button 
          type="button"
          className="discard-button"
          onClick={() => navigateTo && navigateTo('profile')}
        >
          Cancel
        </button>
        <button 
          type="button"
          className="save-button"
          onClick={saveProfile}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;