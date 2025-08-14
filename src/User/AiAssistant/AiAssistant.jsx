import React, { useState } from "react";
import "./AiAssistant.css";

const frequentQuestions = [
  {
    question: "Why is my dog vomiting?",
    answer:
      "Vomiting in dogs can be caused by various issues such as dietary indiscretion, infections, parasites, or more serious conditions. If it persists, please consult a veterinarian."
  },
  {
    question: "Can my cat be vaccinated today?",
    answer:
      "Yes, cats can be vaccinated as long as they are healthy. It's best to have a vet check them first to confirm there's no underlying issue."
  },
  {
    question: "How often should I deworm my pet?",
    answer:
      "Most pets should be dewormed every 3 months, but frequency can vary based on age, lifestyle, and local risks. Consult your vet for a tailored plan."
  }
];

const AiChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I’m your AI vet assistant. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    const userMessage = { sender: "user", text: input };
    const aiResponse = {
      sender: "ai",
      text:
        "Thanks for your question! I'm analyzing it and will get back to you shortly. 😊"
    };
    setMessages([...messages, userMessage, aiResponse]);
    setInput("");
  };

  const handleQuestionClick = (q) => {
    const userMessage = { sender: "user", text: q.question };
    const aiMessage = { sender: "ai", text: q.answer };
    setMessages([...messages, userMessage, aiMessage]);
  };

  return (
    <div className="ai-chatbox-container">
      <div className="ai-chatbox-header">
        <span>🐾 AI Vet Assistant</span>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="ai-chatbox-body">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`ai-message ${msg.sender === "ai" ? "ai" : "user"}`}
          >
            {msg.text}
          </div>
        ))}

        <div className="ai-faq-suggestions">
          <p className="faq-title">💡 Common Questions:</p>
          {frequentQuestions.map((q, i) => (
            <button key={i} onClick={() => handleQuestionClick(q)}>
              {q.question}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-chatbox-footer">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default AiChatBox;
