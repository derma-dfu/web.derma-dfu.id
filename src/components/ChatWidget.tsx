"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ChatWidget = () => {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    // Don't load chat on admin pages
    if (isAdminPage) {
      return;
    }

    // Check if script already exists
    const existingScript = document.getElementById('chatbot-iframe');
    if (existingScript) {
      return;
    }

    // Load the Estha AI chatbot script
    const script = document.createElement('script');
    script.id = 'chatbot-iframe';
    script.src = 'https://studio.estha.ai/iframe.js';
    script.setAttribute('data-bot-src', 'https://studio.estha.ai/app/693844e89d9a8a600ad72909');
    script.setAttribute('data-bot-width', '375px');
    script.setAttribute('data-bot-height', '667px');
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById('chatbot-iframe');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
      // Also remove any iframe that might have been created
      const chatbotIframes = document.querySelectorAll('iframe[src*="estha.ai"]');
      chatbotIframes.forEach(iframe => iframe.remove());
    };
  }, [isAdminPage]);

  // Don't render anything - the script handles everything
  if (isAdminPage) return null;

  return null;
};

export default ChatWidget;
