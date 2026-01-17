import { useState } from 'react';
import { exportData, importData, getAllEvents } from '../storage';
import { Database, Download, Upload, FileOutput } from 'lucide-react';

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
    <div className="mt-4 md:mt-6 bg-surface p-4 md:p-6 rounded-lg shadow">
      <h3 className="text-base md:text-lg font-semibold text-text-primary mb-3 md:mb-4 flex items-center gap-2"><Database size={20} /> Data Management</h3>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 md:mb-4">
        <button onClick={() => setShowExportModal(true)} className="px-4 py-2.5 md:py-2 bg-background text-text-primary font-medium border border-border rounded hover:border-primary transition-colors flex items-center justify-center gap-2 min-h-[44px] md:min-h-0 text-sm">
          <Download size={16} /> Export Data
        </button>
        <label className="px-4 py-2.5 md:py-2 bg-background text-text-primary font-medium border border-border rounded hover:border-primary transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px] md:min-h-0 text-sm">
          <Upload size={16} /> Import Data
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-text-light text-xs md:text-sm">
        Export your data regularly to keep a backup. You can import previous backups to restore data.
      </p>

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3" onClick={() => setShowExportModal(false)}>
          <div className="bg-surface p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base md:text-lg font-semibold text-text-primary mb-4 md:mb-6 flex items-center gap-2"><FileOutput size={20} /> Export Data</h3>

            <div className="mb-4 md:mb-6">
              <label className="block font-medium text-text-primary mb-2 text-sm md:text-base">File Name</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                  className="flex-1 px-3 py-2.5 md:py-2 border border-border rounded-l text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-w-0"
                />
                <span className="px-2 md:px-3 py-2.5 md:py-2 bg-background border border-l-0 border-border rounded-r text-text-light text-sm">.json</span>
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <label className="block font-medium text-text-primary mb-2 text-sm md:text-base">Select Events to Export</label>
              <div className="max-h-48 overflow-y-auto border border-border rounded divide-y divide-border">
                <label className="flex items-center gap-3 p-3 hover:bg-background cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={exportSelection.includes('all')}
                    onChange={() => toggleExportSelection('all')}
                    className="w-5 h-5 md:w-4 md:h-4 accent-primary shrink-0"
                  />
                  <span className="font-medium text-text-primary text-sm md:text-base">All Events</span>
                </label>
                {allEvents.map((evt) => (
                  <label key={evt.id || evt.year} className="flex items-center gap-3 p-3 hover:bg-background cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={exportSelection.includes('all') || exportSelection.includes(evt.id || evt.year)}
                      onChange={() => toggleExportSelection(evt.id || evt.year)}
                      className="w-5 h-5 md:w-4 md:h-4 accent-primary shrink-0"
                    />
                    <span className="flex-1 text-text-primary text-sm truncate">{evt.name}</span>
                    <span className="text-text-light text-xs md:text-sm shrink-0">{evt.eventDate || evt.year}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button className="px-4 py-2.5 bg-background text-text-primary font-medium rounded hover:bg-border transition-colors min-h-[44px] text-sm" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button
                className="px-4 py-2.5 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm"
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

