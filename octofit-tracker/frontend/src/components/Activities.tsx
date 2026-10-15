import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };
type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; activities: Activity[] };

export default function Activities() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    getJson<ActivitiesResponse>('/api/activities')
      .then(({ activities }) => {
        if (isMounted) setState({ status: 'success', activities });
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
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {state.status === 'loading' && <p role="status">Loading activities...</p>}
        {state.status === 'error' && <p role="alert">Unable to load activities.</p>}
        {state.status === 'success' && state.activities.length === 0 && <p>No activities yet.</p>}
        {state.status === 'success' && state.activities.length > 0 && (
          <ul>
            {state.activities.map((activity, index) => (
              <li key={`${activity.type}-${index}`}>
                {activity.type} — {activity.minutes} minutes, {activity.points} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
