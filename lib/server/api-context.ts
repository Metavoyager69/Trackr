import { AsyncLocalStorage } from "node:async_hooks";
import type { CurrentUserContext } from "./access-control";

export const apiContextStorage = new AsyncLocalStorage<CurrentUserContext>();

export function getApiContext(): CurrentUserContext | null {
  return apiContextStorage.getStore() ?? null;
}
