import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; members: string[] };
type TeamsResponse = { teams: Team[] };
type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; teams: Team[] };

export default function Teams() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    getJson<TeamsResponse>('/api/teams')
      .then(({ teams }) => {
        if (isMounted) setState({ status: 'success', teams });
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
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {state.status === 'loading' && <p role="status">Loading teams...</p>}
        {state.status === 'error' && <p role="alert">Unable to load teams.</p>}
        {state.status === 'success' && state.teams.length === 0 && <p>No teams yet.</p>}
        {state.status === 'success' && state.teams.length > 0 && (
          <ul>
            {state.teams.map((team) => (
              <li key={team.name}>
                {team.name} — {team.members.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
