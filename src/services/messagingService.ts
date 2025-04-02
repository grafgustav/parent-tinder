// src/services/messagingService.ts

import { getCurrentUser, getSampleParents } from './matchingService';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  messages: Message[];
}

// Generate a simple UUID for IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Initialize sample conversations for demo purposes
export const initializeConversations = () => {
  // Check if we've already initialized
  if (localStorage.getItem('conversationsInitialized')) {
    return;
  }
  
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return;
  }
  
  const sampleParents = getSampleParents();
  if (!sampleParents || sampleParents.length === 0) {
    return;
  }
  
  // Create sample conversations with a few parents
  const sampleConversations: Conversation[] = [];
  const selectedParents = sampleParents.slice(0, 3); // Just use first 3 sample parents
  
  for (const parent of selectedParents) {
    const conversationId = generateId();
    
    // Create some sample messages
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    const messages: Message[] = [
      {
        id: generateId(),
        senderId: currentUser.email,
        receiverId: parent.email,
        content: `Hi ${parent.firstName}! I noticed we matched and thought I'd reach out. Our kids seem to be around the same age.`,
        timestamp: now - (3 * dayInMs),
        read: true
      },
      {
        id: generateId(),
        senderId: parent.email,
        receiverId: currentUser.email,
        content: `Hello! Thanks for reaching out. Yes, I'd love to connect and maybe arrange a playdate sometime.`,
        timestamp: now - (2.5 * dayInMs),
        read: true
      },
      {
        id: generateId(),
        senderId: currentUser.email,
        receiverId: parent.email,
        content: `That would be great! What area of town are you in? We're near the city park.`,
        timestamp: now - (2 * dayInMs),
        read: true
      },
      {
        id: generateId(),
        senderId: parent.email,
        receiverId: currentUser.email,
        content: `We're actually not too far from there. Maybe we could meet at the playground there this weekend?`,
        timestamp: now - (1.5 * dayInMs),
        read: true
      }
    ];
    
    // For one conversation, add an unread message
    if (parent.id === selectedParents[0].id) {
      messages.push({
        id: generateId(),
        senderId: parent.email,
        receiverId: currentUser.email,
        content: `Just checking in to confirm for Saturday at 2pm at the park? My kids are really excited to meet new friends!`,
        timestamp: now - (0.5 * dayInMs),
        read: false
      });
    }
    
    sampleConversations.push({
      id: conversationId,
      participants: [currentUser.email, parent.email],
      messages,
      lastMessage: messages[messages.length - 1]
    });
  }
  
  localStorage.setItem('conversations', JSON.stringify(sampleConversations));
  localStorage.setItem('conversationsInitialized', 'true');
};

// Get all conversations involving the current user
export const getConversations = (): Conversation[] => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return [];
  }
  
  const storedConversations = localStorage.getItem('conversations');
  if (!storedConversations) {
    return [];
  }
  
  try {
    const conversations: Conversation[] = JSON.parse(storedConversations);
    return conversations.filter(conversation => 
      conversation.participants.includes(currentUser.email)
    );
  } catch (error) {
    console.error('Error parsing conversations:', error);
    return [];
  }
};

// Get a specific conversation by ID
export const getConversation = (conversationId: string): Conversation | null => {
  const conversations = getConversations();
  return conversations.find(conversation => conversation.id === conversationId) || null;
};

// Get a conversation with a specific participant
export const getConversationWithParticipant = (participantId: string): Conversation | null => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return null;
  }
  
  const conversations = getConversations();
  return conversations.find(conversation => 
    conversation.participants.includes(currentUser.email) && 
    conversation.participants.includes(participantId)
  ) || null;
};

// Send a new message in a conversation
export const sendMessage = (conversationId: string, content: string): Conversation | null => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return null;
  }
  
  const conversations = getConversations();
  const conversationIndex = conversations.findIndex(c => c.id === conversationId);
  
  if (conversationIndex === -1) {
    return null;
  }
  
  const conversation = conversations[conversationIndex];
  const receiverId = conversation.participants.find(p => p !== currentUser.email) || '';
  
  const newMessage: Message = {
    id: generateId(),
    senderId: currentUser.email,
    receiverId,
    content,
    timestamp: Date.now(),
    read: false
  };
  
  // Add message to conversation
  conversation.messages.push(newMessage);
  conversation.lastMessage = newMessage;
  
  // Update in storage
  localStorage.setItem('conversations', JSON.stringify(conversations));
  
  return conversation;
};

// Start a new conversation with a parent
export const startConversation = (participantId: string, content: string): Conversation | null => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return null;
  }
  
  // Check if a conversation already exists
  const existingConversation = getConversationWithParticipant(participantId);
  if (existingConversation) {
    return sendMessage(existingConversation.id, content) ? existingConversation : null;
  }
  
  // Create new conversation
  const newMessage: Message = {
    id: generateId(),
    senderId: currentUser.email,
    receiverId: participantId,
    content,
    timestamp: Date.now(),
    read: false
  };
  
  const newConversation: Conversation = {
    id: generateId(),
    participants: [currentUser.email, participantId],
    messages: [newMessage],
    lastMessage: newMessage
  };
  
  // Get existing conversations and add new one
  const conversations = getConversations();
  conversations.push(newConversation);
  
  // Update in storage
  localStorage.setItem('conversations', JSON.stringify(conversations));
  
  return newConversation;
};

// Mark all messages in a conversation as read
export const markConversationAsRead = (conversationId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return false;
  }
  
  const conversations = getConversations();
  const conversationIndex = conversations.findIndex(c => c.id === conversationId);
  
  if (conversationIndex === -1) {
    return false;
  }
  
  const conversation = conversations[conversationIndex];
  let updated = false;
  
  // Mark all messages sent to current user as read
  conversation.messages.forEach(message => {
    if (message.receiverId === currentUser.email && !message.read) {
      message.read = true;
      updated = true;
    }
  });
  
  if (updated) {
    // Update in storage
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }
  
  return updated;
};

// Get the number of unread messages for the current user
export const getUnreadMessageCount = (): number => {
  const conversations = getConversations();
  const currentUser = getCurrentUser();
  
  if (!currentUser || !currentUser.email) {
    return 0;
  }
  
  return conversations.reduce((count, conversation) => {
    const unreadInConversation = conversation.messages.filter(
      message => message.receiverId === currentUser.email && !message.read
    ).length;
    
    return count + unreadInConversation;
  }, 0);
};

// Get parent info by email
export const getParentByEmail = (email: string) => {
  if (!email) return null;
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === email) {
    return currentUser;
  }
  
  const sampleParents = getSampleParents();
  return sampleParents.find(parent => parent.email === email) || null;
};