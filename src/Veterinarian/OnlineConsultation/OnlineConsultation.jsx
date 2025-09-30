import React, { useState, useEffect, useContext } from 'react';
import { FaTimes } from 'react-icons/fa';
import './OnlineConsultation.css';
import axios from 'axios';
import { UserContext } from '../../hook/authContext';
import JitsiWrapper from './componentVet/jitsiApiVet';

const VetConsultationAdmin = () => {
  const [filter, setFilter] = useState('all');
  const [activeChatId, setActiveChatId] = useState(null);
  const [fetchOC, setFetchOC] = useState([]);
  const [inCall, setInCall] = useState(false);
  const { user, tokenData } = useContext(UserContext);

  const fetchOnlineConsult = async () => {
    try {
      const res = await axios.get("http://localhost:5000/online_consult_fetch");
      setFetchOC(res.data.fetchData);
    } catch (err) {
      console.error("Error fetching consultations:", err);
    }
  };

  const handleCallNow = (id) => {
    setActiveChatId(id);
    setInCall(true);
    sessionStorage.setItem("inCalling", true);
    sessionStorage.setItem("ConsultId", id);
  };

  const handleCloseCall = () => {
    sessionStorage.removeItem('inCalling');
    sessionStorage.removeItem('ConsultId');
    setInCall(false);
    setActiveChatId(null);
    fetchOnlineConsult()
  };

  useEffect(() => {
    const isOnCalling = sessionStorage.getItem('inCalling');
    const ConsultID = sessionStorage.getItem("ConsultId");
    if (isOnCalling && ConsultID) {
      setInCall(true);
      setActiveChatId(ConsultID);
    }
    fetchOnlineConsult()
  }, []);

  useEffect(() => {
    fetchOnlineConsult();
    console.log(tokenData);
  }, []);

  const filteredRequests = fetchOC.filter(req => {
    if (filter === 'all') return true;
    return req.consultationType === filter;
  });

  return (
    <div className="vet-admin-container">
      <h2>Vet Consultation Requests</h2>

      {!inCall ? (
        <>
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
                <button className="accommodate-btn" onClick={() => handleCallNow(req.channelConsult)}>
                  Accommodate
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="video-call-overlay">
            <div className="video-call-header">
              <button onClick={handleCloseCall} className="close-call-btn">
                <FaTimes />
              </button>
            </div>

            <div className="video-call-body">
              <JitsiWrapper
                key={activeChatId}
                roomName={`vpaas-magic-cookie-d26ed00354e841dbabe6a987da039e25/${activeChatId}`}
                displayName={`${user.firstName} ${user.lastName}`}
                email={user.email}
                jwt={tokenData}
                onApiReady={(api) => {
                  console.log("Vet joined Jitsi", api);
                }}
                onCallEnd={handleCloseCall}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VetConsultationAdmin;
