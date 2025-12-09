import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ChatWidget = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const chatInitialized = useRef(false);

  useEffect(() => {
    // Don't load chat on admin pages
    if (isAdminPage) {
      chatInitialized.current = false;
      return;
    }

    // Prevent multiple initializations
    if (chatInitialized.current) return;
    chatInitialized.current = true;

    // Load the Estha AI chatbot script
    const script = document.createElement('script');
    script.id = 'chatbot-iframe';
    script.src = 'https://studio.estha.ai/iframe.js';
    script.setAttribute('data-bot-src', 'https://studio.estha.ai/app/693844e89d9a8a600ad72909');
    script.setAttribute('data-bot-width', '375px');
    script.setAttribute('data-bot-height', '667px');
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      if (isAdminPage) {
        const existingScript = document.getElementById('chatbot-iframe');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
        chatInitialized.current = false;
      }
    };
  }, [isAdminPage]);

  // Don't render anything on admin pages
  if (isAdminPage) return null;
  
  return null;
};

export default ChatWidget;
