import React, { useState } from 'react';
import { FaPlus, FaRegEye } from 'react-icons/fa';
import petsData from '../../data/petsData.json';
import './PetRecords.css';

export default function PetRecords() {
  const [pets] = useState(petsData);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [selectedVisit, setSelectedVisit] = useState(null);

  const handleView = (pet) => setSelectedPet(pet);
  const handleCloseModal = () => {
    setSelectedPet(null);
    setModalSearchTerm('');
  };

  const filteredPets = pets.filter((pet) => {
    const term = searchTerm.toLowerCase();
    return (
      pet.ownerName.toLowerCase().includes(term) ||
      pet.name.toLowerCase().includes(term) ||
      pet.species.toLowerCase().includes(term) ||
      pet.gender.toLowerCase().includes(term) ||
      pet.condition.toLowerCase().includes(term) ||
      pet.diagnosis.toLowerCase().includes(term) ||
      pet.lastVisit.toLowerCase().includes(term)
    );
  });

  const filterCheckups = (checkups) => {
    const term = modalSearchTerm.toLowerCase();
    return checkups.filter((visit) =>
      [visit.day, visit.date, visit.service, visit.complaint, visit.diagnosis, visit.status, visit.completed]
        .some((field) => field.toLowerCase().includes(term))
    );
  };

  return (
    <div className="pet-records-wrapper">
      <h2 className="pet-records-title">Pet Medical History</h2>

      <div className="pet-records-toolbar">
        <div className="pet-records-left-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

   <div className="pet-records-table">
  <div className="pet-records-header">
    <div>Owner Name</div>
    <div>Photo</div>
    <div>Name</div>
    <div>Species</div>
    <div>Age</div>
    <div>Gender</div>
    <div>Condition</div>
    <div>Last Visit</div>
    <div>Diagnosis</div>
    <div>Action</div>
  </div>

  {filteredPets.map((pet) => (
    <div className="pet-records-row" key={pet.id}>
      <div>{pet.ownerName}</div> 
      <div>
        <img src={pet.photo} alt={pet.name} className="pet-thumb" />
      </div>
      <div>{pet.name}</div>
      <div>{pet.species}</div>
      <div>{pet.age} yrs</div>
      <div>{pet.gender}</div>
      <div>{pet.condition}</div>
      <div>{pet.lastVisit}</div>
      <div className="diagnosis-text">
        {pet.diagnosis.length > 30 ? pet.diagnosis.slice(0, 30) + '…' : pet.diagnosis}
      </div>
      <div>
        <button
          className="aksi-btn"
          title="View Record"
          onClick={() => handleView(pet)}
        >
          <FaRegEye size={16} />
        </button>
      </div>
    </div>
  ))}
</div>


      {/* Visit History Modal */}
      {selectedPet && (
        <div className="pet-modal-overlay">
          <div className="pet-modal">
            <button className="close-btn" onClick={handleCloseModal}>×</button>
            <h3>{selectedPet.name}'s Visit History</h3>

            <input
              type="text"
              className="modal-search-input"
              placeholder="Search visit history..."
              value={modalSearchTerm}
              onChange={(e) => setModalSearchTerm(e.target.value)}
            />

            {selectedPet.checkups?.length > 0 ? (
              <div className="checkup-history-row-style">
                {filterCheckups(selectedPet.checkups).map((visit, i) => (
                  <div key={i} className="checkup-card-wide">
                    <div className="checkup-col">
                      <p className="checkup-label">Date</p>
                      <strong>{visit.day}</strong>
                      <span>{visit.date}</span>
                    </div>
                    <div className="checkup-col">
                      <p className="checkup-label">Service Type</p>
                      <p>{visit.service}</p>
                    </div>
                    <div className="checkup-col">
                      <p className="checkup-label">Main Complaint</p>
                      <p>{visit.complaint}</p>
                    </div>
                    <div className="checkup-col">
                      <p className="checkup-label">Diagnosis</p>
                      <p>{visit.diagnosis}</p>
                    </div>
                    <div className="checkup-col">
                      <p className="checkup-label">Treatment Status</p>
                      <p>{visit.status}</p>
                    </div>
                    <div className="checkup-col">
                      <p className="checkup-label">Completed On</p>
                      <p>{visit.completed}</p>
                    </div>
                    <div className="checkup-col action-col">
                      <p className="checkup-label">Action</p>
                      <button
                        className="aksi-btn"
                        title="View Full Details"
                        onClick={() => setSelectedVisit(visit)}
                      >
                        <FaRegEye size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No visit records found.</p>
            )}
          </div>
        </div>
      )}

      {/* Full Visit Detail Modal (Printable) */}
{selectedVisit && (
  <div className="visit-detail-modal-overlay">
    <div className="visit-detail-modal">
      <button className="close-btn" onClick={() => setSelectedVisit(null)}>×</button>
      <button className="print-btn" onClick={() => window.print()}>Print</button>

      <div className="visit-detail-content scrollable-print">
        {/* Printable Header */}
        <div className="mr-header-section">
          <img src="/images/LandingPage/rivera-logo.png" alt="Clinic Logo" className="mr-clinic-logo" />
          <div className="mr-clinic-details">
            <h1>PetCare Animal Clinic</h1>
            <p>123 Veterinary Street, Bocaue, Bulacan</p>
            <p>Contact: (044) 123-4567 | Email: petcare@clinic.com</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Patient Medical Summary */}
        <h2 className="section-title">Patient Medical Summary</h2>
       
        <div className="detail-field">
          <div className="detail-label">Pet Name:</div>
          <div className="detail-value">{selectedPet.name}</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Owner Name:</div>
          <div className="detail-value">{selectedPet.ownerName}</div>
        </div>
          <div className="detail-field">
          <div className="detail-label">Species:</div>
          <div className="detail-value">{selectedPet.species}</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Owner Address:</div>
          <div className="detail-value">{selectedPet.ownerAddress}</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Age:</div>
          <div className="detail-value">{selectedPet.age}</div>
        </div>
         <div className="detail-field">
          <div className="detail-label">Owner Phone Number:</div>
          <div className="detail-value">{selectedPet.ownerPhoneNum}</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Diagnosis:</div>
          <div className="detail-value">{selectedVisit.diagnosis}</div>
        </div>
         <div className="detail-field">
          <div className="detail-label">Owner Email:</div>
          <div className="detail-value">{selectedPet.ownerEmail}</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Date Admitted:</div>
          <div className="detail-value">{selectedVisit.admittedDate || 'N/A'}</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Date Discharged:</div>
          <div className="detail-value">{selectedVisit.completed}</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Patient Status:</div>
          <div className="detail-value">{selectedVisit.status}</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Nursing Issues:</div>
          <div className="detail-value">Acute/Chronic Pain, Hyperthermia, Nausea</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Care Plan:</div>
          <div className="detail-value">Monitor Vital Signs, Wound Care, Interventions</div>
        </div>

        {/* Medical Assessment */}
        <h2 className="section-title">Medical Assessment</h2>
        <div className="detail-field">
          <div className="detail-label">Main Complaint:</div>
          <div className="detail-value">{selectedVisit.complaint}</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Additional Complaints:</div>
          <div className="detail-value">None Reported</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Weight:</div>
          <div className="detail-value">65 kg</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Height:</div>
          <div className="detail-value">160 cm</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">BMI:</div>
          <div className="detail-value">25.4 (Normal)</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Blood Pressure:</div>
          <div className="detail-value">120/80 mmHg</div>
        </div>
        <div className="detail-field">
          <div className="detail-label">Pulse:</div>
          <div className="detail-value">75 bpm</div>
        </div>

        {/* Prescriptions */}
        <h2 className="section-title">Prescriptions</h2>
        <div className="detail-field">
          <div className="detail-label">Medications:</div>
          <div className="detail-value">
            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
              <li>Paracetamol 500mg – 3× daily after meals</li>
              <li>Oral Rehydration Salts – as needed</li>
            </ul>
          </div>
        </div>

        {/* Signature */}
        <div className="signature-block">
          <div className="signature-line"></div>
          <div className="signature-caption">Veterinarian: Dr. Angela Rivera</div>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
}
