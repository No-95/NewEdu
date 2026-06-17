/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bookOrders from "../bookOrders.js";
import type * as career from "../career.js";
import type * as classrooms from "../classrooms.js";
import type * as community from "../community.js";
import type * as contact from "../contact.js";
import type * as courses from "../courses.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as ecosystem from "../ecosystem.js";
import type * as employerOps from "../employerOps.js";
import type * as experts from "../experts.js";
import type * as homeworks from "../homeworks.js";
import type * as lib_careerScore from "../lib/careerScore.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_emailCopy from "../lib/emailCopy.js";
import type * as lib_notificationsHelper from "../lib/notificationsHelper.js";
import type * as lib_recruitmentStages from "../lib/recruitmentStages.js";
import type * as lib_skillGaps from "../lib/skillGaps.js";
import type * as lib_stageEventsHelper from "../lib/stageEventsHelper.js";
import type * as news from "../news.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as progress from "../progress.js";
import type * as purchases from "../purchases.js";
import type * as supportRateLimit from "../supportRateLimit.js";
import type * as teacherApplications from "../teacherApplications.js";
import type * as teacherOps from "../teacherOps.js";
import type * as tests from "../tests.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bookOrders: typeof bookOrders;
  career: typeof career;
  classrooms: typeof classrooms;
  community: typeof community;
  contact: typeof contact;
  courses: typeof courses;
  crons: typeof crons;
  dashboard: typeof dashboard;
  ecosystem: typeof ecosystem;
  employerOps: typeof employerOps;
  experts: typeof experts;
  homeworks: typeof homeworks;
  "lib/careerScore": typeof lib_careerScore;
  "lib/email": typeof lib_email;
  "lib/emailCopy": typeof lib_emailCopy;
  "lib/notificationsHelper": typeof lib_notificationsHelper;
  "lib/recruitmentStages": typeof lib_recruitmentStages;
  "lib/skillGaps": typeof lib_skillGaps;
  "lib/stageEventsHelper": typeof lib_stageEventsHelper;
  news: typeof news;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  progress: typeof progress;
  purchases: typeof purchases;
  supportRateLimit: typeof supportRateLimit;
  teacherApplications: typeof teacherApplications;
  teacherOps: typeof teacherOps;
  tests: typeof tests;
  transactions: typeof transactions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
