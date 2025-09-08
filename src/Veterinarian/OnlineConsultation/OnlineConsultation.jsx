import React, { useState, useEffect, useContext } from 'react';
import { FaTimes, FaPaperPlane, FaVideo } from 'react-icons/fa';
import './OnlineConsultation.css';
import axios from 'axios';
import { UserContext } from '../../hook/authContext';
import JitsiMeeting from './componentVet/jitsiApi';

const VetConsultationAdmin = () => {
  const [filter, setFilter] = useState('all');
  const [activeChatId, setActiveChatId] = useState(null);
  const [chats, setChats] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [fetchOC, setFetchOC] = useState([]);
  const [inCall, setInCall] = useState(false);
  const { user } = useContext(UserContext);

  const fetchOnlineConsult = async () => {
    try {
      const res = await axios.get("http://localhost:5000/online_consult_fetch");
      setFetchOC(res.data.fetchData);
    } catch (err) {
      console.error("Error fetching consultations:", err);
    }
  };

  useEffect(() => {
    fetchOnlineConsult();
  }, []);

  const filteredRequests = fetchOC.filter(req => {
    if (filter === 'all') return true;
    return req.consultationType === filter;
  });

  const startChat = (id) => {
    setActiveChatId(id);
    if (!chats[id]) {
      setChats(prev => ({
        ...prev,
        [id]: [
          { from: 'bot', text: `You started consultation with ${fetchOC.find(r => r.channelConsult === id)?.ownerName}.` }
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

    // simulate client response
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

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button className={filter === 'all' ? 'active-filter' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'urgent' ? 'active-filter' : ''} onClick={() => setFilter('urgent')}>Urgent</button>
        <button className={filter === 'regular' ? 'active-filter' : ''} onClick={() => setFilter('regular')}>Regular</button>
      </div>

      {/* Requests List */}
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
            <button className="accommodate-btn" onClick={() => startChat(req.channelConsult)}>
              Accommodate
            </button>
          </div>
        ))}
      </div>

      {/* Chat Panel */}
      {activeChatId && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>
              Chat with {fetchOC.find(r => r.channelConsult === activeChatId)?.ownerName}
            </h3>
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
            <button className="call-btn" onClick={() => setInCall(true)}>
              <FaVideo /> Start Call
            </button>
          </div>
        </div>
      )}

      {/* Jitsi Call Overlay */}
      {inCall && (
        <div className="video-call-overlay">
          <div className="video-call-header">
            <h3>Video Consultation</h3>
            <button onClick={() => setInCall(false)} className="close-call-btn">
              <FaTimes /> End Call
            </button>
          </div>

          <div className="video-call-body">
            <JitsiMeeting
              roomName={`Consult-${activeChatId}`}
              displayName={`${user.firstName} ${user.lastName}`}
              email={user.email}
              onApiReady={(api) => {
                console.log("Vet joined Jitsi", api);

                api.executeCommand("sendChatMessage", "👋 Hello, I’m your vet!");
                api.addEventListener("incomingMessage", (event) => {
                  setChats((prev) => ({
                    ...prev,
                    [activeChatId]: [...(prev[activeChatId] || []), { from: "client", text: event.message }]
                  }));
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VetConsultationAdmin;
