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
import type * as community from "../community.js";
import type * as contact from "../contact.js";
import type * as courses from "../courses.js";
import type * as homeworks from "../homeworks.js";
import type * as progress from "../progress.js";
import type * as purchases from "../purchases.js";
import type * as teacherApplications from "../teacherApplications.js";
import type * as transactions from "../transactions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  community: typeof community;
  contact: typeof contact;
  courses: typeof courses;
  homeworks: typeof homeworks;
  progress: typeof progress;
  purchases: typeof purchases;
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
