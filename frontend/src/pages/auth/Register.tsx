// src/pages/auth/Register.tsx
import React, { useState } from 'react';
import './Register.css';

interface Child {
  id: string;
  age: string;
}

interface Interest {
  id: string;
  name: string;
  selected: boolean;
}


const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    bio: ''
  });

  const [children, setChildren] = useState<Child[]>([
    { id: '1', age: '' }
  ]);

  const [interests, setInterests] = useState<Interest[]>([
    { id: '1', name: 'Outdoor Activities', selected: false },
    { id: '2', name: 'Arts & Crafts', selected: false },
    { id: '3', name: 'Music & Dance', selected: false },
    { id: '4', name: 'Sports', selected: false },
    { id: '5', name: 'Reading', selected: false },
    { id: '6', name: 'Cooking', selected: false },
    { id: '7', name: 'Technology', selected: false },
    { id: '8', name: 'Travel', selected: false },
    { id: '9', name: 'Board Games', selected: false }
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const populateWithSampleData = () => {
    // Sample data
    const sampleData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      location: 'Seattle, WA',
      bio: 'Hi there! I\'m a mother of two who enjoys outdoor activities and arts & crafts with my kids. I work part-time as a graphic designer and love to connect with other creative parents in the area.'
    };

    // Update form data
    setFormData(sampleData);

    // Sample children data
    const sampleChildren = [
      { id: '1', age: '5' },
      { id: '2', age: '3' }
    ];
    setChildren(sampleChildren);

    // Sample interests
    const sampleInterests = interests.map(interest => {
      if (['1', '2', '4', '8'].includes(interest.id)) {
        return { ...interest, selected: true };
      }
      return interest;
    });
    setInterests(sampleInterests);

    // Clear any existing errors
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleChildAgeChange = (id: string, value: string) => {
    const updatedChildren = children.map(child =>
      child.id === id ? { ...child, age: value } : child
    );
    setChildren(updatedChildren);
  };

  const addChild = () => {
    const newId = (parseInt(children[children.length - 1].id) + 1).toString();
    setChildren([...children, { id: newId, age: '' }]);
  };

  const removeChild = (id: string) => {
    if (children.length > 1) {
      setChildren(children.filter(child => child.id !== id));
    }
  };

  const toggleInterest = (id: string) => {
    const updatedInterests = interests.map(interest =>
      interest.id === id ? { ...interest, selected: !interest.selected } : interest
    );
    setInterests(updatedInterests);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Validate children
    const invalidChildren = children.filter(child => !child.age || isNaN(Number(child.age)));
    if (invalidChildren.length > 0) {
      newErrors.children = 'Please enter valid ages for all children';
    }

    // Validate interests
    if (!interests.some(interest => interest.selected)) {
      newErrors.interests = 'Please select at least one interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // Prepare data for submission
      const selectedInterests = interests
        .filter(interest => interest.selected)
        .map(interest => interest.name);

      const userData = {
        ...formData,
        children: children.map(child => ({ age: parseInt(child.age) })),
        interests: selectedInterests
      };

      // Simulate API call
      setTimeout(() => {
        console.log('User registration data:', userData);

        // Store data locally - in a real app, this would go to your backend
        localStorage.setItem('parentConnectUser', JSON.stringify(userData));

        // Reset form or redirect
        alert('Registration successful!');
        setIsSubmitting(false);
      }, 1500);
    }
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <h1>Join the ParentConnect Community</h1>
        <p>Connect with like-minded parents in your area</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name*</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <div className="error-message">{errors.firstName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name*</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <div className="error-message">{errors.lastName}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">Password*</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password*</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location*</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="City, State"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <div className="error-message">{errors.location}</div>}
          </div>
        </div>

        <div className="form-section">
          <h2>Children</h2>
          <p>Please provide the ages of your children</p>

          {children.map((child, index) => (
            <div className="child-row" key={child.id}>
              <div className="form-group">
                <label htmlFor={`child-${child.id}`}>Child {index + 1} Age*</label>
                <input
                  type="number"
                  id={`child-${child.id}`}
                  min="0"
                  max="18"
                  value={child.age}
                  onChange={(e) => handleChildAgeChange(child.id, e.target.value)}
                />
              </div>

              {children.length > 1 && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeChild(child.id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="add-button"
            onClick={addChild}
          >
            + Add Another Child
          </button>

          {errors.children && <div className="error-message">{errors.children}</div>}
        </div>

        <div className="form-section">
          <h2>Interests*</h2>
          <p>Select all that apply to help us match you with like-minded parents</p>

          <div className="interests-grid">
            {interests.map(interest => (
              <div
                key={interest.id}
                className={`interest-item ${interest.selected ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest.id)}
              >
                {interest.name}
              </div>
            ))}
          </div>

          {errors.interests && <div className="error-message">{errors.interests}</div>}
        </div>

        <div className="form-section">
          <h2>About You</h2>

          <div className="form-group">
            <label htmlFor="bio">Bio (Optional)</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              placeholder="Share a little about yourself, your parenting style, and what you're looking for in parent connections..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="populate-button"
            onClick={populateWithSampleData}
          >
            Fill with Sample Data
          </button>
          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
          <p className="login-redirect">
            Already have an account? <a href="/login">Log In</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;