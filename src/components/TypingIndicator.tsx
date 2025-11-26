import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

interface TypingIndicatorHookProps {
  matchId: string;
  userEmail: string;
  isTyping: boolean;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
}

// Hook for typing detection functionality
export const useTypingIndicator = ({
  matchId,
  userEmail,
  isTyping: externalIsTyping,
  onTypingStart,
  onTypingEnd
}: TypingIndicatorHookProps) => {
  const [isTyping, setIsTyping] = useState(externalIsTyping);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external isTyping prop
  useEffect(() => {
    setIsTyping(externalIsTyping);
  }, [externalIsTyping]);

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTypingStart?.();
      sendTypingSignal(true);
    }

    // Clear existing timeout
    if (typingRef.current) {
      clearTimeout(typingRef.current);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);

    typingRef.current = timeout;
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onTypingEnd?.();
      sendTypingSignal(false);
    }

    if (typingRef.current) {
      clearTimeout(typingRef.current);
      typingRef.current = null;
    }
  };

  const sendTypingSignal = async (typing: boolean) => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Sending typing signal:', {
        matchId,
        userEmail,
        isTyping: typing,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send typing signal:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
      // Send final stop typing signal
      if (isTyping) {
        sendTypingSignal(false);
      }
    };
  }, []);

  return {
    isTyping,
    startTyping,
    stopTyping
  };
};

// Component for displaying typing animation
interface TypingAnimationProps {
  userEmail: string;
  className?: string;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  userEmail,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex -space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-muted-foreground">
        {userEmail.split('@')[0]} is typing...
      </span>
    </div>
  );
};

// Standalone TypingIndicator component for display only
interface TypingIndicatorDisplayProps {
  userEmail: string;
  isTyping: boolean;
  className?: string;
}

export const TypingIndicatorDisplay: React.FC<TypingIndicatorDisplayProps> = ({
  userEmail,
  isTyping,
  className = ''
}) => {
  if (!isTyping) return null;

  return <TypingAnimation userEmail={userEmail} className={className} />;
};

// Hook for input elements to detect typing
export const useTypingDetection = (
  inputElement: HTMLInputElement | HTMLTextAreaElement | null,
  onStartTyping: () => void,
  onStopTyping: () => void
) => {
  useEffect(() => {
    if (!inputElement) return;

    const handleInput = () => {
      onStartTyping();
    };

    const handleBlur = () => {
      onStopTyping();
    };

    inputElement.addEventListener('input', handleInput);
    inputElement.addEventListener('blur', handleBlur);

    return () => {
      inputElement.removeEventListener('input', handleInput);
      inputElement.removeEventListener('blur', handleBlur);
    };
  }, [inputElement, onStartTyping, onStopTyping]);
};

// Example usage component
interface MessageInputWithTypingProps {
  matchId: string;
  onSendMessage: (message: string) => void;
  placeholder?: string;
}

export const MessageInputWithTyping: React.FC<MessageInputWithTypingProps> = ({
  matchId,
  onSendMessage,
  placeholder = "Type a message..."
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isTyping, startTyping, stopTyping } = useTypingIndicator({
    matchId,
    userEmail: user?.email || '',
    isTyping: false
  });

  // Set up typing detection for the input
  useTypingDetection(inputRef.current, startTyping, stopTyping);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {/* Typing indicator would be displayed here by parent component */}
      {isTyping && <TypingIndicatorDisplay userEmail={user?.email || ''} isTyping={isTyping} />}
      
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// Main TypingIndicator component that combines everything
interface TypingIndicatorProps {
  matchId: string;
  userEmail: string;
  isTyping: boolean;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  showIndicator?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  matchId,
  userEmail,
  isTyping,
  onTypingStart,
  onTypingEnd,
  showIndicator = true
}) => {
  const { isTyping: internalIsTyping, startTyping, stopTyping } = useTypingIndicator({
    matchId,
    userEmail,
    isTyping,
    onTypingStart,
    onTypingEnd
  });

  return (
    <div>
      {showIndicator && internalIsTyping && (
        <TypingIndicatorDisplay userEmail={userEmail} isTyping={internalIsTyping} />
      )}
    </div>
  );
};

export default TypingIndicator;