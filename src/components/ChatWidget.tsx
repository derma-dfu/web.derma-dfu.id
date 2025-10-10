import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ChatWidget = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Don't load chat on admin pages
    if (isAdminPage) return;

    // Load the n8n chat script
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      createChat({
        webhookUrl: 'https://ferri.app.n8n.cloud/webhook/3f1c6ea7-de27-4c34-b9e2-fa5409b800fd/chat'
      });
    `;
    document.body.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isAdminPage]);

  // Don't render anything, the n8n chat creates its own DOM elements
  return null;
};

export default ChatWidget;
