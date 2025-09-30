import React, { useState, useContext, useEffect } from 'react';
import { FaPaperPlane, FaVideo, FaRegWindowClose } from 'react-icons/fa';
import './OnlineConsultation.css';
import { UserContext } from '../../hook/authContext';
import axios from 'axios';
import JitsiWrapper from './component/jitsiApi'; // <-- we’ll create this file

const OnlineConsultation = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hello! Thank you for submitting your consultation request.' },
    { from: 'bot', text: 'Please wait while one of our licensed veterinarians reviews your concern.' }
  ]);
  const [channelConsultID, setChannelConsultID] = useState();
  const [startCall, setStartCall] = useState(false);

  const { user } = useContext(UserContext);

  const fullName = {
    first: user.firstName,
    middle: user.middleName,
    last: user.lastName,
    suffix: user.suffix
  };

  const processName = Object.values(fullName)
    .filter(Boolean)
    .join(" ");

  const [fillUp, setFillUp] = useState({
    owner_name: processName,
    pet_name: "",
    pet_type: "",
    concern_description: "",
    consult_type: "",
    file_payment: '',
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("owner_name", fillUp.owner_name);
      formData.append("pet_name", fillUp.pet_name);
      formData.append("pet_type", fillUp.pet_type);
      formData.append("concern_description", fillUp.concern_description);
      formData.append("consult_type", fillUp.consult_type);
      formData.append("file_payment", fillUp.file_payment); // now the raw File

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
        setStartCall(true);

        sessionStorage.setItem("channelConsultID", consultID);
        sessionStorage.setItem("isSubmitted", JSON.stringify(true));
        sessionStorage.setItem("startCall", JSON.stringify(true));
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
    setStartCall(dataSetCall);
    setFormSubmitted(isSubmitted);
  }, [])

  const handleCloseCall = () => {
    sessionStorage.removeItem("channelConsultID");
    sessionStorage.removeItem("isSubmitted");
    sessionStorage.removeItem("startCall");

    setChannelConsultID(null);
    setStartCall(false);
    setFormSubmitted(false);
  }

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
            <input
              name='pet_name'
              type="text"
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Pet Type</label>
            <input
              name='pet_type'
              onChange={handleInputChange}
              type="text"
              required
            />
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
            <select
              name='consult_type'
              onChange={handleInputChange}
              required
            >
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
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              required
            />
          </div>

          <div className="form-group full-width">
            <button className="user-dashboard-primary-btn" type="submit">
              Submit Consultation Request
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className='box-close-call'>
            <FaRegWindowClose className='btn-close-call' onClick={handleCloseCall} />
          </div>
          {startCall && (
            <JitsiWrapper
              roomName={`vpaas-magic-cookie-d26ed00354e841dbabe6a987da039e25/${channelConsultID}`}
              displayName={processName}
              email={user.email}
              onApiReady={(api) => {
                console.log("Jitsi API Ready", api);

                // Optional: Send welcome chat to vet
                api.executeCommand("sendChatMessage", "👋 Hello doctor!");
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OnlineConsultation;
