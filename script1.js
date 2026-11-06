
    /* Chatbot Interactive Logic */
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotBox = document.getElementById('chatbotBox');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');

    if (chatbotToggle && chatbotBox && chatbotClose) {
      chatbotToggle.addEventListener('click', () => {
        chatbotBox.classList.toggle('active');
        if (chatbotBox.classList.contains('active')) {
          chatbotInput.focus();
        }
      });

      chatbotClose.addEventListener('click', () => {
        chatbotBox.classList.remove('active');
      });

      function addChatMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.textContent = text;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }

      function getBotResponse(input) {
        const query = input.toLowerCase();
        if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
          return "Hello! How can I assist with your development project?";
        } else if (query.includes('service') || query.includes('Service')) {
          return "We offer mission control,disaster, mission.";
        } else if (query.includes('About') || query.includes('about')) {
          return "This website is about disasters management,and space technology.";
        }
         else if (query.includes('Contact') || query.includes('contact')) {
          return "You can contact on 'aerospacecodex@gmail.com'";
        }
  else if (query.includes('Team') || query.includes('team')) {
          return "The team include Ravi Yadav, Himanshu Yadav, Shreyash Gautam";
        }
          else if (query.includes('Project') || query.includes('project')) {
          return "The project are as follow: Cartosat Series, Oceansat-3 (EOS-06), EOS-04 (RISAT-1A),etc";

        }
          else if (query.includes('Thank you') || query.includes('thanks') || query.includes('thank you') || query.includes('Thanks')) {
          return "Thanks for exploring, see you soon";
        }
          else if (query.includes('') || query.includes('')) {
          return "";
        }
          else if (query.includes('') || query.includes('')) {
          return "";
        }
          else if (query.includes('') || query.includes('')) {
          return "";
        }
          else if (query.includes('') || query.includes('')) {
          return "";
        }
          else if (query.includes('') || query.includes('')) {
          return "";
        }
          else if (query.includes('') || query.includes('')) {
          return "";
        }
        return "Thanks for reaching out! Our team is available 24/7 for deeper assistance.";
      }

      function handleSend() {
        const text = chatbotInput.value.trim();
        if (!text) return;

        addChatMessage(text, 'user');
        chatbotInput.value = '';

        setTimeout(() => {
          const response = getBotResponse(text);
          addChatMessage(response, 'bot');
        }, 600);
      }

      chatbotSend.addEventListener('click', handleSend);
      chatbotInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }
     