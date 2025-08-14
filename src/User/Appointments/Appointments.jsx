import React, { useState } from 'react';
import './Appointments.css';

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
  const [selectedTime, setSelectedTime] = useState('');
  const [isAM, setIsAM] = useState(false);
  const { am, pm } = generateTimeSlots();

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();

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
    }
  };

  const handleReserve = () => {
    alert(`Appointment reserved on ${selectedDate?.toDateString()} at ${selectedTime}`);
    setSelectedDate(null);
    setSelectedTime('');
    setIsAM(false);
    setCurrentDate(new Date());
  };

  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1);

  return (
    <div className="appointment-container">
      <div className="left-panel">
        <h3>Schedule an Appointment</h3>
        <div className="duration">🕒 15–20 min</div>
        <div className="info-card">
          <div><strong>DATE</strong></div>
          <div>{selectedDate ? selectedDate.toDateString() : '-'}</div>
          <div><strong>TIME</strong></div>
          <div>{selectedTime || 'Please select a time slot'}</div>
        </div>
        <div className="actions">
          <button onClick={() => window.location.reload()}>Cancel</button>
          <button className="reserve" onClick={handleReserve}>Reserve Appointment</button>
        </div>
      </div>

      <div className="calendar-panel">
        <h4>Select a Date from below</h4>
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

      <div className="time-panel">
        <h4>Select a Time from below</h4>
        <div className="toggle-header">
          <button onClick={() => setIsAM(true)}>&lt;</button>
          <span>{isAM ? 'AM' : 'PM'}</span>
          <button onClick={() => setIsAM(false)}>&gt;</button>
        </div>
        <div className="time-grid">
          {(isAM ? am : pm).map((slot, i) => (
            <button
              key={i}
              className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
              onClick={() => setSelectedTime(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appointment;
