import { useState, Fragment } from 'react';
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

  // Colors for places - derby themed
  const placeColors = {
    1: 'bg-derby-green',
    2: 'bg-maroon',
    3: 'bg-primary',
    4: 'bg-derby-tan',
    5: 'bg-derby-brown',
  };

  // Place 4 (tan) needs dark text
  const placeTextColors = {
    4: 'text-text-primary',
  };

  return (
    <div className={`${isPresentation ? 'max-w-[1400px] mx-auto' : ''}`}>
      <div className="flex justify-end items-center mb-4">
        {isPresentation && <h2 className="text-5xl font-bold text-primary text-center flex-1">📊 Results</h2>}
        {!isPresentation && onPresentationMode && (
          <button className="px-4 py-2 bg-primary text-white font-medium rounded hover:bg-primary-dark transition-colors" onClick={onPresentationMode}>
            🖥️ Presentation Mode
          </button>
        )}
      </div>

      <h3 className={`font-semibold text-text-primary ${isPresentation ? 'text-3xl mb-2 text-center' : 'text-xl mb-1'}`}>{event.name}</h3>
      <div className={`flex items-center justify-between mb-6 ${isPresentation ? 'justify-center gap-8' : ''}`}>
        <p className={`text-text-light ${isPresentation ? 'text-xl' : ''}`}>Total votes: {votes.length}</p>
        {Object.keys(event.carNames || {}).length > 0 && (
          <label className={`flex items-center gap-2 cursor-pointer font-medium text-text-primary ${isPresentation ? 'text-lg' : ''}`}>
            <input
              type="checkbox"
              checked={showCarNames}
              onChange={(e) => setShowCarNames(e.target.checked)}
              className={`accent-primary ${isPresentation ? 'w-5 h-5' : 'w-4 h-4'}`}
            />
            Show car names
          </label>
        )}
      </div>

      {event.categories.length === 0 ? (
        <p className="text-text-light italic">No categories set up yet.</p>
      ) : (
        <div className={`space-y-6 ${isPresentation ? 'space-y-8' : ''}`}>
          {event.categories.map((category) => {
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
              <div key={category} className={`bg-surface p-6 rounded-lg shadow ${isPresentation ? 'p-8' : ''}`}>
                <h4 className={`font-semibold text-text-primary flex flex-wrap items-center justify-between gap-3 mb-4 ${isPresentation ? 'text-2xl mb-6' : 'text-base'}`}>
                  {category}
                  {winner && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 bg-derby-green text-white rounded font-semibold ${isPresentation ? 'text-lg px-4 py-2' : 'text-sm'}`}>
                      🏆 Car {winner.cars.join(', ')} ({winner.votes} votes)
                    </span>
                  )}
                </h4>

                <div className={`grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center ${isPresentation ? 'gap-x-6 gap-y-3' : ''}`}>
                  {sortedCars.length === 0 ? (
                    <p className="text-text-light italic col-span-2">No votes yet</p>
                  ) : (
                    sortedCars.map(([car, votes], index) => {
                      const place = getPlace(index, votes);
                      return (
                        <Fragment key={car}>
                          <span className={`font-medium text-text-primary text-sm truncate max-w-[200px] ${isPresentation ? 'max-w-[400px] text-xl' : ''}`}>{getCarDisplay(car)}</span>
                          <div className={`h-7 ${isPresentation ? 'h-12' : ''}`}>
                            <div
                              className={`h-full ${placeColors[place] || 'bg-primary/50'} flex items-center justify-end pr-2.5 rounded transition-all duration-500`}
                              style={{ width: `${(votes / maxVotes) * 100}%`, minWidth: 'fit-content' }}
                            >
                              <span className={`font-semibold text-sm ${placeTextColors[place] || 'text-white'} ${isPresentation ? 'text-xl' : ''}`}>{votes}</span>
                            </div>
                          </div>
                        </Fragment>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

