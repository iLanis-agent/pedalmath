/* PedalMath engine - cycling power math: FTP, zones, watts/kg, power-to-speed physics.
   Pure math, no DOM. Shared by app.html and the node test suite. */
(function (root) {
  'use strict';

  var G = 9.81;
  var DEFAULTS = { cda: 0.32, crr: 0.005, rho: 1.225 }; // hoods position, decent clinchers, sea level

  // FTP from a 20-minute all-out test: 95% of average watts.
  function ftpFrom20min(watts) {
    if (!(watts > 0)) return null;
    return watts * 0.95;
  }

  // FTP from a ramp test: 75% of best one-minute power.
  function ftpFromRamp(bestMinuteWatts) {
    if (!(bestMinuteWatts > 0)) return null;
    return bestMinuteWatts * 0.75;
  }

  // Coggan-style power zones from FTP. Returns 7 zones with lo/hi watts.
  function zones(ftp) {
    if (!(ftp > 0)) return null;
    var bands = [
      { zone: 'Z1 active recovery', lo: 0, hi: 0.55 },
      { zone: 'Z2 endurance', lo: 0.55, hi: 0.75 },
      { zone: 'Z3 tempo', lo: 0.75, hi: 0.90 },
      { zone: 'Z4 threshold', lo: 0.90, hi: 1.05 },
      { zone: 'Z5 VO2max', lo: 1.05, hi: 1.20 },
      { zone: 'Z6 anaerobic', lo: 1.20, hi: 1.50 },
      { zone: 'Z7 sprint', lo: 1.50, hi: Infinity }
    ];
    return bands.map(function (b) {
      return {
        zone: b.zone,
        lo: Math.round(b.lo * ftp),
        hi: b.hi === Infinity ? null : Math.round(b.hi * ftp)
      };
    });
  }

  function wattsPerKg(watts, kg) {
    if (!(watts > 0) || !(kg > 0)) return null;
    return watts / kg;
  }

  // Rough 60-minute w/kg bands (Coggan chart, simplified; labels honest, not precise).
  function wkgBand(wkg) {
    if (!(wkg > 0)) return null;
    if (wkg < 2.0) return 'untrained - everyone starts here';
    if (wkg < 2.5) return 'recreational rider';
    if (wkg < 3.2) return 'trained club rider';
    if (wkg < 3.9) return 'strong amateur - local group-ride hero';
    if (wkg < 4.6) return 'very strong - regional race pace';
    if (wkg < 5.4) return 'domestic pro territory';
    if (wkg < 6.1) return 'world tour domestique';
    return 'world-class climber - the math stops being polite';
  }

  // Power (watts) needed to hold speed v (m/s) with system mass (kg) on a gradient (fraction).
  function powerForSpeed(v, massKg, gradient, opts) {
    opts = opts || {};
    if (!(v > 0) || !(massKg > 0)) return null;
    var cda = opts.cda === undefined ? DEFAULTS.cda : opts.cda;
    var crr = opts.crr === undefined ? DEFAULTS.crr : opts.crr;
    var rho = opts.rho === undefined ? DEFAULTS.rho : opts.rho;
    var grad = gradient || 0;
    return 0.5 * rho * cda * v * v * v + crr * massKg * G * v + massKg * G * grad * v;
  }

  // Speed (m/s) held for a given power, by bisection on the power curve.
  function speedFromPower(watts, massKg, gradient, opts) {
    if (!(watts > 0) || !(massKg > 0)) return null;
    var lo = 0, hi = 50;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2;
      if (powerForSpeed(mid, massKg, gradient, opts) < watts) lo = mid; else hi = mid;
    }
    return lo;
  }

  // Time (seconds) for a climb of lengthKm at gradient at a steady power.
  function climbTime(watts, massKg, lengthKm, gradient, opts) {
    if (!(lengthKm > 0)) return null;
    var v = speedFromPower(watts, massKg, gradient, opts);
    if (v === null || v <= 0) return null;
    return (lengthKm * 1000) / v;
  }

  // Food calories from work: human cycling efficiency is about 24%, so kJ burned
  // at the pedals lands almost exactly on food kcal. The honest 1:1 rule.
  function kcalFromKj(kj) {
    if (!(kj >= 0)) return null;
    return kj; // 1 kJ at the pedals ~= 1 food kcal at 24% efficiency
  }

  function workKj(watts, seconds) {
    if (!(watts > 0) || !(seconds > 0)) return null;
    return watts * seconds / 1000;
  }

  function fmtDuration(sec) {
    if (!isFinite(sec) || sec < 0) return '-';
    var t = Math.round(sec);
    var h = Math.floor(t / 3600);
    var m = Math.floor((t % 3600) / 60);
    var s = t % 60;
    if (h > 0) return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  var api = {
    DEFAULTS: DEFAULTS,
    ftpFrom20min: ftpFrom20min,
    ftpFromRamp: ftpFromRamp,
    zones: zones,
    wattsPerKg: wattsPerKg,
    wkgBand: wkgBand,
    powerForSpeed: powerForSpeed,
    speedFromPower: speedFromPower,
    climbTime: climbTime,
    kcalFromKj: kcalFromKj,
    workKj: workKj,
    fmtDuration: fmtDuration
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PedalMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
