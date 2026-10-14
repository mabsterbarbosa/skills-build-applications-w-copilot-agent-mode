import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Activity input is required'), { status: 400 });
  }

  const body = input as Record<string, unknown>;
  const { userId, teamId, type, minutes } = body;
  const isObjectId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
  if (!isObjectId(userId) || !isObjectId(teamId) || typeof type !== 'string' || type.trim().length === 0 || typeof minutes !== 'number' || !Number.isFinite(minutes)) {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  const points = body.points === undefined ? Math.max(1, minutes) : body.points;
  const occurredAt = body.occurredAt === undefined ? new Date() : new Date(String(body.occurredAt));
  if (typeof points !== 'number' || !Number.isFinite(points) || points <= 0 || Number.isNaN(occurredAt.getTime())) {
    throw Object.assign(new Error('Invalid activity points or date'), { status: 400 });
  }

  return Activity.create({ user: user._id, team: team._id, type, minutes, points, occurredAt });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Team input is required'), { status: 400 });
  }

  const body = input as Record<string, unknown>;
  const { name, mascot } = body;
  const members = body.members ?? [];
  if (typeof name !== 'string' || name.trim().length === 0 || typeof mascot !== 'string' || mascot.trim().length === 0 || !Array.isArray(members)) {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }

  const isObjectId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
  if (!members.every(isObjectId)) {
    throw Object.assign(new Error('Team members must be valid user IDs'), { status: 400 });
  }

  const memberUsers = await User.find({ _id: { $in: members } }).select('_id');
  if (new Set(memberUsers.map((member) => member._id.toString())).size !== new Set(members).size) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({ name, mascot, members });
}

export async function getLeaderboard() {
  const activityTotals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  const teams = await Team.find({ _id: { $in: activityTotals.map(({ _id }) => _id) } }).select('name').lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name] as const));

  return activityTotals
    .flatMap(({ _id, totalPoints }) => {
      const teamName = teamNames.get(_id.toString());
      return teamName === undefined ? [] : [{ teamName, totalPoints }];
    })
    .sort((left, right) => right.totalPoints - left.totalPoints)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('_id fitnessGoal').lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).select('type').lean(),
    Workout.find().lean(),
  ]);
  const goal = user.fitnessGoal.toLowerCase();
  const activityType = activity?.type.toLowerCase();

  return workouts
    .map((workout) => {
      const focus = workout.focus.toLowerCase();
      const title = workout.title?.toLowerCase() ?? '';
      const goalMatch = focus === goal;
      const activityMatch = activityType !== undefined && (focus === activityType || title.includes(activityType));
      return { workout, score: Number(goalMatch) * 2 + Number(activityMatch) };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ workout }) => ({
      ...workout,
      reason: `Recommended for your ${goal} goal${activityType ? ` and ${activityType} activity` : ''}.`,
    }));
}

export { User };
