import { useState, useEffect } from 'react';
import { getEvent, saveEvent, getAllEvents, getVotes, getCars, createEvent, getEventById, setCurrentEventId, getCurrentEventId, deleteEvent } from './storage';
import Setup from './components/Setup';
import Voting from './components/Voting';
import Results from './components/Results';
import DataManager from './components/DataManager';
import './App.css';

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
      <div className="presentation-mode">
        <button
          className="exit-presentation"
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
    <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏎️</span>
            <div className="logo-text">
              <span className="logo-title">Worthy Derby</span>
              <span className="logo-subtitle">TX-0521</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={view === 'results' ? 'active' : ''}
            onClick={() => setView('results')}
            title="Results"
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Results</span>
          </button>
          <button
            className={view === 'voting' ? 'active' : ''}
            onClick={() => setView('voting')}
            disabled={event.categories.length === 0 || getCars(event).length === 0}
            title="Vote"
          >
            <span className="nav-icon">🗳️</span>
            <span className="nav-label">Vote</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-row">
            <button
              className={`sidebar-nav-btn ${view === 'setup' ? 'active' : ''}`}
              onClick={() => setView('setup')}
              title="Setup"
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Setup</span>
            </button>

            <button
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse sidebar"
            >
              ◀
            </button>
          </div>

          <button
            className="expand-btn"
            onClick={() => setSidebarCollapsed(false)}
            title="Expand sidebar"
          >
            ▶
          </button>
        </div>
      </aside>

      <main>
        <header className="main-header">
          <h1>
            {view === 'results' && '📊 Results'}
            {view === 'voting' && '🗳️ Enter Votes'}
            {view === 'setup' && '⚙️ Event Setup'}
          </h1>

          <div className="header-event-selector">
            <button
              className="event-selector-btn"
              onClick={() => setShowEventPicker(!showEventPicker)}
            >
              <span className="event-name">{event.name}</span>
              <span className="event-date">{event.eventDate}</span>
              <span className="dropdown-arrow">{showEventPicker ? '▲' : '▼'}</span>
            </button>

            {showEventPicker && (
              <div className="event-picker-dropdown">
                <div className="event-list">
                  {allEvents.map((e) => (
                    <button
                      key={e.id || e.year}
                      className={`event-option ${(e.id || e.year) === (event.id || event.year) ? 'active' : ''}`}
                      onClick={() => handleSelectEvent(e)}
                    >
                      <span className="event-option-name">{e.name}</span>
                      <span className="event-option-date">{e.eventDate || e.year}</span>
                    </button>
                  ))}
                </div>
                <div className="event-create">
                  <h4>Create New Event</h4>
                  <input
                    type="text"
                    placeholder="Event name..."
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                  />
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
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

        <div className="main-content">
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

              <div className="danger-zone">
                <h3>⚠️ Danger Zone</h3>
                <div className="danger-zone-content">
                  <div className="danger-zone-item">
                    <div className="danger-zone-info">
                      <strong>Delete this event</strong>
                      <p>Permanently delete "{event.name}" and all its votes. This cannot be undone.</p>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Event
                    </button>
                  </div>
                </div>
              </div>

              {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h3>Delete Event?</h3>
                    <p>Are you sure you want to delete <strong>{event.name}</strong>?</p>
                    <p className="warning-text">This will permanently delete all votes and data for this event.</p>
                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                      </button>
                      <button className="btn btn-danger" onClick={() => {
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
