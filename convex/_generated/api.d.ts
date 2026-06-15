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
import type * as classrooms from "../classrooms.js";
import type * as community from "../community.js";
import type * as contact from "../contact.js";
import type * as courses from "../courses.js";
import type * as dashboard from "../dashboard.js";
import type * as ecosystem from "../ecosystem.js";
import type * as homeworks from "../homeworks.js";
import type * as news from "../news.js";
import type * as onboarding from "../onboarding.js";
import type * as progress from "../progress.js";
import type * as purchases from "../purchases.js";
import type * as supportRateLimit from "../supportRateLimit.js";
import type * as teacherApplications from "../teacherApplications.js";
import type * as transactions from "../transactions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bookOrders: typeof bookOrders;
  classrooms: typeof classrooms;
  community: typeof community;
  contact: typeof contact;
  courses: typeof courses;
  dashboard: typeof dashboard;
  ecosystem: typeof ecosystem;
  homeworks: typeof homeworks;
  news: typeof news;
  onboarding: typeof onboarding;
  progress: typeof progress;
  purchases: typeof purchases;
  supportRateLimit: typeof supportRateLimit;
  teacherApplications: typeof teacherApplications;
  transactions: typeof transactions;
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
