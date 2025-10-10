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
        webhookUrl: 'https://ferri.app.n8n.cloud/webhook/3f1c6ea7-de27-4c34-b9e2-fa5409b800fd/chat',
        initialMessages: [
          'Halo! 👋 Selamat datang di DERMA-DFU.ID',
          'Saya adalah asisten virtual yang siap membantu Anda dengan informasi seputar:',
          '• Perawatan luka kaki diabetik (Diabetic Foot Ulcer)',
          '• Produk medis dan alat kesehatan',
          '• Layanan teledermatologi',
          '• Informasi kemitraan',
          '',
          'Silakan tanyakan apa yang ingin Anda ketahui! 😊'
        ],
        chatWindowOptions: {
          title: 'DERMA-DFU Assistant',
          subtitle: 'Asisten Virtual Perawatan Luka Diabetik',
          primaryColor: '#e8a8c0',
          backgroundColor: '#ffffff',
          fontSize: '14px',
          borderRadius: '1rem'
        },
        chatButtonOptions: {
          backgroundColor: '#8fc7ea',
          iconColor: '#ffffff',
          borderRadius: '50%',
          size: '60px'
        }
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
