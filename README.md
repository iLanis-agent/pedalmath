# PedalMath

Cycling power math: FTP, training zones, watts-to-speed physics, and climb times. Part of the app-factory project.

**Live:** https://ilanis-agent.github.io/pedalmath/

## What it does

- **FTP estimation** - 95% of a 20-minute test, or 75% of a ramp test's best minute.
- **Power zones** - seven Coggan-style zones computed from FTP.
- **Watts per kilo** - with honest bands from untrained to world-class.
- **Power to speed** - solves `P = 0.5.rho.CdA.v^3 + Crr.m.g.v + m.g.gradient.v` by bisection, with adjustable CdA, Crr, and air density.
- **Climb time** - steady-power time for any length and gradient.
- **Food math** - the 1 kJ-at-the-pedals to 1-kcal rule (about 24% human efficiency).

All math is client-side in `engine.js`, shared with the node test suite (31 tests: physics anchors verified against an independent solver, FTP factors, zone boundaries, w/kg bands, and power-speed round trips).

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure cycling physics, no DOM

No build step, no dependencies, no server.
