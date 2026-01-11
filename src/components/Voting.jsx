import { useState, useRef, useEffect } from 'react';
import { getSlips, addSlip, removeLastSlip, removeSlipByIndex, getCars } from '../storage';
import { ClipboardList, Undo2 } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex gap-6 p-4 bg-surface rounded-lg shadow">
        <span className="text-text-primary"><strong className="text-primary">{totalVotes}</strong> total votes</span>
        <span className="text-text-primary"><strong className="text-primary">{slips.length}</strong> slips entered</span>
      </div>

      <form onSubmit={handleSubmitSlip}>
        <div className="bg-surface rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-primary text-white flex justify-between items-center">
            <span className="font-semibold text-lg">Voting Slip</span>
            <span className="text-white/70 text-sm">Enter car number for each category</span>
          </div>

          <div className="divide-y divide-border">
            {event.categories.map((category, index) => {
              const value = slip[category];
              const isInvalid = value && !isValidCar(value);
              return (
                <div key={category} className={`p-4 flex items-center gap-4 ${isInvalid ? 'bg-danger/5' : ''}`}>
                  <label className="flex-1 font-medium text-text-primary">{category}</label>
                  <div className="flex flex-col items-end gap-1">
                    <input
                      ref={index === 0 ? firstInputRef : null}
                      type="number"
                      className={`slip-input w-24 px-3 py-2 text-center text-lg border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 ${isInvalid ? 'border-danger text-danger' : 'border-border focus:border-primary'}`}
                      value={value}
                      onChange={(e) => handleSlipChange(category, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="—"
                    />
                    {isInvalid && (
                      <span className="text-danger text-xs">Car {value} doesn't exist</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-background flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-white text-text-primary font-medium border border-border rounded hover:bg-gray-50 transition-colors"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={filledCount === 0 || hasInvalid}
            >
              Submit Slip
            </button>
          </div>
        </div>

        {hasInvalid && (
          <p className="mt-2 text-danger text-sm">
            Invalid car number. Valid range: {cars[0]}-{cars[cars.length - 1]}
          </p>
        )}
      </form>

      {slips.length > 0 && (
        <div className="bg-surface p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2"><ClipboardList size={20} /> Recent Entries</h3>
            <button type="button" onClick={handleUndo} className="px-3 py-1.5 text-sm bg-white text-danger border border-danger rounded hover:bg-danger hover:text-white transition-colors flex items-center gap-1"><Undo2 size={14} /> Undo Last</button>
          </div>
          <div className="flex flex-wrap gap-3 max-h-60 overflow-y-auto">
            {slips.slice(0, 10).map((slip, i) => (
              <div key={slip.timestamp} className={`bg-white p-3 rounded border min-w-[140px] shrink-0 flex flex-col gap-1 ${i === 0 ? 'border-primary border-2 bg-primary/5' : 'border-border'}`}>
                <div className="flex justify-between items-center text-xs text-text-light border-b border-border pb-1.5 mb-1">
                  <span>{new Date(slip.timestamp).toLocaleTimeString()}</span>
                  <button
                    type="button"
                    className="text-text-light/50 hover:text-danger transition-colors"
                    onClick={() => setSlipToRemove(i)}
                    title="Remove this slip"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-col gap-0.5">
                  {slip.votes.map((v, j) => (
                    <div key={j} className="flex justify-between gap-3 text-sm py-0.5">
                      <span className="text-text-light truncate max-w-24">{v.category}</span>
                      <span className="font-bold text-primary">{v.carNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slipToRemove !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSlipToRemove(null)}>
          <div className="bg-surface p-6 rounded-lg shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Remove Slip?</h3>
            <p className="text-text-primary mb-4">Are you sure you want to remove this slip from <strong>{new Date(slips[slipToRemove].timestamp).toLocaleTimeString()}</strong>?</p>
            <div className="flex flex-wrap gap-2 p-3 bg-background rounded mb-6">
              {slips[slipToRemove].votes.map((v, j) => (
                <div key={j} className="flex items-center gap-2 px-2 py-1 bg-white rounded text-sm">
                  <span className="text-text-light">{v.category}</span>
                  <span className="font-semibold text-primary">{v.carNumber}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 bg-background text-text-primary font-medium rounded hover:bg-border transition-colors" onClick={() => setSlipToRemove(null)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-danger text-white font-semibold rounded hover:bg-danger/80 transition-colors" onClick={() => {
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

