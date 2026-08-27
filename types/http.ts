// Async request state, shared by every client-side fetch in the app.
//
// One shape, so a loading spinner, an error box and an empty state look and
// behave the same wherever data is being fetched. Before this each component
// invented its own `loading` boolean and quietly dropped failures.

export interface ApiError {
  /** HTTP status, or 0 when the request never reached the server. */
  status: number;
  /** Message safe to show a learner. */
  message: string;
  /** Machine-readable reason from the route, when it gave one. */
  reason?: string;
}

/**
 * A request in one of its four states.
 *
 * "idle" and "loading" are distinct on purpose: a screen that has not asked
 * for anything yet should not show a skeleton, and one that has should not
 * show an empty state.
 */
export type AsyncState<T> =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: T | null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: T | null; error: ApiError };
