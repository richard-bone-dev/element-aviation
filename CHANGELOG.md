This file explains how Visual Studio created the project.

## 2026-05-08

- Corrected Phase 1 rota-hour assumptions: weekend on-call now runs Friday 22:00 ET to Monday 04:00 ET; the 11 May 2026 week anchors AS early/on-call and RS late; DP works Saturday 04:00-07:00 ET; AS childcare windows are excluded from assignments with RS shown as generated cover where needed.
- Expanded the early-shift pattern to 09:30-16:30 ET and added an AS late-shift 10:00-11:00 ET fairness-start block.

The following steps were used to generate this project:
- Create project file (`element-aviation.esproj`).
- Create `launch.json` to enable debugging.
- Install npm packages: `npm init && npm i --save-dev eslint`.
- Create `app.js`.
- Update `package.json` entry point.
- Create `eslint.config.js` to enable linting.
- Add project to solution.
- Write this file.
