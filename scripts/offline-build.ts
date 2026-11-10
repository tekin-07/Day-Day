import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

export function workerSource(assets: string[], version: string): string {
  return `
const PREFIX = 'gungun-' + encodeURIComponent(self.registration.scope) + '::';
const CACHE = PREFIX + ${JSON.stringify(version)};
const ASSETS = ${JSON.stringify([...new Set(["./index.html", ...assets])])}.map(path => new URL(path, self.registration.scope).href);
const states = new Map();
let probe = 0;
async function clientStates() {
  const id = ++probe;
  const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for (const client of windows) client.postMessage({type:'UPDATE_CHECK',requestId:id});
  if (windows.length) await new Promise(resolve => setTimeout(resolve, 250));
  return {windows,id};
}
async function makeRoom(keys) {
  if (keys.length < 3) return;
  const {windows,id} = await clientStates();
  const known = windows.every(client => states.get(client.id)?.requestId === id && states.get(client.id)?.version);
  if (!known) throw new Error('UPDATE_STORAGE_LIMIT');
  const protectedKeys = new Set(windows.map(client => PREFIX + states.get(client.id).version));
  for (const key of keys) {
    if (keys.length < 3) break;
    if (!protectedKeys.has(key)) { await caches.delete(key); keys.splice(keys.indexOf(key),1); }
  }
  if (keys.length >= 3) throw new Error('UPDATE_STORAGE_LIMIT');
}
async function install() {
  const keys = (await caches.keys()).filter(key => key.startsWith(PREFIX));
  await makeRoom(keys);
  const cache = await caches.open(CACHE);
  try { await cache.addAll(ASSETS); }
  catch(error) { await caches.delete(CACHE); throw error; }
}
async function offline(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return Response.error();
  const keys = (await caches.keys()).filter(key => key.startsWith(PREFIX));
  keys.sort(key => key === CACHE ? -1 : 1);
  for (const key of keys) {
    const found = await (await caches.open(key)).match(request, {ignoreVary:true});
    if (found) return found;
  }
  if (request.mode === 'navigate') {
    for (const key of keys) {
      const found = await (await caches.open(key)).match(new URL('./index.html', self.registration.scope).href, {ignoreVary:true});
      if (found) return found;
    }
  }
  return Response.error();
}
async function activation() {
  const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
  if (!windows.length) for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
}
async function requestActivation() {
  const {windows,id} = await clientStates();
  if (windows.every(client => states.get(client.id)?.requestId === id && states.get(client.id)?.dirty === false)) await self.skipWaiting();
  else for (const client of windows) client.postMessage({type:'UPDATE_BLOCKED'});
}
self.addEventListener('install', event => event.waitUntil(install()));
self.addEventListener('activate', event => event.waitUntil(activation()));
self.addEventListener('fetch', event => {
  if (event.request.method === 'GET') event.respondWith(offline(event.request));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'CLIENT_STATE' && event.source?.id) states.set(event.source.id, event.data);
  if (event.data?.type === 'ACTIVATE') event.waitUntil(requestActivation());
});
`;
}

function publicFiles(directory: string, prefix = ""): string[] {
  return readdirSync(directory).flatMap((name) => {
    const relative = `${prefix}${name}`;
    return statSync(join(directory, name)).isDirectory()
      ? publicFiles(join(directory, name), `${relative}/`)
      : [relative];
  });
}

export function offlineBuild(): Plugin {
  let directory = "";
  return {
    name: "gungun-offline",
    apply: "build",
    configResolved(config) {
      directory = config.publicDir;
    },
    transformIndexHtml(html) {
      const policy =
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'";
      return html.replace(
        "<head>",
        `<head><meta http-equiv="Content-Security-Policy" content="${policy}">`,
      );
    },
    generateBundle(_options, bundle) {
      const names = [...Object.keys(bundle), ...publicFiles(directory)];
      const hash = createHash("sha256").update(workerSource([], ""));
      for (const name of names.sort()) {
        const asset = bundle[name];
        hash.update(name);
        hash.update(
          asset
            ? asset.type === "chunk"
              ? asset.code
              : asset.source
            : readFileSync(join(directory, name)),
        );
      }
      const html = bundle["index.html"];
      const version = hash.digest("hex").slice(0, 16);
      if (html?.type === "asset")
        html.source = String(html.source).replace(
          "<head>",
          `<head><meta name="gungun-build" content="${version}">`,
        );
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: workerSource(
          names.map((name) => `./${name}`),
          version,
        ),
      });
    },
  };
}
