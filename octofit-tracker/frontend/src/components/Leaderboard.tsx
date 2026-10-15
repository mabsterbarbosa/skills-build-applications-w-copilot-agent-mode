import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: Ranking[] };
type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; rankings: Ranking[] };

export default function Leaderboard() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    getJson<LeaderboardResponse>('/api/leaderboard')
      .then(({ leaderboard }) => {
        if (isMounted) setState({ status: 'success', rankings: leaderboard });
      })
      .catch(() => {
        if (isMounted) setState({ status: 'error' });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {state.status === 'loading' && <p role="status">Loading leaderboard...</p>}
        {state.status === 'error' && <p role="alert">Unable to load leaderboard.</p>}
        {state.status === 'success' && state.rankings.length === 0 && <p>No leaderboard rankings yet.</p>}
        {state.status === 'success' && state.rankings.length > 0 && (
          <ol>
            {state.rankings.map((ranking) => (
              <li key={ranking.rank}>
                {ranking.teamName} — {ranking.totalPoints} points
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
