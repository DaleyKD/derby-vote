import { useState } from 'react';
import { getCars, renameCategory } from '../storage';
import { FileText, ListChecks, Car, Tags, ChevronUp, ChevronDown, Pencil, X, Printer } from 'lucide-react';

export default function Setup({ event, onUpdateEvent }) {
  const [newCategory, setNewCategory] = useState('');
  const [carRange, setCarRange] = useState({ start: 1, end: 20 });
  const [showCarNaming, setShowCarNaming] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

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

  const handleStartEditCategory = (category) => {
    setEditingCategory(category);
    setEditingCategoryName(category);
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleSaveEditCategory = () => {
    const trimmedName = editingCategoryName.trim();
    if (!trimmedName) {
      handleCancelEditCategory();
      return;
    }
    // Don't save if the name hasn't changed
    if (trimmedName === editingCategory) {
      handleCancelEditCategory();
      return;
    }
    // Check for duplicate names
    if (event.categories.includes(trimmedName)) {
      alert('A category with this name already exists.');
      return;
    }
    // Use the renameCategory function to update category and all votes
    const eventId = event.id || event.year;
    const updatedEvent = renameCategory(eventId, editingCategory, trimmedName);
    if (updatedEvent) {
      onUpdateEvent(updatedEvent);
    }
    handleCancelEditCategory();
  };

  const handleEditCategoryKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEditCategory();
    } else if (e.key === 'Escape') {
      handleCancelEditCategory();
    }
  };

  const handleMoveCategory = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= event.categories.length) return;

    const newCategories = [...event.categories];
    const [movedCategory] = newCategories.splice(index, 1);
    newCategories.splice(newIndex, 0, movedCategory);

    onUpdateEvent({ ...event, categories: newCategories });
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

  const canPrintSlips = event.categories.length > 0;

  const handlePrintSlips = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print voting slips.');
      return;
    }

    const formattedDate = event.eventDate
      ? new Date(event.eventDate + 'T00:00:00').toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

    // Generate HTML for print
    const slipHtml = `
      <div class="slip">
        <div class="header">
          <div class="title">${event.name || 'Pinewood Derby'}</div>
          <div class="troop">Trail Life Troop TX-0521</div>
          ${formattedDate ? `<div class="date">${formattedDate}</div>` : ''}
        </div>
        <div class="categories">
          ${event.categories
            .map(
              (cat) => `
            <div class="category">
              <span class="cat-name">${cat}</span>
              <span class="car-line">Car # __________</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voting Slips - ${event.name || 'Pinewood Derby'}</title>
        <style>
          @page {
            size: letter landscape;
            margin: 0.25in;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page {
            width: 10.5in;
            height: 8in;
            display: flex;
            gap: 0.25in;
            page-break-after: always;
          }
          .page:last-child {
            page-break-after: auto;
          }
          .slip {
            flex: 1;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 0.3in;
            display: flex;
            flex-direction: column;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 0.15in;
            margin-bottom: 0.2in;
          }
          .title {
            font-size: 18pt;
            font-weight: bold;
            color: #1a365d;
          }
          .date {
            font-size: 11pt;
            color: #555;
            margin-top: 4px;
          }
          .troop {
            font-size: 12pt;
            font-weight: 600;
            color: #333;
            margin-top: 4px;
          }
          .categories {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
          }
          .category {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0.12in 0;
            border-bottom: 1px dashed #ccc;
          }
          .category:last-child {
            border-bottom: none;
          }
          .cat-name {
            font-size: 12pt;
            font-weight: 700;
            max-width: 55%;
            word-wrap: break-word;
          }
          .car-line {
            font-size: 11pt;
            color: #555;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${slipHtml}
          ${slipHtml}
          ${slipHtml}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

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
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2"><FileText size={20} /> Event Details</h3>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2"><ListChecks size={20} /> Categories</h3>
          <button
            className="px-3 py-1.5 text-sm bg-background text-text-primary font-medium border border-border rounded hover:border-primary transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrintSlips}
            disabled={!canPrintSlips}
            title={canPrintSlips ? 'Print voting slips' : 'Add categories first'}
          >
            <Printer size={16} /> Print Slips
          </button>
        </div>
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
            event.categories.map((category, index) => (
              <div key={category} className="flex items-center justify-between p-3 bg-background rounded">
                {/* Reorder buttons */}
                <div className="flex flex-col mr-2">
                  <button
                    className="w-5 h-5 flex items-center justify-center text-text-light hover:text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => handleMoveCategory(index, -1)}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    className="w-5 h-5 flex items-center justify-center text-text-light hover:text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => handleMoveCategory(index, 1)}
                    disabled={index === event.categories.length - 1}
                    title="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {editingCategory === category ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onKeyDown={handleEditCategoryKeyDown}
                      onBlur={handleSaveEditCategory}
                      autoFocus
                      className="flex-1 px-2 py-1 border border-primary rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                ) : (
                  <span
                    className="font-medium text-text-primary cursor-pointer hover:text-primary flex-1"
                    onClick={() => handleStartEditCategory(category)}
                    title="Click to rename"
                  >
                    {category}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  {editingCategory !== category && (
                    <button
                      className="w-6 h-6 flex items-center justify-center text-text-light hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      onClick={() => handleStartEditCategory(category)}
                      title="Rename category"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  <button
                    className="w-6 h-6 flex items-center justify-center text-text-light hover:text-danger hover:bg-danger/10 rounded transition-colors"
                    onClick={() => handleRemoveCategory(category)}
                    title="Remove category"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-surface p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2"><Car size={20} /> Car Numbers</h3>
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
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2"><Tags size={20} /> Car Names (Optional)</h3>
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

