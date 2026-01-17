import { useState, useEffect } from 'react';
import { getEvent, saveEvent, getAllEvents, getCars, createEvent, getEventById, setCurrentEventId, getCurrentEventId, deleteEvent, clearAllData } from './storage';
import { loadTroopConfig, getTroopIdentifier } from './config';
import Setup from './components/Setup';
import Voting from './components/Voting';
import Results from './components/Results';
import DataManager from './components/DataManager';
import { BarChart3, Vote, Settings, ChevronLeft, ChevronRight, Trophy, AlertTriangle, Menu, X } from 'lucide-react';

function App() {
  const currentYear = new Date().getFullYear().toString();
  const [troopConfig] = useState(() => loadTroopConfig());

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Close mobile menu when view changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [view]);

  // Update page title with troop identifier
  useEffect(() => {
    if (troopConfig) {
      document.title = `Worthy Derby Voting | Troop ${getTroopIdentifier(troopConfig)}`;
    }
  }, [troopConfig]);

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

  const handleClearAllData = () => {
    clearAllData();
    // Reset to a fresh state with a new default event
    const newEvent = createEvent(`Worthy Derby ${currentYear}`, new Date().toISOString().split('T')[0]);
    setAllEvents([newEvent]);
    setEvent(newEvent);
    setShowClearAllConfirm(false);
    setView('setup');
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
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile by default, shown as overlay when mobileMenuOpen */}
      <aside className={`
        ${sidebarCollapsed ? 'md:w-14' : 'md:w-60'}
        fixed md:relative inset-y-0 left-0 z-50
        w-64 h-screen bg-primary text-white flex flex-col shrink-0
        transition-transform duration-200 md:transition-all md:duration-200
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <Trophy size={28} className="shrink-0" />
            <div className={`flex flex-col whitespace-nowrap transition-opacity duration-150 ${sidebarCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
              <span className="font-bold text-base tracking-tight">Worthy Derby</span>
              {troopConfig?.troopWebsite ? (
                <a
                  href={troopConfig.troopWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-white/70 font-medium hover:text-white hover:underline transition-colors"
                >
                  Trail Life Troop {getTroopIdentifier(troopConfig)}
                </a>
              ) : (
                <span className="text-[11px] text-white/70 font-medium">
                  Trail Life Troop {troopConfig ? getTroopIdentifier(troopConfig) : 'TX-0521'}
                </span>
              )}
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-2 flex flex-col gap-0.5">
          <button
            className={`flex items-center gap-3 w-full py-3 md:py-2.5 px-3 rounded text-left font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors ${view === 'results' ? 'border-l-6 border-derby-tan bg-white/10 text-white font-bold' : 'border-l-6 border-transparent'} ${sidebarCollapsed ? 'md:justify-center md:px-2.5 md:gap-0' : ''}`}
            onClick={() => setView('results')}
            title="Results"
          >
            <BarChart3 size={20} className="w-6 min-w-6" />
            <span className={`whitespace-nowrap transition-opacity duration-150 ${sidebarCollapsed ? 'md:hidden' : ''}`}>Results</span>
          </button>
          <button
            className={`flex items-center gap-3 w-full py-3 md:py-2.5 px-3 rounded text-left font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${view === 'voting' ? 'border-l-6 border-derby-tan bg-white/10 text-white font-bold' : 'border-l-6 border-transparent'} ${sidebarCollapsed ? 'md:justify-center md:px-2.5 md:gap-0' : ''}`}
            onClick={() => setView('voting')}
            disabled={event.categories.length === 0 || getCars(event).length === 0}
            title="Vote"
          >
            <Vote size={20} className="w-6 min-w-6" />
            <span className={`whitespace-nowrap transition-opacity duration-150 ${sidebarCollapsed ? 'md:hidden' : ''}`}>Vote</span>
          </button>
        </nav>

        <div className={`p-2 border-t border-white/10 flex flex-col`}>
          <div className={`flex items-center gap-1 ${sidebarCollapsed ? 'md:flex-col md:gap-0.5' : ''}`}>
            <button
              className={`flex items-center gap-3 flex-1 py-3 md:py-2.5 px-3 rounded text-left font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors ${view === 'setup' ? 'border-l-6 border-derby-tan bg-white/10 text-white font-bold' : 'border-l-6 border-transparent'} ${sidebarCollapsed ? 'md:w-full md:justify-center md:px-0 md:gap-0' : ''}`}
              onClick={() => setView('setup')}
              title="Setup"
            >
              <Settings size={20} className="w-6 min-w-6" />
              <span className={`whitespace-nowrap transition-opacity duration-150 ${sidebarCollapsed ? 'md:hidden' : ''}`}>Setup</span>
            </button>

            <button
              className={`hidden md:flex w-10 py-2.5 rounded text-white/50 hover:bg-white/10 hover:text-white/85 transition-colors items-center justify-center ${sidebarCollapsed ? '!hidden' : ''}`}
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse sidebar"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              className={`hidden w-full py-2.5 rounded text-white/50 hover:bg-white/10 hover:text-white/85 transition-colors ${sidebarCollapsed ? 'md:flex items-center justify-center' : ''}`}
              onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Troop Info Footer */}
          {(troopConfig?.charterOrg || troopConfig?.troopCity) && (
            <div className={`mt-2 px-3 pt-2 border-t border-white/10 transition-opacity duration-150 ${sidebarCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
              <div className="flex flex-col gap-0.5 text-center">
                {troopConfig?.charterOrg && (
                  troopConfig.charterWebsite ? (
                    <a
                      href={troopConfig.charterWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-white/50 font-normal leading-tight hover:text-white/80 hover:underline transition-colors"
                    >
                      {troopConfig.charterOrg}
                    </a>
                  ) : (
                    <span className="text-[10px] text-white/50 font-normal leading-tight">
                      {troopConfig.charterOrg}
                    </span>
                  )
                )}
                {(troopConfig?.troopCity || troopConfig?.troopState) && (
                  <span className="text-[10px] text-white/50 font-normal leading-tight">
                    {troopConfig.troopCity ? `${troopConfig.troopCity}, ${troopConfig.troopState}` : troopConfig.troopState}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex items-center justify-between gap-2 px-3 md:px-6 py-3 md:py-4 bg-surface border-b border-border shadow-sm">
          {/* Mobile menu button */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-text-primary hover:bg-background rounded transition-colors shrink-0"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <h1 className="text-base md:text-xl font-semibold text-text-primary m-0 flex items-center gap-2 truncate">
            {view === 'results' && <><BarChart3 size={20} className="inline shrink-0 md:w-6 md:h-6" /> <span className="truncate">Results</span></>}
            {view === 'voting' && <><Vote size={20} className="inline shrink-0 md:w-6 md:h-6" /> <span className="truncate">Enter Votes</span></>}
            {view === 'setup' && <><Settings size={20} className="inline shrink-0 md:w-6 md:h-6" /> <span className="truncate">Event Setup</span></>}
          </h1>

          <div className="relative shrink-0">
            <button
              className="flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-2 bg-background border border-border rounded hover:border-primary transition-colors text-left"
              onClick={() => setShowEventPicker(!showEventPicker)}
            >
              <span className="font-semibold text-text-primary text-sm sm:text-base truncate max-w-[100px] sm:max-w-[200px]">{event.name}</span>
              <span className="text-text-light text-xs sm:text-sm hidden xs:inline">{event.eventDate}</span>
              <span className="text-text-light text-xs ml-1">{showEventPicker ? '▲' : '▼'}</span>
            </button>

            {showEventPicker && (
              <div className="absolute top-full right-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 w-[calc(100vw-1.5rem)] sm:w-auto sm:min-w-[300px] max-w-[350px]">
                <div className="max-h-60 overflow-y-auto border-b border-border">
                  {allEvents.map((e) => (
                    <button
                      key={e.id || e.year}
                      className={`flex justify-between items-center w-full px-4 py-3 text-left hover:bg-background transition-colors ${(e.id || e.year) === (event.id || event.year) ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                      onClick={() => handleSelectEvent(e)}
                    >
                      <span className="font-medium text-text-primary truncate">{e.name}</span>
                      <span className="text-text-light text-sm shrink-0 ml-2">{e.eventDate || e.year}</span>
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

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
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
                troopConfig={troopConfig}
              />
              <DataManager onDataImported={handleDataImported} />

              <div className="mt-6 md:mt-8 p-4 md:p-6 bg-surface rounded-lg shadow">
                <h3 className="text-base md:text-lg font-semibold text-danger mb-3 md:mb-4 flex items-center gap-2"><AlertTriangle size={20} /> Danger Zone</h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 p-3 md:p-4 bg-background rounded">
                    <div>
                      <strong className="text-text-primary text-sm md:text-base">Delete this event</strong>
                      <p className="text-text-light text-xs md:text-sm mt-1">Permanently delete "{event.name}" and all its votes. This cannot be undone.</p>
                    </div>
                    <button
                      className="px-4 py-2.5 md:py-2 bg-danger text-white font-semibold rounded hover:bg-danger/80 transition-colors shrink-0 min-h-[44px] md:min-h-0 text-sm w-full sm:w-auto"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Event
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 p-3 md:p-4 bg-background rounded">
                    <div>
                      <strong className="text-text-primary text-sm md:text-base">Clear all local data</strong>
                      <p className="text-text-light text-xs md:text-sm mt-1">Delete all events, votes, and settings from this browser. This cannot be undone.</p>
                    </div>
                    <button
                      className="px-4 py-2.5 md:py-2 bg-danger text-white font-semibold rounded hover:bg-danger/80 transition-colors shrink-0 min-h-[44px] md:min-h-0 text-sm w-full sm:w-auto"
                      onClick={() => setShowClearAllConfirm(true)}
                    >
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>

              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3" onClick={() => setShowDeleteConfirm(false)}>
                  <div className="bg-surface p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-base md:text-lg font-semibold text-text-primary mb-4">Delete Event?</h3>
                    <p className="text-text-primary mb-2 text-sm md:text-base">Are you sure you want to delete <strong>{event.name}</strong>?</p>
                    <p className="text-danger text-xs md:text-sm mb-6">This will permanently delete all votes and data for this event.</p>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                      <button className="px-4 py-2.5 bg-background text-text-primary font-medium rounded hover:bg-border transition-colors min-h-[44px]" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                      </button>
                      <button className="px-4 py-2.5 bg-danger text-white font-semibold rounded hover:bg-danger/80 transition-colors min-h-[44px]" onClick={() => {
                        handleDeleteEvent(event);
                        setShowDeleteConfirm(false);
                      }}>
                        Delete Event
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showClearAllConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3" onClick={() => setShowClearAllConfirm(false)}>
                  <div className="bg-surface p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-base md:text-lg font-semibold text-text-primary mb-4">Clear All Data?</h3>
                    <p className="text-text-primary mb-2 text-sm md:text-base">Are you sure you want to delete <strong>all events and data</strong> from this browser?</p>
                    <p className="text-text-primary text-xs md:text-sm mb-2">Consider exporting a backup first using the Export Data button above.</p>
                    <p className="text-danger text-xs md:text-sm mb-6">This action cannot be undone.</p>
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                      <button className="px-4 py-2.5 bg-background text-text-primary font-medium rounded hover:bg-border transition-colors min-h-[44px]" onClick={() => setShowClearAllConfirm(false)}>
                        Cancel
                      </button>
                      <button className="px-4 py-2.5 bg-danger text-white font-semibold rounded hover:bg-danger/80 transition-colors min-h-[44px]" onClick={handleClearAllData}>
                        Clear All Data
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
