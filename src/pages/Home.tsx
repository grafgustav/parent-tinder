// src/pages/Home.tsx
import React from 'react';
import '../assets/styles/home.css';
import NotificationTester from '../components/NotificationTester';

interface HomeProps {
  navigateTo?: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ navigateTo }) => {
  const handleSignUp = () => {
    if (navigateTo) {
      navigateTo('register');
    }
  };

  return (
    <div className="landing-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to <span className="app-name">ParentConnect</span></h1>
          <p className="tagline">Rediscover your social life while connecting with other parents</p>
          <div className="cta-buttons">
            <button className="primary-button" onClick={handleSignUp}>Sign Up</button>
            <button className="secondary-button">Learn More</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <img src="/api/placeholder/500/400" alt="Parents enjoying social activities" />
          </div>
        </div>
      </section>

      {/* Add the notification tester component */}
      <NotificationTester />

      <section className="features">
        <h2>How ParentConnect Works</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">👋</div>
            <h3>Create Your Profile</h3>
            <p>Share your interests, parenting style, and your children's ages to find like-minded parents.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Find Your Matches</h3>
            <p>Our algorithm suggests compatible parent friends based on common interests and kids' ages.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Connect & Meet Up</h3>
            <p>Message your matches and organize playdates or coffee meetups that work for everyone.</p>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <h2>What Parents Say</h2>
        <div className="testimonial-cards">
          <div className="testimonial-card">
            <p>"ParentConnect helped me find other working moms in my neighborhood. My daughter has new friends and I do too!"</p>
            <div className="testimonial-author">- Sarah, mom of 2</div>
          </div>
          <div className="testimonial-card">
            <p>"As a single dad, it was hard to find other parents to connect with. This app changed everything for us."</p>
            <div className="testimonial-author">- Michael, dad of 1</div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to expand your parent circle?</h2>
        <p>Join our community of parents looking to build meaningful connections.</p>
        <button className="primary-button large" onClick={handleSignUp}>Get Started Today</button>
      </section>
    </div>
  );
};

export default Home;