import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import './OnlineConsultation.css';

const OnlineConsultation = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hello! Thank you for submitting your consultation request.' },
    { from: 'bot', text: 'Please wait while one of our licensed veterinarians reviews your concern.' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    setMessages([...messages, { from: 'user', text: message }]);
    setMessage('');
  };

  return (
    <div className="consultation-container">
      <h2>Online Consultation</h2>
      {!formSubmitted ? (
        <form className="consultation-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pet Name</label>
            <input type="text" required />
          </div>

          <div className="form-group">
            <label>Pet Type</label>
            <input type="text" required />
          </div>

          <div className="form-group">
            <label>Concern Description</label>
            <textarea required rows="4" placeholder="Describe your concern..."></textarea>
          </div>

          <div className="form-group">
            <label>Consultation Type</label>
            <select required>
              <option value="">Select type</option>
              <option value="regular">Regular</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

            <div className="form-group">
            <label>Where to Pay:</label>
            <div className="payment-instructions">
              <p><strong>GCash:</strong> 0917-123-4567 (PawCare Clinic)</p>
              <p><strong>Bank Transfer:</strong> BPI - Account No. 1234-5678-90</p>
              <p><strong>Note:</strong> Please include your name and pet's name in the reference.</p>
            </div>
          </div>


          <div className="form-group">
            <label>Payment Proof (Screenshot or Receipt)</label>
            <input type="file" accept="image/*,application/pdf" required />
          </div>

        
          <div className="form-group full-width">
            <button className="user-dashboard-primary-btn" type="submit">
              Submit Consultation Request
            </button>
          </div>
        </form>
      ) : (
        <div className="chat-section">
          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message-wrapper ${msg.from}`}>
                <img
                  src={
                    msg.from === 'bot'
                      ? 'https://i.ibb.co/GtY8N6t/vet-avatar.png'
                      : 'https://i.ibb.co/YQhfXpq/user-avatar.png'
                  }
                  alt={msg.from}
                  className="chat-avatar"
                />
                <div className={`chat-message ${msg.from}`}>{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineConsultation;
