import { useState } from 'react';
import { exportData, importData, getAllEvents } from '../storage';

export default function DataManager({ onDataImported }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSelection, setExportSelection] = useState(['all']);
  const [exportFileName, setExportFileName] = useState(`derby-vote-backup-${new Date().toISOString().split('T')[0]}`);

  const allEvents = getAllEvents();

  const handleExport = () => {
    const data = exportData(exportSelection);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const toggleExportSelection = (eventId) => {
    if (eventId === 'all') {
      // Toggle: if already 'all', switch to empty (will show all unchecked), else select all
      if (exportSelection.includes('all')) {
        setExportSelection([]);
      } else {
        setExportSelection(['all']);
      }
    } else {
      let newSelection = exportSelection.filter(id => id !== 'all');
      if (newSelection.includes(eventId)) {
        newSelection = newSelection.filter(id => id !== eventId);
      } else {
        newSelection = [...newSelection, eventId];
      }
      // If all individual events are selected, switch to 'all'
      if (newSelection.length === allEvents.length) {
        setExportSelection(['all']);
      } else {
        setExportSelection(newSelection);
      }
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        importData(event.target.result);
        onDataImported();
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="data-manager">
      <h3>💾 Data Management</h3>
      <div className="data-actions">
        <button onClick={() => setShowExportModal(true)} className="btn btn-secondary">
          ⬇️ Export Data
        </button>
        <label className="btn btn-secondary import-label">
          ⬆️ Import Data
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      <p className="data-note">
        Export your data regularly to keep a backup. You can import previous backups to restore data.
      </p>

      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal export-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📤 Export Data</h3>

            <div className="export-filename">
              <label>File Name</label>
              <div className="filename-input">
                <input
                  type="text"
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                />
                <span className="filename-ext">.json</span>
              </div>
            </div>

            <div className="export-events">
              <label>Select Events to Export</label>
              <div className="export-event-list">
                <label className="export-event-option">
                  <input
                    type="checkbox"
                    checked={exportSelection.includes('all')}
                    onChange={() => toggleExportSelection('all')}
                  />
                  <span>All Events</span>
                </label>
                {allEvents.map((evt) => (
                  <label key={evt.id || evt.year} className="export-event-option">
                    <input
                      type="checkbox"
                      checked={exportSelection.includes('all') || exportSelection.includes(evt.id || evt.year)}
                      onChange={() => toggleExportSelection(evt.id || evt.year)}
                    />
                    <span>{evt.name}</span>
                    <span className="export-event-date">{evt.eventDate || evt.year}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleExport}
                disabled={exportSelection.length === 0}
              >
                Export{exportSelection.length === 0 ? '' : exportSelection.includes('all') ? ' All' : ` (${exportSelection.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

