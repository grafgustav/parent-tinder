// src/pages/messages/Messages.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  getConversations, 
  initializeConversations, 
  Conversation, 
  Message,
  getParentByEmail,
  markConversationAsRead,
  sendMessage
} from '../../services/messagingService';
import { getCurrentUser } from '../../services/matchingService';
import './Messages.css';

interface MessagesProps {
  navigateTo?: (page: string) => void;
}

const Messages: React.FC<MessagesProps> = ({ navigateTo }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    // Initialize sample conversations if needed
    initializeConversations();
    
    // Load conversations
    loadConversations();
    
    setIsLoading(false);
  }, []);
  
  const loadConversations = () => {
    const userConversations = getConversations();
    setConversations(userConversations);
    
    // Only update the selected conversation if we're sending a message
    // This way we avoid the infinite update loop from useEffect
  };
  
  // Effect for scrolling to bottom when messages change
  useEffect(() => {
    // Scroll to bottom of messages when conversation changes or new messages arrive
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages]);
  
  // Effect for marking conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      markConversationAsRead(selectedConversation.id);
      // After marking as read, we'll load the conversations without updating the selected conversation
      const userConversations = getConversations();
      setConversations(userConversations);
    }
  }, [selectedConversation?.id]);
  
  const handleSelectConversation = (conversation: Conversation) => {
    // If the clicked conversation is already selected, deselect it
    if (selectedConversation && selectedConversation.id === conversation.id) {
      setSelectedConversation(null);
    } else {
      setSelectedConversation(conversation);
    }
    // We removed loadConversations() call here to prevent race conditions
    // It will be called by the useEffect after selectedConversation state updates
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedConversation || !newMessage.trim()) {
      return;
    }
    
    // Send message
    sendMessage(selectedConversation.id, newMessage.trim());
    
    // Clear input
    setNewMessage('');
    
    // Reload conversations to update UI
    loadConversations();
    
    // Update the selected conversation with the latest messages
    const updatedConversations = getConversations();
    const updatedConversation = updatedConversations.find(c => c.id === selectedConversation.id);
    if (updatedConversation) {
      setSelectedConversation(updatedConversation);
    }
  };
  
  const getParticipantInfo = (conversation: Conversation) => {
    if (!currentUser) return { name: 'Unknown', photo: '' };
    
    const otherParticipantEmail = conversation.participants.find(
      email => email !== currentUser.email
    ) || '';
    
    const participant = getParentByEmail(otherParticipantEmail);
    
    if (!participant) {
      return {
        name: otherParticipantEmail.split('@')[0],
        photo: ''
      };
    }
    
    return {
      name: `${participant.firstName} ${participant.lastName}`,
      photo: participant.profileImage || ''
    };
  };
  
  const getUnreadCount = (conversation: Conversation) => {
    if (!currentUser) return 0;
    
    return conversation.messages.filter(
      message => message.receiverId === currentUser.email && !message.read
    ).length;
  };
  
  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if message is from today
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if message is from yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise, show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  const getMessageDateSeparator = (message: Message, index: number, messages: Message[]) => {
    const messageDate = new Date(message.timestamp).toDateString();
    
    if (index === 0) {
      return messageDate;
    }
    
    const prevMessageDate = new Date(messages[index - 1].timestamp).toDateString();
    if (messageDate !== prevMessageDate) {
      return messageDate;
    }
    
    return null;
  };
  
  if (isLoading) {
    return <div className="loading-messages">Loading conversations...</div>;
  }
  
  if (!currentUser) {
    return (
      <div className="no-profile-container">
        <h1>Messages</h1>
        <div className="no-profile-card">
          <h2>No Profile Found</h2>
          <p>Please complete your profile to message other parents.</p>
          <button 
            className="create-profile-btn"
            onClick={() => navigateTo && navigateTo('register')}
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="messages-container">
      <div className="conversations-sidebar">
        <div className="conversations-header">
          <h2>Messages</h2>
        </div>
        
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet</p>
            <p className="no-conversations-hint">
              Match with other parents to start chatting!
            </p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conversation) => {
              const participant = getParticipantInfo(conversation);
              const unreadCount = getUnreadCount(conversation);
              
              return (
                <div 
                  key={conversation.id} 
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''} ${unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="conversation-photo">
                    {participant.photo ? (
                      <img src={participant.photo} alt={participant.name} />
                    ) : (
                      <div className="conversation-initials">
                        {participant.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="conversation-info">
                    <div className="conversation-name">
                      {participant.name}
                    </div>
                    
                    {conversation.lastMessage && (
                      <div className="conversation-preview">
                        {conversation.lastMessage.senderId === currentUser.email ? (
                          <span className="preview-prefix">You: </span>
                        ) : null}
                        {conversation.lastMessage.content.length > 30 
                          ? conversation.lastMessage.content.substring(0, 30) + '...' 
                          : conversation.lastMessage.content}
                      </div>
                    )}
                  </div>
                  
                  <div className="conversation-meta">
                    {conversation.lastMessage && (
                      <div className="conversation-time">
                        {formatMessageTime(conversation.lastMessage.timestamp)}
                      </div>
                    )}
                    
                    {unreadCount > 0 && (
                      <div className="unread-badge">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="message-content">
        {!selectedConversation ? (
          <div className="no-conversation-selected">
            <div className="no-conversation-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list to start chatting</p>
          </div>
        ) : (
          <>
            <div className="message-header">
              <div className="message-participant">
                {(() => {
                  const participant = getParticipantInfo(selectedConversation);
                  return (
                    <>
                      <div className="participant-photo">
                        {participant.photo ? (
                          <img src={participant.photo} alt={participant.name} />
                        ) : (
                          <div className="participant-initials">
                            {participant.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="participant-name">
                        {participant.name}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="message-container" ref={messageContainerRef}>
              {selectedConversation.messages.map((message, index, messages) => {
                const isCurrentUser = message.senderId === currentUser?.email;
                const dateSeparator = getMessageDateSeparator(message, index, messages);
                
                return (
                  <React.Fragment key={message.id}>
                    {dateSeparator && (
                      <div className="message-date-separator">
                        <span>{new Date(message.timestamp).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                    
                    <div className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
                      <div className="message-bubble">
                        {message.content}
                        <div className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isCurrentUser && message.read && (
                            <span className="read-status">Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            
            <form className="message-input-container" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="message-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;