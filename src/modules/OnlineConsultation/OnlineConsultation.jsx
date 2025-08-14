import React, { useState } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import './OnlineConsultation.css';

const vetSampleRequests = [
  {
    id: 1,
    petName: 'Fluffy',
    petType: 'Cat',
    concern: 'Limping on back leg for 2 days',
    consultationType: 'urgent',
    ownerName: 'Alice',
    paymentProof: 'https://example.com/payment1.pdf'
  },
  {
    id: 2,
    petName: 'Barky',
    petType: 'Dog',
    concern: 'Loss of appetite',
    consultationType: 'regular',
    ownerName: 'Bob',
    paymentProof: 'https://example.com/payment2.pdf'
  },
  {
    id: 3,
    petName: 'Nibbles',
    petType: 'Rabbit',
    concern: 'Skin rash near ears',
    consultationType: 'urgent',
    ownerName: 'Charlie',
    paymentProof: 'https://example.com/payment3.pdf'
  },
];

const VetConsultationAdmin = () => {
  const [filter, setFilter] = useState('all');
  const [activeChatId, setActiveChatId] = useState(null);
  const [chats, setChats] = useState({});
  const [inputMessage, setInputMessage] = useState('');

  const filteredRequests = vetSampleRequests.filter(req => {
    if (filter === 'all') return true;
    return req.consultationType === filter;
  });

  const startChat = (id) => {
    setActiveChatId(id);
    if (!chats[id]) {
      setChats(prev => ({
        ...prev,
        [id]: [
          { from: 'bot', text: `You started consultation with ${vetSampleRequests.find(r => r.id === id).ownerName}.` }
        ]
      }));
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    setChats(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), { from: 'vet', text: inputMessage.trim() }]
    }));
    setInputMessage('');

    setTimeout(() => {
      setChats(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), { from: 'client', text: 'Thanks for your message, vet!' }]
      }));
    }, 1500);
  };

  return (
    <div className="vet-admin-container">
      <h2>Vet Consultation Requests</h2>

      <div className="filter-buttons">
        <button className={filter === 'all' ? 'active-filter' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'urgent' ? 'active-filter' : ''} onClick={() => setFilter('urgent')}>Urgent</button>
        <button className={filter === 'regular' ? 'active-filter' : ''} onClick={() => setFilter('regular')}>Regular</button>
      </div>

      <div className="requests-list">
        {filteredRequests.map((req) => (
          <div key={req.id} className={`request-card ${req.consultationType}`}>
            <h3>{req.petName} ({req.petType})</h3>
            <p><strong>Owner:</strong> {req.ownerName}</p>
            <p><strong>Pet Name:</strong> {req.petName}</p>
            <p><strong>Pet Type:</strong> {req.petType}</p>
            <p><strong>Payment Proof:</strong> <a href={req.paymentProof} target="_blank" rel="noopener noreferrer">View File</a></p>
            <p><strong>Concern:</strong> {req.concern}</p>
            <p><strong>Type:</strong> {req.consultationType}</p>
            <button className="accommodate-btn" onClick={() => startChat(req.id)}>
              Accommodate
            </button>
          </div>
        ))}
      </div>

      {activeChatId && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>Chat with {vetSampleRequests.find(r => r.id === activeChatId)?.ownerName}</h3>
            <button className="close-chat-btn" onClick={() => setActiveChatId(null)}>
              <FaTimes />
            </button>
          </div>

          <div className="chat-messages">
            {(chats[activeChatId] || []).map((msg, i) => (
              <div key={i} className={`chat-message ${msg.from === 'vet' ? 'from-vet' : 'from-client'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetConsultationAdmin;
