# Conversation Prompts

This file collates all user prompts used to build and configure this application, listed in chronological order.

---

## Prompt 1 — Initial Frontend Application

```text
1. build me a singapore base bus application that tracks real time bus arrival times and includes search bar to input bus stop code for quik access to arrival data and favourites fucntionality. build just the front end for now, i will establish an api connection later. 

2. build just the front end for now, i will establish an api connection later
```

---

## Prompt 2 — LTA DataMall v3 Serverless Integration

```text
1. add a serverless connection that pulls data from LTA's data mall and using the following end points: 

# Next buses at a stop (v3, the current version; refreshes every 20 seconds):
https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
# To ask about one service only, add &ServiceNo=7

# Every request needs the header:  AccountKey: <LTA_ACCOUNT_KEY>

2. Store this in /api at project root levet (not the src file) 
3. include a /health.ts and /busarrival.ts within the same subfolder 
4. Do not hardcode any key, I will input them manually.
```

---

## Prompt 3 — Fix Vercel `npm install` Peer Dependency Conflict

```text
fix please: 

10:17:40.695 Running build in Washington, D.C., USA (East) – iad1
10:17:40.696 Build machine configuration: 2 cores, 8 GB
10:17:40.840 Cloning github.com/yueyanggg/bus-when- (Branch: main, Commit: 55a6b29)
10:17:40.842 Previous build caches not available.
10:17:41.128 Cloning completed: 287.000ms
10:17:42.333 Running "vercel build"
10:17:42.350 Vercel CLI 66.6.0
10:17:43.242 Installing dependencies...
10:17:44.218 npm warn Unknown env config "cache-dir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
10:17:58.121 npm error code ERESOLVE
10:17:58.121 npm error ERESOLVE could not resolve
10:17:58.122 npm error
10:17:58.122 npm error Found: esbuild@0.25.12
10:17:58.123 npm error node_modules/esbuild
10:17:58.123 npm error   dev esbuild@"^0.25.0" from the root project
10:17:58.123 npm error
10:17:58.123 npm error Could not resolve dependency:
10:17:58.123 npm error peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.4.0
10:17:58.123 npm error node_modules/vite
10:17:58.123 npm error   vite@"^8.3.0" from the root project
10:17:58.124 npm error   peer vite@"^5.2.0 || ^6 || ^7 || ^8" from @tailwindcss/vite@4.3.5
10:17:58.124 npm error   node_modules/@tailwindcss/vite
10:17:58.124 npm error     @tailwindcss/vite@"^4.3.3" from the root project
10:17:58.125 npm error   1 more (@vitejs/plugin-react)
10:17:58.125 npm error
10:17:58.125 npm error Conflicting peer dependency: esbuild@0.28.2
10:17:58.125 npm error node_modules/tsx/node_modules/esbuild
10:17:58.125 npm error   peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.4.0
10:17:58.125 npm error   node_modules/vite
10:17:58.125 npm error     vite@"^8.3.0" from the root project
10:17:58.126 npm error     peer vite@"^5.2.0 || ^6 || ^7 || ^8" from @tailwindcss/vite@4.3.5
10:17:58.126 npm error     node_modules/@tailwindcss/vite
10:17:58.126 npm error       @tailwindcss/vite@"^4.3.3" from the root project
10:17:58.126 npm error     1 more (@vitejs/plugin-react)
10:17:58.127 npm error
10:17:58.127 npm error Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution.
10:17:58.127 npm error
10:17:58.128 npm error
10:17:58.128 npm error For a full report see:
10:17:58.128 npm error /vercel/.npm/_logs/2026-11-27T02_17_43_581Z-eresolve-report.txt
10:17:58.128 npm error A complete log of this run can be found in: /vercel/.npm/_logs/2026-11-27T02_17_43_581Z-debug-0.log
10:17:58.181 Error: [BUILD_UTILS_SPAWN_1] Command "npm install" exited with 1
```

---

## Prompt 4 — Collate Prompts

```text
collate all prompts and store them in PROMPTS.md file
```
