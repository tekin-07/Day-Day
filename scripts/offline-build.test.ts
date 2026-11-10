import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { workerSource } from "./offline-build";

function worker(failInstall = false, dirty: boolean | null = null) {
  const stores = new Map<string, Map<string, Response>>();
  const varyByOrigin = new Set<string>();
  stores.set(
    "gungun-https%3A%2F%2Fexample.test%2F::old",
    new Map([["https://example.test/index.html", new Response("old")]]),
  );
  const handlers: Record<string, (event: unknown) => void> = {};
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (key: string) => stores.delete(key),
    open: async (key: string) => {
      if (!stores.has(key)) stores.set(key, new Map());
      const store = stores.get(key);
      if (!store) throw new Error("Missing mock cache");
      return {
        addAll: async (paths: string[]) => {
          if (failInstall) throw new Error("failed asset");
          for (const path of paths) store.set(path, new Response("new"));
        },
        match: async (request: Request | string, options?: CacheQueryOptions) => {
          const url = typeof request === "string" ? request : request.url;
          if (
            varyByOrigin.has(url) &&
            !options?.ignoreVary &&
            typeof request !== "string" &&
            request.headers.has("origin")
          )
            return undefined;
          return store.get(url)?.clone();
        },
      };
    },
  };
  let activated = false;
  const client = {
    id: "client1",
    postMessage: (data: { requestId: number }) => {
      handlers.message({
        source: { id: "client1" },
        data: { type: "CLIENT_STATE", dirty, version: "old", requestId: data.requestId },
      });
    },
  };
  const self = {
    registration: { scope: "https://example.test/" },
    location: { origin: "https://example.test" },
    clients: { matchAll: async () => (dirty === null ? [] : [client]) },
    addEventListener: (name: string, fn: (event: unknown) => void) => {
      handlers[name] = fn;
    },
    skipWaiting: async () => {
      activated = true;
    },
  };
  runInNewContext(workerSource(["./index.html"], "v1"), {
    self,
    caches,
    URL,
    Response,
    Request,
    Map,
    setTimeout,
    clearTimeout,
  });
  return { stores, varyByOrigin, handlers, activated: () => activated };
}

describe("native offline worker", () => {
  it("always precaches the app shell for navigation fallback", () => {
    expect(workerSource([], "v1")).toContain('"./index.html"');
  });

  it("refuses activation while any responding client has dirty input", async () => {
    const runtime = worker(false, true);
    let pending: Promise<unknown> | undefined;
    runtime.handlers.message({
      data: { type: "ACTIVATE" },
      waitUntil: (value: Promise<unknown>) => {
        pending = value;
      },
    });
    await pending;
    expect(runtime.activated()).toBe(false);
  });
  it("activates only after a clean client acknowledges the current probe", async () => {
    const runtime = worker(false, false);
    let pending: Promise<unknown> | undefined;
    runtime.handlers.message({
      data: { type: "ACTIVATE" },
      waitUntil: (value: Promise<unknown>) => {
        pending = value;
      },
    });
    await pending;
    expect(runtime.activated()).toBe(true);
  });
  it("reclaims unused versions at the cap without evicting an open window version", async () => {
    const runtime = worker(false, false);
    const prefix = "gungun-https%3A%2F%2Fexample.test%2F::";
    runtime.stores.set(`${prefix}unused1`, new Map());
    runtime.stores.set(`${prefix}unused2`, new Map());
    let pending: Promise<unknown> | undefined;
    runtime.handlers.install({
      waitUntil: (value: Promise<unknown>) => {
        pending = value;
      },
    });
    await pending;
    expect(runtime.stores.has(`${prefix}old`)).toBe(true);
    expect(runtime.stores.has(`${prefix}v1`)).toBe(true);
    expect(runtime.stores.size).toBe(3);
  });
  it("isolates root and nested service worker caches", async () => {
    const { stores, handlers } = worker();
    const nested = "gungun-/app/kept";
    stores.set(nested, new Map());
    let pending: Promise<unknown> | undefined;
    handlers.activate({
      waitUntil: (value: Promise<unknown>) => {
        pending = value;
      },
    });
    await pending;
    expect(stores.has(nested)).toBe(true);
  });
  it("returns cached navigation without a runtime network fallback", async () => {
    const { handlers } = worker();
    let response: Promise<Response> | undefined;
    handlers.fetch({
      request: { method: "GET", url: "https://example.test/a-route", mode: "navigate" },
      respondWith: (value: Promise<Response>) => {
        response = value;
      },
    });
    expect(await (await response)?.text()).toBe("old");
  });
  it("serves pre-cached assets despite an Origin variance header", async () => {
    const runtime = worker();
    const url = "https://example.test/assets/app.js";
    runtime.stores
      .get("gungun-https%3A%2F%2Fexample.test%2F::old")
      ?.set(url, new Response("cached asset"));
    runtime.varyByOrigin.add(url);
    let response: Promise<Response> | undefined;
    runtime.handlers.fetch({
      request: new Request(url, { headers: { Origin: "https://example.test" } }),
      respondWith: (value: Promise<Response>) => {
        response = value;
      },
    });
    expect(await (await response)?.text()).toBe("cached asset");
  });
  it("rolls failed install back without clearing the working cache", async () => {
    const { stores, handlers } = worker(true);
    let pending: Promise<unknown> | undefined;
    handlers.install({
      waitUntil: (value: Promise<unknown>) => {
        pending = value;
      },
    });
    await expect(pending).rejects.toThrow("failed asset");
    expect(stores.has("gungun-https%3A%2F%2Fexample.test%2F::old")).toBe(true);
    expect(stores.has("gungun-https%3A%2F%2Fexample.test%2F::v1")).toBe(false);
  });
});
