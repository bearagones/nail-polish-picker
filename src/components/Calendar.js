import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import '../styles/calendar.css';

const Calendar = () => {
  const { usedCombinations, comboPhotos } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get the first and last day of the current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const startingDayOfWeek = firstDay.getDay();
  
  // Get total days in month
  const daysInMonth = lastDay.getDate();
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get combinations for a specific date
  const getCombinationsForDate = (day) => {
    const dateStr = new Date(year, month, day).toDateString();
    return usedCombinations.filter(combo => {
      if (!combo.date) return false;
      const comboDate = new Date(combo.date).toDateString();
      return comboDate === dateStr;
    });
  };
  
  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };
  
  // Generate calendar days
  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const combinations = getCombinationsForDate(day);
      const hasData = combinations.length > 0;
      const todayClass = isToday(day) ? 'today' : '';
      
      days.push(
        <div key={day} className={`calendar-day ${todayClass} ${hasData ? 'has-data' : ''}`}>
          <div className="day-number">{day}</div>
          {hasData && (
            <div className="day-content">
              {combinations.map((combo, idx) => {
                const photo = combo.photo || combo.photoURL || comboPhotos[combo.id];
                return (
                  <div key={idx} className="calendar-combo">
                    {photo ? (
                      <img 
                        src={photo} 
                        alt={combo.polish.name}
                        className="calendar-thumbnail"
                        title={`${combo.polish.brand} ${combo.polish.name}`}
                      />
                    ) : (
                      <div 
                        className="calendar-no-photo"
                        title={`${combo.polish.brand} ${combo.polish.name}`}
                      >
                        <div className="polish-initials">
                          {combo.polish.brand.charAt(0)}{combo.polish.name.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Manicure Calendar</h2>
        <div className="calendar-navigation">
          <button onClick={previousMonth} className="nav-button">❮</button>
          <button onClick={goToToday} className="today-button">Today</button>
          <button onClick={nextMonth} className="nav-button">❯</button>
        </div>
      </div>
      
      <div className="calendar-month-title">
        {monthNames[month]} {year}
      </div>
      
      <div className="calendar-grid">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {renderCalendarDays()}
      </div>
      
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color today-indicator"></div>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-color has-data-indicator"></div>
          <span>Has Manicure</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
