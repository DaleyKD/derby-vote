import { useState, useRef, useEffect } from 'react';
import { getSlips, addSlip, removeLastSlip, removeSlipByIndex, getCars } from '../storage';

export default function Voting({ event, onRefresh }) {
  const eventId = event.id || event.year;
  const cars = getCars(event);

  // Initialize slip with empty values for each category
  const emptySlip = () => event.categories.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {});

  const [slip, setSlip] = useState(emptySlip);
  const [slips, setSlips] = useState(() => getSlips(eventId));
  const [slipToRemove, setSlipToRemove] = useState(null);
  const firstInputRef = useRef(null);

  // Derive total votes from slips
  const totalVotes = slips.reduce((sum, s) => sum + s.votes.length, 0);

  // Reload slips when event changes
  useEffect(() => {
    setSlips(getSlips(eventId));
  }, [eventId]);

  // Focus first input on mount
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Update slip when a car number changes
  const handleSlipChange = (category, value) => {
    setSlip(prev => ({ ...prev, [category]: value }));
  };

  // Check if a car number is valid
  const isValidCar = (value) => {
    if (!value) return true; // Empty is ok
    const num = parseInt(value);
    return num && cars.includes(num);
  };

  // Count filled entries in slip
  const filledCount = Object.values(slip).filter(v => v && isValidCar(v)).length;
  const hasInvalid = Object.values(slip).some(v => v && !isValidCar(v));

  // Submit the entire slip
  const handleSubmitSlip = (e) => {
    e.preventDefault();

    const votes = [];
    Object.entries(slip).forEach(([category, carNumber]) => {
      if (carNumber && isValidCar(carNumber)) {
        const carNum = parseInt(carNumber);
        votes.push({ category, carNumber: carNum });
      }
    });

    if (votes.length > 0) {
      const updated = addSlip(eventId, votes);
      setSlips(updated);
      setSlip(emptySlip());
      firstInputRef.current?.focus();
    }
  };

  // Clear the slip
  const handleClear = () => {
    setSlip(emptySlip());
    firstInputRef.current?.focus();
  };

  // Handle Enter key to move to next field or submit
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputs = document.querySelectorAll('.slip-input');
      if (index < inputs.length - 1) {
        inputs[index + 1].focus();
      } else if (filledCount > 0 && !hasInvalid) {
        handleSubmitSlip(e);
      }
    }
  };

  const handleUndo = () => {
    const updated = removeLastSlip(eventId);
    setSlips(updated);
  };

  const handleRemoveSlip = (index) => {
    const updated = removeSlipByIndex(eventId, index);
    setSlips(updated);
  };

  return (
    <div className="voting">
      <div className="vote-stats-bar">
        <span className="stat"><strong>{totalVotes}</strong> total votes</span>
        <span className="stat"><strong>{slips.length}</strong> slips entered</span>
      </div>

      <form onSubmit={handleSubmitSlip} className="slip-entry">
          <div className="slip-card">
            <div className="slip-header">
              <span className="slip-title">Voting Slip</span>
              <span className="slip-hint">Enter car number for each category</span>
            </div>

            <div className="slip-fields">
              {event.categories.map((category, index) => {
                const value = slip[category];
                const isInvalid = value && !isValidCar(value);
                return (
                  <div key={category} className={`slip-row ${isInvalid ? 'has-error' : ''}`}>
                    <label className="slip-label">{category}</label>
                    <div className="slip-input-wrapper">
                      <input
                        ref={index === 0 ? firstInputRef : null}
                        type="number"
                        className={`slip-input ${isInvalid ? 'invalid' : ''}`}
                        value={value}
                        onChange={(e) => handleSlipChange(category, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder="—"
                      />
                      {isInvalid && (
                        <span className="slip-input-error">Car {value} doesn't exist</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="slip-actions">
              <button
                type="button"
                className="btn btn-secondary slip-clear-btn"
                onClick={handleClear}
              >
                Clear
              </button>
              <button
                type="submit"
                className="btn slip-submit-btn"
                disabled={filledCount === 0 || hasInvalid}
              >
                Submit Slip
              </button>
            </div>
          </div>

          {hasInvalid && (
            <p className="slip-error">
              Invalid car number. Valid range: {cars[0]}-{cars[cars.length - 1]}
            </p>
          )}
        </form>

      {slips.length > 0 && (
        <div className="recent-votes">
          <div className="recent-header">
            <h4>Recent Entries</h4>
            <button type="button" onClick={handleUndo} className="btn btn-sm undo-btn">↩ Undo Last</button>
          </div>
          <div className="recent-slips">
            {slips.slice(0, 10).map((slip, i) => (
              <div key={slip.timestamp} className={`recent-slip ${i === 0 ? 'latest' : ''}`}>
                <div className="recent-slip-header">
                  <span>{new Date(slip.timestamp).toLocaleTimeString()}</span>
                  <button
                    type="button"
                    className="slip-remove-btn"
                    onClick={() => setSlipToRemove(i)}
                    title="Remove this slip"
                  >
                    ✕
                  </button>
                </div>
                <div className="recent-slip-votes">
                  {slip.votes.map((v, j) => (
                    <div key={j} className="recent-vote-item">
                      <span className="category">{v.category}</span>
                      <span className="car-num">{v.carNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slipToRemove !== null && (
        <div className="modal-overlay" onClick={() => setSlipToRemove(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Slip?</h3>
            <p>Are you sure you want to remove this slip from <strong>{new Date(slips[slipToRemove].timestamp).toLocaleTimeString()}</strong>?</p>
            <div className="slip-preview">
              {slips[slipToRemove].votes.map((v, j) => (
                <div key={j} className="recent-vote-item">
                  <span className="category">{v.category}</span>
                  <span className="car-num">{v.carNumber}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSlipToRemove(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => {
                handleRemoveSlip(slipToRemove);
                setSlipToRemove(null);
              }}>
                Remove Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

