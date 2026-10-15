import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Suggestion = { title: string; reason: string; focus?: string };
type SuggestionsResponse = { suggestions: Suggestion[] };
type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; suggestions: Suggestion[] };

export default function Workouts() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;
    const userEmail = encodeURIComponent('mona@example.com');

    getJson<SuggestionsResponse>(`/api/workouts/suggestions/${userEmail}`)
      .then(({ suggestions }) => {
        if (isMounted) setState({ status: 'success', suggestions });
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
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {state.status === 'loading' && <p role="status">Loading workout suggestions...</p>}
        {state.status === 'error' && <p role="alert">Unable to load workout suggestions.</p>}
        {state.status === 'success' && state.suggestions.length === 0 && <p>No workout suggestions yet.</p>}
        {state.status === 'success' && state.suggestions.length > 0 && (
          <ul>
            {state.suggestions.map((suggestion) => (
              <li key={suggestion.title}>
                <strong>{suggestion.title}</strong>
                {suggestion.focus && <> — {suggestion.focus}</>}
                <p>{suggestion.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
