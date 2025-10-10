import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ChatWidget = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Don't load chat on admin pages
    if (isAdminPage) return;

    // Add custom CSS for n8n chat styling
    const style = document.createElement('style');
    style.innerHTML = `
      /* Override n8n chat styles to match website theme */
      #n8n-chat {
        --chat--color--primary: #8fc7ea !important;
        --chat--color--primary-shade-50: #e8a8c0 !important;
        --chat--color--secondary: #e8a8c0 !important;
        --chat--color--white: #ffffff !important;
        --chat--color--light: #f5f5f5 !important;
        --chat--color--light-shade-50: #e0e0e0 !important;
        --chat--color--medium: #666666 !important;
        --chat--color--dark: #1a2332 !important;
        --chat--border-radius: 1rem !important;
        --chat--spacing: 1rem !important;
        --chat--font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
      }
      
      /* Style the chat button */
      .n8n-chat-button {
        background: linear-gradient(135deg, #8fc7ea 0%, #e8a8c0 100%) !important;
        box-shadow: 0 4px 12px rgba(143, 199, 234, 0.3) !important;
        border: none !important;
        width: 60px !important;
        height: 60px !important;
        border-radius: 50% !important;
        transition: all 0.3s ease !important;
      }
      
      .n8n-chat-button:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 6px 20px rgba(143, 199, 234, 0.5) !important;
      }
      
      /* Style the chat window header */
      .n8n-chat .chat-window-header {
        background: linear-gradient(135deg, #1a2332 0%, #2a3f5f 100%) !important;
        color: white !important;
        border-radius: 1rem 1rem 0 0 !important;
      }
      
      /* Style messages */
      .n8n-chat .chat-message-from-bot {
        background-color: #f5f8fa !important;
        border: 1px solid #8fc7ea !important;
        border-radius: 1rem !important;
        color: #1a2332 !important;
      }
      
      .n8n-chat .chat-message-from-user {
        background: linear-gradient(135deg, #8fc7ea 0%, #e8a8c0 100%) !important;
        color: white !important;
        border-radius: 1rem !important;
      }
      
      /* Style input */
      .n8n-chat .chat-input {
        border: 2px solid #8fc7ea !important;
        border-radius: 1rem !important;
        font-family: 'Inter', sans-serif !important;
      }
      
      .n8n-chat .chat-input:focus {
        border-color: #e8a8c0 !important;
        box-shadow: 0 0 0 3px rgba(232, 168, 192, 0.1) !important;
      }
      
      /* Style send button */
      .n8n-chat .chat-input-send-button {
        background: linear-gradient(135deg, #8fc7ea 0%, #e8a8c0 100%) !important;
        border-radius: 0.5rem !important;
      }
    `;
    document.head.appendChild(style);

    // Load the n8n chat script
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      createChat({
        webhookUrl: 'https://ferri.app.n8n.cloud/webhook/3f1c6ea7-de27-4c34-b9e2-fa5409b800fd/chat',
        webhookConfig: {
          method: 'POST',
          headers: {}
        },
        target: '#n8n-chat',
        mode: 'window',
        chatInputKey: 'chatInput',
        chatSessionKey: 'sessionId',
        loadPreviousSession: true,
        metadata: {},
        showWelcomeScreen: false,
        defaultLanguage: 'id',
        initialMessages: [
          'Halo! 👋 Selamat datang di DERMA-DFU.ID',
          'Kami siap membantu Anda 24/7 dengan informasi seputar:',
          '• Perawatan luka kaki diabetik (Diabetic Foot Ulcer)',
          '• Produk medis dan alat kesehatan',
          '• Layanan teledermatologi',
          '• Informasi kemitraan',
          '',
          'Silakan tanyakan apa yang ingin Anda ketahui!'
        ],
        i18n: {
          id: {
            title: 'DERMA-DFU Assistant 👋',
            subtitle: "Kami siap membantu Anda 24/7",
            footer: '',
            getStarted: 'Mulai Percakapan Baru',
            inputPlaceholder: 'Ketik pertanyaan Anda...',
          },
          en: {
            title: 'DERMA-DFU Assistant 👋',
            subtitle: "We're here to help you 24/7",
            footer: '',
            getStarted: 'New Conversation',
            inputPlaceholder: 'Type your question..',
          },
        },
        enableStreaming: false,
      });
    `;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [isAdminPage]);

  // Render the target div for n8n chat
  if (isAdminPage) return null;
  
  return <div id="n8n-chat" />;
};

export default ChatWidget;
