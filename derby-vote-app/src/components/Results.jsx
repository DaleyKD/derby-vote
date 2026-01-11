import { useState } from 'react';
import { getVoteTallies, getVotes } from '../storage';

export default function Results({ event, allEvents = [], onSelectEvent, onPresentationMode, isPresentation = false }) {
  const eventId = event.id || event.year;
  const tallies = getVoteTallies(eventId);
  const votes = getVotes(eventId);
  const [showCarNames, setShowCarNames] = useState(true);

  // Find winner for each category
  const getWinner = (category) => {
    const categoryTallies = tallies[category];
    if (!categoryTallies) return null;

    let maxVotes = 0;
    let winners = [];

    Object.entries(categoryTallies).forEach(([car, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        winners = [car];
      } else if (votes === maxVotes && votes > 0) {
        winners.push(car);
      }
    });

    return maxVotes > 0 ? { cars: winners, votes: maxVotes } : null;
  };

  // Get max votes for scaling bars
  const getMaxVotes = (category) => {
    const categoryTallies = tallies[category];
    if (!categoryTallies) return 1;
    return Math.max(1, ...Object.values(categoryTallies));
  };

  // Get car display name
  const getCarDisplay = (carNumber) => {
    const carName = event.carNames?.[carNumber];
    if (showCarNames && carName) {
      return `${carNumber} - ${carName}`;
    }
    return `Car ${carNumber}`;
  };

  return (
    <div className={`results ${isPresentation ? 'presentation' : ''}`}>
      <div className="results-header">
        {isPresentation && <h2>📊 Results</h2>}
        {!isPresentation && onPresentationMode && (
          <button className="presentation-btn" onClick={onPresentationMode}>
            🖥️ Presentation Mode
          </button>
        )}
      </div>

      <div className="results-controls">
        {Object.keys(event.carNames || {}).length > 0 && (
          <label className="show-names-toggle">
            <input
              type="checkbox"
              checked={showCarNames}
              onChange={(e) => setShowCarNames(e.target.checked)}
            />
            Show car names
          </label>
        )}
      </div>

      <h3>{event.name}</h3>
      <p className="total-votes">Total votes: {votes.length}</p>

      {event.categories.length === 0 ? (
        <p className="empty-message">No categories set up yet.</p>
      ) : (
        event.categories.map((category) => {
          const winner = getWinner(category);
          const maxVotes = getMaxVotes(category);
          const categoryTallies = tallies[category] || {};
          
          // Sort cars by vote count (descending), show top 5
          const sortedCars = Object.entries(categoryTallies)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, votes]) => votes > 0)
            .slice(0, 5);

          // Calculate place based on vote count (ties get same place)
          const getPlace = (index, votes) => {
            if (index === 0) return 1;
            // Check if tied with previous
            const prevVotes = sortedCars[index - 1][1];
            if (votes === prevVotes) {
              return getPlace(index - 1, prevVotes);
            }
            return index + 1;
          };

          return (
            <div key={category} className="category-results">
              <h4>
                {category}
                {winner && (
                  <span className="winner-badge">
                    🏆 Car {winner.cars.join(', ')} ({winner.votes} votes)
                  </span>
                )}
              </h4>

              <div className="bar-chart">
                {sortedCars.length === 0 ? (
                  <p className="no-votes">No votes yet</p>
                ) : (
                  sortedCars.map(([car, votes], index) => {
                    const place = getPlace(index, votes);
                    return (
                      <div key={car} className="bar-row">
                        <span className="bar-label">{getCarDisplay(car)}</span>
                        <div className="bar-container">
                          <div
                            className={`bar place-${place}`}
                            style={{ width: `${(votes / maxVotes) * 100}%` }}
                          >
                            <span className="bar-value">{votes}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

