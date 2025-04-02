// src/pages/matching/Matches.tsx
import React, { useState, useEffect } from 'react';
import { findMatches, getCurrentUser, initializeSampleData, MatchScore } from '../../services/matchingService';
import './Matches.css';

interface MatchesProps {
  navigateTo?: (page: string) => void;
}

const Matches: React.FC<MatchesProps> = ({ navigateTo }) => {
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchScore | null>(null);
  const [filter, setFilter] = useState('all'); // all, highInterest, highAge
  
  useEffect(() => {
    // Initialize sample data if needed (for demo purposes)
    initializeSampleData();
    
    // Find matches based on current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      const matchResults = findMatches(currentUser);
      setMatches(matchResults);
    }
    
    setIsLoading(false);
  }, []);
  
  const filterMatches = () => {
    if (filter === 'all') {
      return matches;
    } else if (filter === 'highInterest') {
      return [...matches].sort((a, b) => b.interestScore - a.interestScore);
    } else if (filter === 'highAge') {
      return [...matches].sort((a, b) => b.ageCompatibilityScore - a.ageCompatibilityScore);
    }
    return matches;
  };
  
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };
  
  const handleMatchClick = (match: MatchScore) => {
    setSelectedMatch(match);
  };
  
  const closeMatchDetails = () => {
    setSelectedMatch(null);
  };
  
  if (isLoading) {
    return <div className="loading-matches">Finding potential matches...</div>;
  }
  
  if (matches.length === 0) {
    return (
      <div className="no-matches-container">
        <h1>Find Parent Matches</h1>
        <div className="no-matches-card">
          <h2>No Matches Found</h2>
          <p>
            We couldn't find any matches for your profile. This could be because:
          </p>
          <ul>
            <li>Your profile is incomplete</li>
            <li>You haven't added your interests or children's information</li>
            <li>There aren't any other parents in your area yet</li>
          </ul>
          <button 
            className="update-profile-btn"
            onClick={() => navigateTo && navigateTo('editProfile')}
          >
            Update Your Profile
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="matches-container">
      <h1>Your Parent Matches</h1>
      <p className="matches-intro">
        We've found {matches.length} potential parent matches based on your interests 
        and your children's ages. Connect with parents who share your parenting journey!
      </p>
      
      <div className="matches-filter">
        <span>Sort by:</span>
        <div className="filter-options">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Best Overall Match
          </button>
          <button 
            className={filter === 'highInterest' ? 'active' : ''} 
            onClick={() => setFilter('highInterest')}
          >
            Similar Interests
          </button>
          <button 
            className={filter === 'highAge' ? 'active' : ''} 
            onClick={() => setFilter('highAge')}
          >
            Child Age Compatibility
          </button>
        </div>
      </div>
      
      <div className="matches-grid">
        {filterMatches().map((match, index) => (
          <div 
            className="match-card" 
            key={match.parent.id || index}
            onClick={() => handleMatchClick(match)}
          >
            <div className="match-header">
              <div className="match-image">
                {match.parent.profileImage ? (
                  <img src={match.parent.profileImage} alt={`${match.parent.firstName}`} />
                ) : (
                  <div className="match-initials">
                    {match.parent.firstName.charAt(0)}{match.parent.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="match-score-badge">
                <span className={getScoreClass(match.totalScore)}>
                  {Math.round(match.totalScore)}%
                </span>
                match
              </div>
            </div>
            
            <div className="match-info">
              <h3>{match.parent.firstName} {match.parent.lastName.charAt(0)}.</h3>
              <p className="match-location">{match.parent.location}</p>
              
              <div className="match-children">
                {match.parent.children.map((child, idx) => (
                  <span className="child-age" key={idx}>
                    {child.age} yr{child.age !== 1 ? 's' : ''}
                  </span>
                ))}
              </div>
              
              <div className="match-bio-preview">
                {match.parent.bio.substring(0, 65)}
                {match.parent.bio.length > 65 ? '...' : ''}
              </div>
              
              <div className="match-interests">
                {match.commonInterests.slice(0, 3).map((interest, idx) => (
                  <span className="common-interest" key={idx}>
                    {interest}
                  </span>
                ))}
              </div>
              
              <div className="match-compatibility">
                <div className="compatibility-item">
                  <span className="compatibility-label">Interests</span>
                  <div className="compatibility-bar">
                    <div 
                      className={`compatibility-fill ${getScoreClass(match.interestScore)}`}
                      style={{ width: `${Math.min(100, match.interestScore)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="compatibility-item">
                  <span className="compatibility-label">Ages</span>
                  <div className="compatibility-bar">
                    <div 
                      className={`compatibility-fill ${getScoreClass(match.ageCompatibilityScore)}`}
                      style={{ width: `${Math.min(100, match.ageCompatibilityScore)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <button className="view-profile-btn">View Profile</button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedMatch && (
        <div className="match-detail-overlay">
          <div className="match-detail-modal">
            <button className="close-modal" onClick={closeMatchDetails}>✕</button>
            
            <div className="match-detail-header">
              <div className="match-detail-image">
                {selectedMatch.parent.profileImage ? (
                  <img src={selectedMatch.parent.profileImage} alt={`${selectedMatch.parent.firstName}`} />
                ) : (
                  <div className="match-detail-initials">
                    {selectedMatch.parent.firstName.charAt(0)}{selectedMatch.parent.lastName.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="match-detail-info">
                <h2>{selectedMatch.parent.firstName} {selectedMatch.parent.lastName}</h2>
                <p className="match-detail-location">{selectedMatch.parent.location}</p>
                <div className="match-overall-score">
                  <span className={getScoreClass(selectedMatch.totalScore)}>
                    {Math.round(selectedMatch.totalScore)}%
                  </span>
                  match with you
                </div>
              </div>
            </div>
            
            <div className="match-detail-body">
              <div className="match-detail-section">
                <h3>About</h3>
                <p>{selectedMatch.parent.bio}</p>
              </div>
              
              <div className="match-detail-section">
                <h3>Children</h3>
                <div className="match-detail-children">
                  {selectedMatch.parent.children.map((child, idx) => (
                    <div className="detail-child" key={idx}>
                      <div className="detail-child-icon">👶</div>
                      <span>Child {idx + 1}: {child.age} years old</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="match-detail-section">
                <h3>Common Interests</h3>
                <div className="match-detail-interests">
                  {selectedMatch.commonInterests.map((interest, idx) => (
                    <span className="detail-interest" key={idx}>
                      {interest}
                    </span>
                  ))}
                </div>
                
                {selectedMatch.parent.interests.filter(interest => 
                  !selectedMatch.commonInterests.includes(interest)
                ).length > 0 && (
                  <>
                    <h4>Other Interests</h4>
                    <div className="match-detail-interests other-interests">
                      {selectedMatch.parent.interests.filter(interest => 
                        !selectedMatch.commonInterests.includes(interest)
                      ).map((interest, idx) => (
                        <span className="detail-interest other" key={idx}>
                          {interest}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="match-detail-section">
                <h3>Compatibility</h3>
                <div className="detail-compatibility">
                  <div className="detail-compatibility-item">
                    <div className="detail-compatibility-header">
                      <span className="detail-compatibility-label">Interest Compatibility</span>
                      <span className={`detail-compatibility-score ${getScoreClass(selectedMatch.interestScore)}`}>
                        {Math.round(selectedMatch.interestScore)}%
                      </span>
                    </div>
                    <div className="detail-compatibility-bar">
                      <div 
                        className={`detail-compatibility-fill ${getScoreClass(selectedMatch.interestScore)}`}
                        style={{ width: `${Math.min(100, selectedMatch.interestScore)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="detail-compatibility-item">
                    <div className="detail-compatibility-header">
                      <span className="detail-compatibility-label">Child Age Compatibility</span>
                      <span className={`detail-compatibility-score ${getScoreClass(selectedMatch.ageCompatibilityScore)}`}>
                        {Math.round(selectedMatch.ageCompatibilityScore)}%
                      </span>
                    </div>
                    <div className="detail-compatibility-bar">
                      <div 
                        className={`detail-compatibility-fill ${getScoreClass(selectedMatch.ageCompatibilityScore)}`}
                        style={{ width: `${Math.min(100, selectedMatch.ageCompatibilityScore)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="match-detail-actions">
              <button className="connect-button">Connect with {selectedMatch.parent.firstName}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;