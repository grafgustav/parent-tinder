// src/services/matchingService.ts

interface Child {
    age: number;
  }
  
  interface UserProfile {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    location: string;
    bio: string;
    interests: string[];
    children: Child[];
    profileImage?: string;
  }
  
  // Sample parent data (in a real app, this would come from a database)
  const sampleParents: UserProfile[] = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      location: 'Seattle, WA',
      bio: 'Working mom of two little ones. Love outdoor activities and arts & crafts with the kids.',
      interests: ['Outdoor Activities', 'Arts & Crafts', 'Reading'],
      children: [{ age: 4 }, { age: 6 }],
      profileImage: ''
    },
    {
      id: '2',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.c@example.com',
      location: 'Portland, OR',
      bio: 'Dad to a curious 5 year old. Software engineer who loves board games and hiking.',
      interests: ['Technology', 'Board Games', 'Outdoor Activities'],
      children: [{ age: 5 }],
      profileImage: ''
    },
    {
      id: '3',
      firstName: 'Jessica',
      lastName: 'Garcia',
      email: 'jess.g@example.com',
      location: 'Bellevue, WA',
      bio: 'Mom of three energetic kids. Love cooking, sports and helping with school activities.',
      interests: ['Sports', 'Cooking', 'Reading'],
      children: [{ age: 4 }, { age: 7 }, { age: 9 }],
      profileImage: ''
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.w@example.com',
      location: 'Seattle, WA',
      bio: 'Single dad with twins. Looking for weekend playdate buddies and parent friends.',
      interests: ['Music & Dance', 'Outdoor Activities', 'Board Games'],
      children: [{ age: 6 }, { age: 6 }],
      profileImage: ''
    },
    {
      id: '5',
      firstName: 'Emma',
      lastName: 'Taylor',
      email: 'emma.t@example.com',
      location: 'Redmond, WA',
      bio: 'Mom to a toddler. Love parks, music classes and meeting other parents.',
      interests: ['Music & Dance', 'Arts & Crafts', 'Travel'],
      children: [{ age: 2 }],
      profileImage: ''
    },
    {
      id: '6',
      firstName: 'Omar',
      lastName: 'Patel',
      email: 'omar.p@example.com',
      location: 'Vancouver, WA',
      bio: 'Dad of two boys who are very active. Looking for sports and outdoor activities.',
      interests: ['Sports', 'Outdoor Activities', 'Technology'],
      children: [{ age: 8 }, { age: 10 }],
      profileImage: ''
    },
    {
      id: '7',
      firstName: 'Aisha',
      lastName: 'Williams',
      email: 'aisha.w@example.com',
      location: 'Seattle, WA',
      bio: 'Mom of a kindergartner. Teacher who loves books, arts and educational activities.',
      interests: ['Reading', 'Arts & Crafts', 'Board Games'],
      children: [{ age: 5 }],
      profileImage: ''
    }
  ];
  
  export interface MatchScore {
    parent: UserProfile;
    interestScore: number;
    ageCompatibilityScore: number;
    totalScore: number;
    commonInterests: string[];
  }
  
  export const findMatches = (currentUser: UserProfile): MatchScore[] => {
    // If there's no current user profile, return empty array
    if (!currentUser || !currentUser.interests || !currentUser.children) {
      return [];
    }
  
    // Get all potential matches (in a real app, this would filter by location, etc.)
    const potentialMatches = [...sampleParents].filter(parent => 
      // Don't match with yourself
      parent.email !== currentUser.email
    );
  
    // Calculate match scores
    const matches: MatchScore[] = potentialMatches.map(parent => {
      // Calculate interest compatibility (how many interests in common)
      const commonInterests = currentUser.interests.filter(interest => 
        parent.interests.includes(interest)
      );
      
      const interestScore = (commonInterests.length / Math.max(currentUser.interests.length, parent.interests.length)) * 100;
      
      // Calculate age compatibility (how close the children's ages are)
      let ageCompatibilitySum = 0;
      let ageCompatibilityCount = 0;
      
      for (const currentChild of currentUser.children) {
        for (const potentialChild of parent.children) {
          const ageDifference = Math.abs(currentChild.age - potentialChild.age);
          
          // Children within 2 years of age are most compatible
          // Score decreases as age gap increases
          if (ageDifference <= 2) {
            ageCompatibilitySum += 100 - (ageDifference * 10);
          } else if (ageDifference <= 4) {
            ageCompatibilitySum += 80 - (ageDifference * 5);
          } else {
            ageCompatibilitySum += Math.max(30, 100 - (ageDifference * 10));
          }
          
          ageCompatibilityCount++;
        }
      }
      
      const ageCompatibilityScore = ageCompatibilityCount > 0 
        ? ageCompatibilitySum / ageCompatibilityCount 
        : 0;
        
      // Calculate total score (weighted average)
      const totalScore = (interestScore * 0.6) + (ageCompatibilityScore * 0.4);
      
      return {
        parent,
        interestScore,
        ageCompatibilityScore,
        totalScore,
        commonInterests
      };
    });
    
    // Sort by total score (highest first)
    return matches.sort((a, b) => b.totalScore - a.totalScore);
  };
  
  // Function to get the current user from localStorage
  export const getCurrentUser = (): UserProfile | null => {
    const storedData = localStorage.getItem('parentConnectUser');
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  };
  
  // Add sample data to localStorage for demonstration purposes
  export const initializeSampleData = () => {
    // Check if we've already initialized
    if (localStorage.getItem('sampleDataInitialized')) {
      return;
    }
    
    // Add some random placeholder images to sample parents
    const updatedSampleParents = sampleParents.map(parent => {
      // In a real app, these would be actual profile pictures
      // Here we're just using placeholders with different colors
      const colors = ['4e79a7', 'f28e2c', 'e15759', '76b7b2', '59a14f', 'edc949', 'af7aa1'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      return {
        ...parent,
        profileImage: `https://via.placeholder.com/150/${randomColor}/ffffff?text=${parent.firstName.charAt(0)}${parent.lastName.charAt(0)}`
      };
    });
    
    // Store each sample parent for later retrieval
    localStorage.setItem('sampleParents', JSON.stringify(updatedSampleParents));
    localStorage.setItem('sampleDataInitialized', 'true');
    
    // If no user exists, create one for demo purposes
    if (!localStorage.getItem('parentConnectUser')) {
      const demoUser: UserProfile = {
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex.morgan@example.com',
        location: 'Seattle, WA',
        bio: 'Parent of two looking for connections with other families for weekend activities and playdates.',
        interests: ['Outdoor Activities', 'Board Games', 'Reading'],
        children: [{ age: 5 }, { age: 7 }],
      };
      
      localStorage.setItem('parentConnectUser', JSON.stringify(demoUser));
    }
  };
  
  // Get all sample parents
  export const getSampleParents = (): UserProfile[] => {
    const storedData = localStorage.getItem('sampleParents');
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.error('Error parsing sample parents data:', error);
        return sampleParents;
      }
    }
    return sampleParents;
  };