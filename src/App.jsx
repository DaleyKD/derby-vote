import { useState, useEffect } from 'react';
import { getEvent, saveEvent, getAllEvents, getVotes, getCars, createEvent, getEventById, setCurrentEventId, getCurrentEventId, deleteEvent } from './storage';
import Setup from './components/Setup';
import Voting from './components/Voting';
import Results from './components/Results';
import DataManager from './components/DataManager';
import { BarChart3, Vote, Settings, ChevronLeft, ChevronRight, Car, AlertTriangle } from 'lucide-react';

function App() {
  const currentYear = new Date().getFullYear().toString();

  // Initialize with existing events or create default
  const [allEvents, setAllEvents] = useState(() => {
    const events = getAllEvents();
    if (events.length === 0) {
      // Create a default event for current year
      const defaultEvent = createEvent(`Worthy Derby ${currentYear}`, new Date().toISOString().split('T')[0]);
      return [defaultEvent];
    }
    return events;
  });

  const [event, setEvent] = useState(() => {
    const currentId = getCurrentEventId();
    if (currentId) {
      const existing = getEventById(currentId);
      if (existing) return existing;
    }
    // Fall back to first event or create new
    const events = getAllEvents();
    return events[0] || getEvent(currentYear);
  });

  const [view, setView] = useState('results');
  const [presentationMode, setPresentationMode] = useState(false);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateEvent = (updatedEvent) => {
    saveEvent(updatedEvent);
    setEvent(updatedEvent);
    setAllEvents(getAllEvents());
  };

  const refreshEvent = () => {
    const updated = getEventById(event.id) || getEvent(event.year);
    setEvent({ ...updated });
  };

  const handleDataImported = () => {
    const events = getAllEvents();
    setAllEvents(events);
    if (events.length > 0) {
      setEvent(events[0]);
    }
  };

  const handleSelectEvent = (selectedEvent) => {
    setEvent(selectedEvent);
    setCurrentEventId(selectedEvent.id || selectedEvent.year);
    setShowEventPicker(false);
  };

  const handleCreateEvent = () => {
    if (newEventName.trim()) {
      const created = createEvent(newEventName.trim(), newEventDate);
      setAllEvents(getAllEvents());
      setEvent(created);
      setNewEventName('');
      setNewEventDate(new Date().toISOString().split('T')[0]);
      setShowEventPicker(false);
      setView('setup');
    }
  };

  const handleDeleteEvent = (eventToDelete) => {
    const eventId = eventToDelete.id || eventToDelete.year;
    deleteEvent(eventId);
    const remaining = getAllEvents();
    setAllEvents(remaining);

    // If we deleted the current event, switch to another
    if ((event.id || event.year) === eventId) {
      if (remaining.length > 0) {
        setEvent(remaining[0]);
        setCurrentEventId(remaining[0].id || remaining[0].year);
      } else {
        // Create a new default event if none left
        const newEvent = createEvent('New Event', new Date().toISOString().split('T')[0]);
        setAllEvents(getAllEvents());
        setEvent(newEvent);
      }
    }
    setShowEventPicker(false);
  };

  // Toggle presentation mode with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && presentationMode) {
        setPresentationMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationMode]);

  if (presentationMode) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto p-8">
        <button
          className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded font-medium cursor-pointer z-[1001] hover:bg-primary-dark transition-colors"
          onClick={() => setPresentationMode(false)}
        >
          ✕ Exit (Esc)
        </button>
        <Results
          event={event}
          allEvents={allEvents}
          onSelectEvent={handleSelectEvent}
          isPresentation={true}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background text-text-primary font-sans text-sm overflow-hidden">
      <aside className={`${sidebarCollapsed ? 'w-14' : 'w-60'} h-screen bg-primary text-white flex flex-col shrink-0 transition-all duration-200`}>
        <div className="p-4 border-b border-white/10 flex items-center overflow-hidden">
          <div className="flex items-center gap-3">
            <Car size={28} className="shrink-0" />
            <div className={`flex flex-col whitespace-nowrap transition-opacity duration-150 ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              <span className="font-bold text-base tracking-tight">Worthy Derby</span>
              <span className="text-[11px] text-white/70 font-medium">TX-0521</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 flex flex-col gap-0.5">
          <button
            className={`flex items-center gap-3 w-full py-2.5 px-3 rounded text-left font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors ${view === 'results' ? 'border-l-6 border-derby-tan bg-white/10 text-white font-bold' : 'border-l-6 border-transparent'} ${sidebarCollapsed ? 'justify-center px-2.5 gap-0' : ''}`}
            onClick={() => setView('results')}
            title="Results"
          >
            <BarChart3 size={20} className="w-6 min-w-6" />
            <span className={`whitespace-nowrap transition-opacity duration-150 ${sidebarCollapsed ? 'hidden' : ''}`}>Results</span>
          </button>
          <button
            className={`flex items-center gap-3 w-full py-2.5 px-3 rounded text-left font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${view === 'voting' ? 'border-l-6 border-derby-tan bg-white/10 text-white font-bold' : 'border-l-6 border-transparent'} ${sidebarCollapsed ? 'justify-center px-2.5 gap-0' : ''}`}
            onClick={() => setView('voting')}
            disabled={event.categories.length === 0 || getCars(event).length === 0}
            title="Vote"
          >
            <Vote size={20} className="w-6 min-w-6" />
            <span className={`whitespace-nowrap transition-opacity duration-150 ${sidebarCollapsed ? 'hidden' : ''}`}>Vote</span>
          </button>
        </nav>

        <div className={`p-2 border-t border-white/10 flex flex-col gap-0.5`}>
          <div className={`flex items-center gap-1 ${sidebarCollapsed ? 'flex-col gap-0.5' : ''}`}>
            <button
              className={`flex items-center gap-3 flex-1 py-2.5 px-3 rounded text-left font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors ${view === 'setup' ? 'border-l-6 border-derby-tan bg-white/10 text-white font-bold' : 'border-l-6 border-transparent'} ${sidebarCollapsed ? 'w-full justify-center px-0 gap-0' : ''}`}
              onClick={() => setView('setup')}
              title="Setup"
            >
              <Settings size={20} className="w-6 min-w-6" />
              <span className={`whitespace-nowrap transition-opacity duration-150 ${sidebarCollapsed ? 'hidden' : ''}`}>Setup</span>
            </button>

            <button
              className={`w-10 py-2.5 rounded text-white/50 hover:bg-white/10 hover:text-white/85 transition-colors flex items-center justify-center ${sidebarCollapsed ? 'hidden' : ''}`}
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse sidebar"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              className={`w-full py-2.5 rounded text-white/50 hover:bg-white/10 hover:text-white/85 transition-colors ${sidebarCollapsed ? 'flex items-center justify-center' : 'hidden'}`}
              onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border shadow-sm">
          <h1 className="text-xl font-semibold text-text-primary m-0 flex items-center gap-2">
            {view === 'results' && <><BarChart3 size={24} className="inline" /> Results</>}
            {view === 'voting' && <><Vote size={24} className="inline" /> Enter Votes</>}
            {view === 'setup' && <><Settings size={24} className="inline" /> Event Setup</>}
          </h1>

          <div className="relative">
            <button
              className="flex items-center gap-3 px-4 py-2 bg-background border border-border rounded hover:border-primary transition-colors text-left"
              onClick={() => setShowEventPicker(!showEventPicker)}
            >
              <span className="font-semibold text-text-primary">{event.name}</span>
              <span className="text-text-light text-sm">{event.eventDate}</span>
              <span className="text-text-light text-xs ml-1">{showEventPicker ? '▲' : '▼'}</span>
            </button>

            {showEventPicker && (
              <div className="absolute top-full right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 min-w-[300px]">
                <div className="max-h-60 overflow-y-auto border-b border-border">
                  {allEvents.map((e) => (
                    <button
                      key={e.id || e.year}
                      className={`flex justify-between items-center w-full px-4 py-3 text-left hover:bg-background transition-colors ${(e.id || e.year) === (event.id || event.year) ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                      onClick={() => handleSelectEvent(e)}
                    >
                      <span className="font-medium text-text-primary">{e.name}</span>
                      <span className="text-text-light text-sm">{e.eventDate || e.year}</span>
                    </button>
                  ))}
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <h4 className="m-0 text-sm font-semibold text-text-primary">Create New Event</h4>
                  <input
                    type="text"
                    placeholder="Event name..."
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    className="w-full px-4 py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCreateEvent}
                    disabled={!newEventName.trim()}
                  >
                    + Create Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'results' && (
            <Results
              event={event}
              allEvents={allEvents}
              onSelectEvent={handleSelectEvent}
              onPresentationMode={() => setPresentationMode(true)}
            />
          )}

          {view === 'voting' && (
            <Voting
              event={event}
              onRefresh={refreshEvent}
            />
          )}

          {view === 'setup' && (
            <>
              <Setup
                event={event}
                onUpdateEvent={handleUpdateEvent}
                onStartVoting={() => setView('voting')}
              />
              <DataManager onDataImported={handleDataImported} />

              <div className="mt-8 p-6 bg-surface rounded-lg shadow">
                <h3 className="text-lg font-semibold text-danger mb-4 flex items-center gap-2"><AlertTriangle size={20} /> Danger Zone</h3>
                <div className="flex items-center justify-between gap-4 p-4 bg-background rounded">
                  <div>
                    <strong className="text-text-primary">Delete this event</strong>
                    <p className="text-text-light text-sm mt-1">Permanently delete "{event.name}" and all its votes. This cannot be undone.</p>
                  </div>
                  <button
                    className="px-4 py-2 bg-danger text-white font-semibold rounded hover:bg-danger/80 transition-colors shrink-0"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Event
                  </button>
                </div>
              </div>

              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
                  <div className="bg-surface p-6 rounded-lg shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Delete Event?</h3>
                    <p className="text-text-primary mb-2">Are you sure you want to delete <strong>{event.name}</strong>?</p>
                    <p className="text-danger text-sm mb-6">This will permanently delete all votes and data for this event.</p>
                    <div className="flex justify-end gap-3">
                      <button className="px-4 py-2 bg-background text-text-primary font-medium rounded hover:bg-border transition-colors" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                      </button>
                      <button className="px-4 py-2 bg-danger text-white font-semibold rounded hover:bg-danger/80 transition-colors" onClick={() => {
                        handleDeleteEvent(event);
                        setShowDeleteConfirm(false);
                      }}>
                        Delete Event
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
