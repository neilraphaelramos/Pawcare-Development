import React, { useState } from 'react';
import './Appointments.css';
import appointmentsData from '../../data/appointments.json';

const generateTimeSlots = () => {
  const start = new Date();
  start.setHours(8, 0, 0, 0);
  const end = new Date();
  end.setHours(18, 0, 0, 0);

  const am = [], pm = [];
  let toggle = true;

  while (start < end) {
    const slotStart = new Date(start);
    const slotEnd = new Date(start.getTime() + (toggle ? 45 : 60) * 60000);
    if (slotEnd > end) break;

    const format = (d) =>
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const slot = `${format(slotStart)} - ${format(slotEnd)}`;
    (slotStart.getHours() < 12 ? am : pm).push(slot);

    start.setTime(slotEnd.getTime());
    toggle = !toggle;
  }

  return { am, pm };
};

const Appointment = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAM, setIsAM] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [localData, setLocalData] = useState(JSON.parse(JSON.stringify(appointmentsData))); // Local state copy

  const { am, pm } = generateTimeSlots();

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDate = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (newDate >= today.setHours(0, 0, 0, 0)) {
      setSelectedDate(newDate);
      setSelectedSlot(null);
    }
  };

  const formattedDate = selectedDate
  ? selectedDate.toLocaleDateString('en-CA')
  : null;


  const reservations = localData[formattedDate] || {};
  const reservationDetails = selectedSlot ? reservations[selectedSlot] : null;

 const updateStatus = (status) => {
  if (!formattedDate || !selectedSlot || !reservationDetails) return;

  const updatedData = { ...localData };
  if (!updatedData[formattedDate][selectedSlot]) return;

  updatedData[formattedDate][selectedSlot].status = status;
  setLocalData(updatedData);
};


  return (
    <div className="appointment-container">
      <div className="calendar-panel">
        <h4>Select a Date</h4>
        <div className="calendar-header">
          <button onClick={handlePrevMonth}>&lt;</button>
          <span>
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </span>
          <button onClick={handleNextMonth}>&gt;</button>
        </div>
        <div className="calendar-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div className="day-name" key={d}>{d}</div>
          ))}
          {[...Array(startDay === 0 ? 6 : startDay - 1)].map((_, i) => <div key={i}></div>)}
          {daysInMonth.map(day => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isDisabled = date < new Date().setHours(0, 0, 0, 0);
            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
            return (
              <div
                key={day}
                className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => !isDisabled && selectDate(day)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="admin-time-panel">
        <h4>{selectedDate ? selectedDate.toDateString() : 'Select a date to view reservations'}</h4>

        {selectedDate && (
          <>
            <div className="toggle-header">
              <button onClick={() => setIsAM(true)}>&lt;</button>
              <span>{isAM ? 'AM' : 'PM'}</span>
              <button onClick={() => setIsAM(false)}>&gt;</button>
            </div>

            <div className="time-grid">
              {(isAM ? am : pm).map((slot, i) => {
                const isSelected = slot === selectedSlot;
                return (
                  <div
                    key={i}
                    className={`time-slot ${isSelected ? 'selected-slot' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </div>
                );
              })}
            </div>
<div className="reservation-list">
  <h5>Reservation Details</h5>
  {reservationDetails ? (
    <div className="reservation-card">
      <div>
        <strong>{reservationDetails.owner}</strong><br />
        Time: {selectedSlot}<br />
        <div>
          Status: <span className="status-text">
            {reservationDetails.status || 'Pending'}
          </span>
        </div>
      </div>
      <div className="action-buttons">
        <button className="approve" onClick={() => updateStatus('Approved')}>Approve</button>
        <button className="decline" onClick={() => updateStatus('Declined')}>Decline</button>
      </div>
    </div>
  ) : (
    <p>No reservation for this time slot.</p>
  )}
</div>



          </>
        )}
      </div>
    </div>
  );
};

export default Appointment;
