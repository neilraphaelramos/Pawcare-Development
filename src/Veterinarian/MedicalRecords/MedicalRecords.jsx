// PetRecords.jsx

import React, { useState } from 'react';
import { FaPlus, FaRegEye, FaEdit } from 'react-icons/fa';
import petsData from '../../data/petsData.json';
import './MedicalRecords.css';

export default function PetRecords() {
  const [pets, setPets] = useState(petsData);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [addingRecord, setAddingRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    day: '',
    date: '',
    service: '',
    complaint: '',
    diagnosis: '',
    status: '',
    completed: ''
  });

  const handleView = (pet) => setSelectedPet(pet);
  const handleCloseModal = () => {
    setSelectedPet(null);
    setModalSearchTerm('');
    setAddingRecord(false);
    setNewRecord({
      day: '',
      date: '',
      service: '',
      complaint: '',
      diagnosis: '',
      status: '',
      completed: ''
    });
  };

  const handleAddPet = (e) => {
    e.preventDefault();
    const form = e.target;
    const newPet = {
      id: Date.now(),
      ownerName: form.ownerName.value,
      name: form.name.value,
      species: form.species.value,
      age: form.age.value,
      gender: form.gender.value,
      condition: form.condition.value,
      lastVisit: form.lastVisit.value,
      diagnosis: form.diagnosis.value,
      photo: '/images/default-pet.png',
      checkups: []
    };
    setPets([...pets, newPet]);
    setShowAddPetModal(false);
    form.reset();
  };

  const handleEdit = (data) => {
    setEditData(data);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedPet = {
      ...editData,
      ownerName: form.ownerName.value,
      name: form.name.value,
      species: form.species.value,
      age: form.age.value,
      gender: form.gender.value,
      condition: form.condition.value,
      lastVisit: form.lastVisit.value,
      diagnosis: form.diagnosis.value
    };
    const updatedPets = pets.map((pet) =>
      pet.id === updatedPet.id ? updatedPet : pet
    );
    setPets(updatedPets);
    setShowEditModal(false);
    setEditData(null);
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

  const handleAddRecord = () => setAddingRecord(true);

  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const handleNewRecordSubmit = (e) => {
    e.preventDefault();
    const updatedPets = pets.map((pet) =>
      pet.id === selectedPet.id
        ? {
            ...pet,
            checkups: [...(pet.checkups || []), newRecord]
          }
        : pet
    );
    setPets(updatedPets);
    setSelectedPet((prev) => ({
      ...prev,
      checkups: [...(prev.checkups || []), newRecord]
    }));
    setNewRecord({
      day: '',
      date: '',
      service: '',
      complaint: '',
      diagnosis: '',
      status: '',
      completed: ''
    });
    setAddingRecord(false);
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
          <button className="add-btn" onClick={() => setShowAddPetModal(true)}>
            <FaPlus /> Add Pet
          </button>
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
            <div className="action-buttons">
              <button className="aksi-btn" title="View Record" onClick={() => handleView(pet)}>
                <FaRegEye size={16} />
              </button>
              <button className="aksi-btn" title="Edit Record" onClick={() => handleEdit(pet)}>
                <FaEdit size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPet && (
        <div className="pet-modal-overlay">
          <div className="pet-modal">
            <button className="close-btn" onClick={handleCloseModal}>×</button>
            <h3>{selectedPet.name}'s Visit History</h3>

            <div className="pet-modal-top-row">
              <input
                type="text"
                className="modal-search-input"
                placeholder="Search visit history..."
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
              />
              <button className="add-btn" onClick={handleAddRecord}>
                <FaPlus /> Add Record
              </button>
            </div>

            {addingRecord && (
              <form className="new-record-form" onSubmit={handleNewRecordSubmit}>
                <input type="text" name="day" placeholder="Day" value={newRecord.day} onChange={handleNewRecordChange} required />
                <input type="date" name="date" placeholder="Date" value={newRecord.date} onChange={handleNewRecordChange} required />
                <input type="text" name="service" placeholder="Service Type" value={newRecord.service} onChange={handleNewRecordChange} required />
                <input type="text" name="complaint" placeholder="Main Complaint" value={newRecord.complaint} onChange={handleNewRecordChange} required />
                <input type="text" name="diagnosis" placeholder="Diagnosis" value={newRecord.diagnosis} onChange={handleNewRecordChange} required />
                <input type="text" name="status" placeholder="Treatment Status" value={newRecord.status} onChange={handleNewRecordChange} required />
                <input type="date" name="completed" placeholder="Completed On" value={newRecord.completed} onChange={handleNewRecordChange} required />
                <button type="submit" className="submit-btn">Save</button>
              </form>
            )}

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
                      <button className="aksi-btn" onClick={() => setSelectedVisit(visit)}>
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

  {selectedVisit && (
  <div className="visit-detail-modal-overlay">
    <div className="visit-detail-modal">
      <button className="close-btn" onClick={() => setSelectedVisit(null)}>×</button>
      <button className="print-btn" onClick={() => window.print()}>Print</button>
      <div className="visit-detail-content scrollable-print">
        <div className="mr-header-section">
          <img src="/images/LandingPage/rivera-logo.png" alt="Clinic Logo" className="mr-clinic-logo" />
          <div className="mr-clinic-details">
            <h1>PetCare Animal Clinic</h1>
            <p>123 Veterinary Street, Bocaue, Bulacan</p>
            <p>Contact: (044) 123-4567 | Email: petcare@clinic.com</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <h2 className="section-title">Patient Medical Summary</h2>
        <div className="detail-field">
          <div className="detail-label">Pet Name:</div>
          <input
            type="text"
            value={selectedPet.name}
            disabled
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Species:</div>
          <input
            type="text"
            value={selectedPet.species}
            disabled
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Age:</div>
          <input
            type="number"
            value={selectedPet.age}
            disabled
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Diagnosis:</div>
          <input
            type="text"
            value={selectedVisit.diagnosis}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, diagnosis: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Date Admitted:</div>
          <input
            type="date"
            value={selectedVisit.admittedDate || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, admittedDate: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Date Discharged:</div>
          <input
            type="date"
            value={selectedVisit.completed}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, completed: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Patient Status:</div>
          <input
            type="text"
            value={selectedVisit.status}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, status: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Nursing Issues:</div>
          <textarea
            value={selectedVisit.nursingIssues || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, nursingIssues: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Care Plan:</div>
          <textarea
            value={selectedVisit.carePlan || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, carePlan: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Local Status Check:</div>
          <textarea
            value={selectedVisit.localStatus || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, localStatus: e.target.value })}
            className="editable-input"
          />
        </div>

        <h2 className="section-title">Medical Assessment</h2>
        <div className="detail-field">
          <div className="detail-label">Main Complaint:</div>
          <input
            type="text"
            value={selectedVisit.complaint}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, complaint: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Additional Complaints:</div>
          <input
            type="text"
            value={selectedVisit.additionalComplaint || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, additionalComplaint: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Weight:</div>
          <input
            type="text"
            value={selectedVisit.weight || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, weight: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Height:</div>
          <input
            type="text"
            value={selectedVisit.height || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, height: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">BMI:</div>
          <input
            type="text"
            value={selectedVisit.bmi || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, bmi: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Blood Pressure:</div>
          <input
            type="text"
            value={selectedVisit.bloodPressure || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, bloodPressure: e.target.value })}
            className="editable-input"
          />
        </div>
        <div className="detail-field">
          <div className="detail-label">Pulse:</div>
          <input
            type="text"
            value={selectedVisit.pulse || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, pulse: e.target.value })}
            className="editable-input"
          />
        </div>

        <h2 className="section-title">Prescriptions</h2>
        <div className="detail-field">
          <div className="detail-label">Medications:</div>
          <textarea
            value={selectedVisit.medications || ''}
            onChange={(e) => setSelectedVisit({ ...selectedVisit, medications: e.target.value })}
            className="editable-input"
          />
        </div>

        <div className="signature-block">
          <div className="signature-line"></div>
          <div className="signature-caption">Veterinarian: Dr. Angela Rivera</div>
        </div>

        <div className="detail-actions">
          <button
            className="save-btn"
            onClick={() => {
              const updatedPets = pets.map((pet) => {
                if (pet.id === selectedPet.id) {
                  return {
                    ...pet,
                    checkups: pet.checkups.map((visit) =>
                      visit.date === selectedVisit.date &&
                      visit.service === selectedVisit.service
                        ? selectedVisit
                        : visit
                    ),
                  };
                }
                return pet;
              });
              setPets(updatedPets);
              setSelectedVisit(null);
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)}


{showAddPetModal && (
  <div className="pet-modal-overlay">
    <div className="pet-modal-add">
      <button className="close-btn" onClick={() => setShowAddPetModal(false)}>×</button>
      <h3 className="add-modal-title">Add New Pet Record</h3>
      <form onSubmit={handleAddPet} className="add-pet-form-grid">
        {/* Left Side: Image */}
        <div className="add-pet-image-upload">
          <label htmlFor="petImage" className="add-image-upload-box">
            <input type="file" id="petImage" name="image" accept="image/*" hidden />
            <img
              src="/images/494821804_3615220685439850_5750128201232600483_n.png"
              alt="Upload"
              className="add-image-placeholder"
            />
          </label>
        </div>

        {/* Right Side: Inputs */}
        <div className="add-pet-form-fields">
          <div className="add-form-group">
              <input name="ownerName" type="text" placeholder="Owner Name" required />
            <input name="name" type="text" placeholder="Pet Name" required /> 
            <input name="age" type="number" placeholder="Age" required />
          </div>

          <div className="add-form-group">
            <select name="species" required defaultValue="">
              <option value="" disabled>Select Species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
            </select>
            <select name="gender" required defaultValue="">
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="add-form-group">
            <input name="condition" type="text" placeholder="Condition" required />
            <input name="lastVisit" type="date" placeholder="Last Visit" required />
          </div>

          <div className="add-form-group">
            <input name="diagnosis" type="text" placeholder="Diagnosis" required />
          </div>

          <div className="add-button-row">
            <button type="submit" className="add-add-btn">Add Pet</button>
            <button type="button" className="cancel-btn" onClick={() => setShowAddPetModal(false)}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}
      {showEditModal && (
        <div className="pet-modal-overlay">
    <div className="pet-modal-edit">
      <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
      <h3 className="edit-modal-title">Edit Pet Record</h3>
      <form onSubmit={handleAddPet} className="edit-pet-form-grid">
        {/* Left Side: Image */}
        <div className="edit-pet-image-upload">
          <label htmlFor="petImage" className="edit-image-upload-box">
            <input type="file" id="petImage" name="image" accept="image/*" hidden />
            <img
              src="/images/494821804_3615220685439850_5750128201232600483_n.png"
              alt="Upload"
              className="edit-image-placeholder"
            />
          </label>
        </div>
        {/* Right Side: Inputs */}
        <div className="edit-pet-form-fields">
          <div className="edit-form-group">
            <input name="ownerName" type="text" placeholder="Owner Name" required />
            <input name="name" type="text" placeholder="Pet Name" required />
            <input name="age" type="number" placeholder="Age" required />
          </div>

          <div className="edit-form-group">
            <select name="species" required defaultValue="">
              <option value="" disabled>Select Species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
            </select>
            <select name="gender" required defaultValue="">
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="edit-form-group">
            <input name="condition" type="text" placeholder="Condition" required />
            <input name="lastVisit" type="date" placeholder="Last Visit" required />
          </div>

          <div className="edit-form-group">
            <input name="diagnosis" type="text" placeholder="Diagnosis" required />
          </div>

          <div className="edit-button-row">
            <button type="submit" className="edit-add-btn">Add Pet</button>
            <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  </div>
      )}
    </div>
  );
}