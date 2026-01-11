import { useState } from 'react';
import { getCars } from '../storage';

export default function Setup({ event, onUpdateEvent, onStartVoting }) {
  const [newCategory, setNewCategory] = useState('');
  const [carRange, setCarRange] = useState({ start: 1, end: 20 });
  const [showCarNaming, setShowCarNaming] = useState(false);

  // Derive cars array from carNames keys
  const cars = getCars(event);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      const updated = {
        ...event,
        categories: [...event.categories, newCategory.trim()],
      };
      onUpdateEvent(updated);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category) => {
    const updated = {
      ...event,
      categories: event.categories.filter(c => c !== category),
    };
    onUpdateEvent(updated);
  };

  const handleAddCarRange = () => {
    const carNames = { ...(event.carNames || {}) };
    for (let i = carRange.start; i <= carRange.end; i++) {
      if (!(i in carNames)) {
        carNames[i] = ''; // Empty name by default
      }
    }
    onUpdateEvent({ ...event, carNames });
  };

  const handleClearAllCars = () => {
    onUpdateEvent({ ...event, carNames: {}, slips: [] });
  };

  const handleRemoveCar = (carNumber) => {
    const carNames = { ...(event.carNames || {}) };
    delete carNames[carNumber];
    onUpdateEvent({ ...event, carNames });
  };

  const handleCarNameChange = (carNumber, name) => {
    const carNames = { ...(event.carNames || {}) };
    carNames[carNumber] = name;
    onUpdateEvent({ ...event, carNames });
  };

  const handleCarNameBlur = (carNumber) => {
    const name = event.carNames?.[carNumber];
    if (name && name !== name.trim()) {
      handleCarNameChange(carNumber, name.trim());
    }
  };

  const canStartVoting = event.categories.length > 0 && cars.length > 0;

  const handleNameChange = (newName) => {
    onUpdateEvent({ ...event, name: newName });
  };

  const handleDateChange = (newDate) => {
    const year = new Date(newDate).getFullYear().toString();
    onUpdateEvent({ ...event, eventDate: newDate, year });
  };

  return (
    <div className="setup">
      <div className="setup-section">
        <h3>📝 Event Details</h3>
        <div className="event-details-form">
          <div className="form-row">
            <label>Event Name:</label>
            <input
              type="text"
              value={event.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Event name..."
            />
          </div>
          <div className="form-row">
            <label>Event Date:</label>
            <input
              type="date"
              value={event.eventDate || ''}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="setup-section">
        <h3>📋 Categories</h3>
        <form onSubmit={handleAddCategory} className="add-form">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g., Most Creative, Best Paint Job"
          />
          <button type="submit" className="btn btn-primary">Add Category</button>
        </form>
        
        <div className="category-list">
          {event.categories.length === 0 ? (
            <p className="empty-message">No categories yet. Add some above!</p>
          ) : (
            event.categories.map((category) => (
              <div key={category} className="category-item">
                <span>{category}</span>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveCategory(category)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="setup-section">
        <h3>🚗 Car Numbers</h3>
        <div className="car-range">
          <label>
            From:
            <input
              type="number"
              min="1"
              value={carRange.start}
              onChange={(e) => setCarRange({ ...carRange, start: parseInt(e.target.value) || 1 })}
            />
          </label>
          <label>
            To:
            <input
              type="number"
              min="1"
              value={carRange.end}
              onChange={(e) => setCarRange({ ...carRange, end: parseInt(e.target.value) || 1 })}
              className={carRange.end < carRange.start ? 'invalid' : ''}
            />
          </label>
          <button
            className="btn btn-primary"
            onClick={handleAddCarRange}
            disabled={carRange.end < carRange.start}
          >
            + Add Range
          </button>
          {carRange.end < carRange.start && (
            <span className="range-error">End must be ≥ start</span>
          )}
        </div>

        {cars.length > 0 && (
          <>
            <div className="car-info-row">
              <p className="car-info">
                {cars.length} cars registered. Click a car to remove it.
              </p>
              <button className="btn btn-sm clear-cars-btn" onClick={handleClearAllCars}>
                Clear All
              </button>
            </div>
            <div
              className="car-chips"
              style={{ '--max-digits': Math.max(...cars).toString().length }}
            >
              {cars.map((carNumber) => (
                <button
                  key={carNumber}
                  className="car-chip"
                  onClick={() => handleRemoveCar(carNumber)}
                  title={`Remove car ${carNumber}`}
                >
                  {carNumber}
                  <span className="car-chip-x">✕</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {cars.length > 0 && (
        <div className="setup-section">
          <div className="section-header">
            <h3>🏷️ Car Names (Optional)</h3>
            <button
              className="btn btn-sm toggle-btn"
              onClick={() => setShowCarNaming(!showCarNaming)}
            >
              {showCarNaming ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="section-note">Add names to cars for winner announcements (e.g., "The Lightning Bolt" or owner's name)</p>

          {showCarNaming && (
            <div className="car-names-grid">
              {cars.map((carNumber) => (
                <div key={carNumber} className="car-name-input">
                  <label>{carNumber}</label>
                  <input
                    type="text"
                    value={event.carNames?.[carNumber] || ''}
                    onChange={(e) => handleCarNameChange(carNumber, e.target.value)}
                    onBlur={() => handleCarNameBlur(carNumber)}
                    placeholder="Car name..."
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

