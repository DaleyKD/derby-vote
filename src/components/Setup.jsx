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
    <div className="space-y-6">
      <div className="bg-surface p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-text-primary mb-4">📝 Event Details</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="font-medium text-text-primary min-w-[100px]">Event Name:</label>
            <input
              type="text"
              value={event.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Event name..."
              className="flex-1 px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="font-medium text-text-primary min-w-[100px]">Event Date:</label>
            <input
              type="date"
              value={event.eventDate || ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-text-primary mb-4">📋 Categories</h3>
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g., Most Creative, Best Paint Job"
            className="flex-1 px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition-colors">Add Category</button>
        </form>

        <div className="space-y-2">
          {event.categories.length === 0 ? (
            <p className="text-text-light italic">No categories yet. Add some above!</p>
          ) : (
            event.categories.map((category) => (
              <div key={category} className="flex items-center justify-between p-3 bg-background rounded">
                <span className="font-medium text-text-primary">{category}</span>
                <button
                  className="w-6 h-6 flex items-center justify-center text-text-light hover:text-danger hover:bg-danger/10 rounded transition-colors"
                  onClick={() => handleRemoveCategory(category)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-surface p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-text-primary mb-4">🚗 Car Numbers</h3>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            From:
            <input
              type="number"
              min="1"
              value={carRange.start}
              onChange={(e) => setCarRange({ ...carRange, start: parseInt(e.target.value) || 1 })}
              className="w-20 px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            To:
            <input
              type="number"
              min="1"
              value={carRange.end}
              onChange={(e) => setCarRange({ ...carRange, end: parseInt(e.target.value) || 1 })}
              className={`w-20 px-3 py-2 border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${carRange.end < carRange.start ? 'border-danger' : 'border-border'}`}
            />
          </label>
          <button
            className="px-4 py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddCarRange}
            disabled={carRange.end < carRange.start}
          >
            + Add Range
          </button>
          {carRange.end < carRange.start && (
            <span className="text-danger text-sm">End must be ≥ start</span>
          )}
        </div>

        {cars.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-text-light text-sm">
                {cars.length} cars registered. Click a car to remove it.
              </p>
              <button className="px-3 py-1 text-sm text-danger border border-danger rounded hover:bg-danger hover:text-white transition-colors" onClick={handleClearAllCars}>
                Clear All
              </button>
            </div>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(...cars).toString().length * 0.6 + 2.5}rem, max-content))` }}
            >
              {cars.map((carNumber) => (
                <button
                  key={carNumber}
                  className="group relative px-3 py-1.5 bg-background border border-border rounded text-sm text-center font-semibold tabular-nums hover:border-danger hover:bg-danger/5 transition-colors"
                  onClick={() => handleRemoveCar(carNumber)}
                  title={`Remove car ${carNumber}`}
                >
                  {carNumber}
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-xs rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">✕</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {cars.length > 0 && (
        <div className="bg-surface p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-text-primary">🏷️ Car Names (Optional)</h3>
            <button
              className="px-3 py-1 text-sm text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors"
              onClick={() => setShowCarNaming(!showCarNaming)}
            >
              {showCarNaming ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-text-light text-sm mb-4">Add names to cars for winner announcements (e.g., "The Lightning Bolt" or owner's name)</p>

          {showCarNaming && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {cars.map((carNumber) => (
                <div key={carNumber} className="flex items-center gap-2">
                  <label className="w-10 text-center font-semibold text-text-primary">{carNumber}</label>
                  <input
                    type="text"
                    value={event.carNames?.[carNumber] || ''}
                    onChange={(e) => handleCarNameChange(carNumber, e.target.value)}
                    onBlur={() => handleCarNameBlur(carNumber)}
                    placeholder="Car name..."
                    className="flex-1 px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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

