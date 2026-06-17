import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.daily(
  'consultation reminders',
  { hourUTC: 8, minuteUTC: 0 },
  internal.experts.sendConsultationReminders,
  {}
);

export default crons;
