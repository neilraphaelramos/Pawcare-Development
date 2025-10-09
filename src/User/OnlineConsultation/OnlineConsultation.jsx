import React, { useState, useContext, useEffect, useRef } from 'react';
import { FaPaperPlane, FaVideo, FaRegWindowClose } from 'react-icons/fa';
import './OnlineConsultation.css';
import { UserContext } from '../../hook/authContext';
import axios from 'axios';
import JitsiWrapper from './component/jitsiApi';
import { io } from 'socket.io-client';

const OnlineConsultation = () => {
  const { user } = useContext(UserContext);

  const fullName = {
    first: user.firstName,
    middle: user.middleName,
    last: user.lastName,
    suffix: user.suffix,
  };

  const processName = Object.values(fullName).filter(Boolean).join(" ");

  const [fillUp, setFillUp] = useState({
    owner_name: processName,
    pet_name: "",
    pet_type: "",
    concern_description: "",
    consult_type: "",
    file_payment: '',
  });


  const [formSubmitted, setFormSubmitted] = useState(false);
  const [startCall, setStartCall] = useState(false);
  const [channelConsultID, setChannelConsultID] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hello! Thank you for submitting your consultation request.' },
    { from: 'bot', text: 'Please wait while one of our licensed veterinarians reviews your concern.' },
  ]);

  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  const handleInputChange = (e) => {
    setFillUp({ ...fillUp, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFillUp((prev) => ({
        ...prev,
        file_payment: file,
      }));
    }
  };

  const handleOpenCall = () => {
    if (!channelConsultID) return; // safety check
    setStartCall(true);
    sessionStorage.setItem("startCall", JSON.stringify(true));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("owner_name", fillUp.owner_name);
      formData.append("pet_name", fillUp.pet_name);
      formData.append("pet_type", fillUp.pet_type);
      formData.append("concern_description", fillUp.concern_description);
      formData.append("consult_type", fillUp.consult_type);
      formData.append("file_payment", fillUp.file_payment);

      const res = await axios.post("http://localhost:5000/online_consult", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data.success) {
        setFormSubmitted(false);
      } else {
        alert(res.data.message);
        const consultID = res.data.channel_consult_ID;
        setChannelConsultID(consultID);
        setFormSubmitted(true);

        // store in session but DO NOT auto-start call
        sessionStorage.setItem("channelConsultID", consultID);
        sessionStorage.setItem("isSubmitted", JSON.stringify(true));
        sessionStorage.setItem("startCall", JSON.stringify(false));
      }
    } catch (err) {
      console.error("Error requesting consultation:", err);
    }
  };

  useEffect(() => {
    const dataConsult = sessionStorage.getItem("channelConsultID");
    const isSubmitted = JSON.parse(sessionStorage.getItem('isSubmitted') || 'false');
    const dataSetCall = JSON.parse(sessionStorage.getItem('startCall') || 'false');
    setChannelConsultID(dataConsult);
    setFormSubmitted(isSubmitted);
    setStartCall(dataSetCall);
  }, []);

  const handleCloseCall = () => {
    sessionStorage.removeItem("channelConsultID");
    sessionStorage.removeItem("isSubmitted");
    sessionStorage.removeItem("startCall");

    setChannelConsultID(null);
    setStartCall(false);
    setFormSubmitted(false);
    setMessages([
      { from: 'bot', text: '👋 Hello! Thank you for submitting your consultation request.' },
      { from: 'bot', text: 'Please wait while one of our licensed veterinarians reviews your concern.' },
    ]);
    setMessage('');
  };

  const handleSendMessage = () => {
    if (message.trim() === '' || !socketRef.current) return;

    const msgObj = { from: 'user', text: message };
    socketRef.current.emit('sendMessage', { consultID: channelConsultID, ...msgObj });
    setMessages((prev) => [...prev, msgObj]);
    setMessage('');
  };

  // Auto-scroll to newest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!channelConsultID) return;

    console.log('[Socket] Initializing connection...');

    socketRef.current = io('http://localhost:5001', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected with ID:', socketRef.current.id);

      socketRef.current.emit('joinConsult', {
        consultID: channelConsultID,
        userType: 'user',
      });
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    socketRef.current.on('receiveMessage', (msg) => {
      console.log('[Socket] Received message:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on('systemMessage', (msg) => {
      console.log('[Socket] System message:', msg);
      setMessages((prev) => [...prev, { from: 'bot', text: msg }]);
    });

    return () => {
      if (socketRef.current) {
        console.log('[Socket] Disconnecting...');
        socketRef.current.disconnect();
      }
    };
  }, [channelConsultID]);

  return (
    <div className="consultation-container">
      <h2>Online Consultation</h2>

      {!formSubmitted ? (
        <form className="consultation-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pet Name</label>
            <input name='pet_name' type="text" onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Pet Type</label>
            <input name='pet_type' type="text" onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Concern Description</label>
            <textarea
              name='concern_description'
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Describe your concern..."
            ></textarea>
          </div>

          <div className="form-group">
            <label>Consultation Type</label>
            <select name='consult_type' onChange={handleInputChange} required>
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
            <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} required />
          </div>

          <div className="form-group full-width">
            <button className="user-dashboard-primary-btn" type="submit">Submit Consultation Request</button>
          </div>
        </form>
      ) : (
        <>
          <div className='box-close-call'>
            <FaRegWindowClose className='btn-close-call' onClick={handleCloseCall} />
          </div>

          {!startCall ? (
            <div className="chat-section">
              <div className="chat-box">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message-wrapper ${msg.from}`}>
                    <img
                      src={msg.from === 'user'
                        ? `data:image/png;base64,${user.pic}`
                        : 'https://i.ibb.co/GtY8N6t/vet-avatar.png'
                      }
                      alt={msg.from}
                      className="chat-avatar"
                    />
                    <div className={`chat-message ${msg.from}`}>{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-row">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}><FaPaperPlane /></button>
                <button className="call-btn" onClick={handleOpenCall}><FaVideo /></button>
              </div>
            </div>
          ) : (
            <JitsiWrapper
              roomName={`vpaas-magic-cookie-d26ed00354e841dbabe6a987da039e25/${channelConsultID}`}
              displayName={processName}
              email={user.email}
              onApiReady={(api) => {
                console.log("Jitsi API Ready", api);
                api.executeCommand("sendChatMessage", "👋 Hello doctor!");
                api.addEventListener("incomingMessage", (event) => {
                  setMessages((prev) => [...prev, { from: "bot", text: event.message }]);
                });
                api.addEventListener("videoConferenceLeft", () => {
                  console.log("Jitsi call ended");
                  setStartCall(false); // go back to chat
                  sessionStorage.setItem("startCall", JSON.stringify(false));
                });
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OnlineConsultation;
