/**
 * EPIDEMIC CALCULATOR — script.js
 * SIR (Susceptible-Infected-Recovered) Model with optional SIRD + Vaccination
 *
 * Compartments:
 *   S  – Susceptible
 *   I  – Infected
 *   R  – Recovered
 *   D  – Deceased  (if mortality rate > 0)
 *   V  – Vaccinated (Scenario B only)
 *
 * Euler method, daily time steps.
 */

'use strict';

/* ── DEFAULT PARAMETERS ──────────────────────────────────── */
const DEFAULTS = {
    population: 1_000_000,
    initialInfected: 100,
    initialRecovered: 0,
    beta: 0.30,   // transmission rate
    gamma: 0.10,   // recovery rate
    mortalityRate: 0.01,   // case fatality fraction
    vaccinationRate: 0.005,  // daily fraction of S vaccinated
    vaccineEfficacy: 0.90,   // proportion of vaccines that confer immunity
    days: 365,
};

/* ── ELEMENT REFERENCES ──────────────────────────────────── */
const els = {
    population: document.getElementById('population'),
    initialInfected: document.getElementById('initialInfected'),
    initialRecovered: document.getElementById('initialRecovered'),
    beta: document.getElementById('beta'),
    gamma: document.getElementById('gamma'),
    mortalityRate: document.getElementById('mortalityRate'),
    vaccinationRate: document.getElementById('vaccinationRate'),
    vaccineEfficacy: document.getElementById('vaccineEfficacy'),
    days: document.getElementById('days'),

    populationVal: document.getElementById('populationVal'),
    initialInfectedVal: document.getElementById('initialInfectedVal'),
    initialRecoveredVal: document.getElementById('initialRecoveredVal'),
    betaVal: document.getElementById('betaVal'),
    gammaVal: document.getElementById('gammaVal'),
    mortalityRateVal: document.getElementById('mortalityRateVal'),
    vaccinationRateVal: document.getElementById('vaccinationRateVal'),
    vaccineEfficacyVal: document.getElementById('vaccineEfficacyVal'),
    daysVal: document.getElementById('daysVal'),

    r0Val: document.getElementById('r0Val'),
    infectiousPeriod: document.getElementById('infectiousPeriod'),
    herdImmunity: document.getElementById('herdImmunity'),

    // Scenario A metrics
    aPeakInfected: document.getElementById('a-peakInfected'),
    aPeakDay: document.getElementById('a-peakDay'),
    aTotalInfected: document.getElementById('a-totalInfected'),
    aTotalRecovered: document.getElementById('a-totalRecovered'),
    aTotalDeaths: document.getElementById('a-totalDeaths'),
    aFinalSusceptible: document.getElementById('a-finalSusceptible'),

    // Scenario B metrics
    bPeakInfected: document.getElementById('b-peakInfected'),
    bPeakDay: document.getElementById('b-peakDay'),
    bTotalInfected: document.getElementById('b-totalInfected'),
    bTotalRecovered: document.getElementById('b-totalRecovered'),
    bTotalDeaths: document.getElementById('b-totalDeaths'),
    bVaccinated: document.getElementById('b-vaccinated'),

    resetBtn: document.getElementById('resetBtn'),
    exportCSV: document.getElementById('exportCSV'),
    exportSummary: document.getElementById('exportSummary'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    themeLabel: document.getElementById('themeLabel'),
    tooltipPopup: document.getElementById('tooltipPopup'),
};

/* ── CHART INSTANCES ─────────────────────────────────────── */
let comparisonChart = null;
let chartA = null;
let chartB = null;

// Stored simulation results for CSV export
let lastResultA = null;
let lastResultB = null;

/* ── UTILITY ─────────────────────────────────────────────── */

/** Format large numbers with comma separators */
function fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return Math.round(n).toLocaleString();
}

/** Format a fraction as percentage */
function pct(f) {
    return (f * 100).toFixed(1) + '%';
}

/** Get current parameter values from sliders */
function getParams() {
    return {
        N: parseFloat(els.population.value),
        I0: parseFloat(els.initialInfected.value),
        R0: parseFloat(els.initialRecovered.value),
        beta: parseFloat(els.beta.value),
        gamma: parseFloat(els.gamma.value),
        mu: parseFloat(els.mortalityRate.value),
        vRate: parseFloat(els.vaccinationRate.value),
        vEff: parseFloat(els.vaccineEfficacy.value),
        days: parseInt(els.days.value),
    };
}

/* ── SIR/SIRD SIMULATION ─────────────────────────────────── */

/**
 * Simulate SIRD model without vaccination.
 *
 * dS/dt = -beta * S * I / N
 * dI/dt =  beta * S * I / N - gamma * I - mu * I
 * dR/dt =  gamma * I
 * dD/dt =  mu * I
 *
 * @returns {Object} Arrays for each compartment indexed by day
 */
function simulateSIRD(params) {
    const { N, I0, R0: Rec0, beta, gamma, mu, days } = params;

    const S = new Float64Array(days + 1);
    const I = new Float64Array(days + 1);
    const R = new Float64Array(days + 1);
    const D = new Float64Array(days + 1);

    // Initial conditions
    S[0] = Math.max(0, N - I0 - Rec0);
    I[0] = I0;
    R[0] = Rec0;
    D[0] = 0;

    for (let t = 0; t < days; t++) {
        const s = S[t], i = I[t];

        // Euler integration
        const newInfections = beta * s * i / N;
        const recoveries = gamma * i;
        const deaths = mu * i;

        S[t + 1] = Math.max(0, s - newInfections);
        I[t + 1] = Math.max(0, i + newInfections - recoveries - deaths);
        R[t + 1] = R[t] + recoveries;
        D[t + 1] = D[t] + deaths;
    }

    return { S, I, R, D };
}

/**
 * Simulate SVIRD model with vaccination (Scenario B).
 *
 * Daily vaccination: fraction vRate of susceptibles get vaccinated.
 * A fraction vEff of those vaccinated become fully immune (moved to V).
 * A fraction (1-vEff) remain susceptible (partial take).
 *
 * dS/dt = -beta * S * I / N  - vRate * S
 * dV/dt =  vEff  * vRate * S
 * dI/dt =  beta * S * I / N - gamma * I - mu * I
 * dR/dt =  gamma * I
 * dD/dt =  mu * I
 *
 * @returns {Object} Arrays for each compartment indexed by day
 */
function simulateSVIRD(params) {
    const { N, I0, R0: Rec0, beta, gamma, mu, vRate, vEff, days } = params;

    const S = new Float64Array(days + 1);
    const V = new Float64Array(days + 1);   // effectively vaccinated
    const I = new Float64Array(days + 1);
    const R = new Float64Array(days + 1);
    const D = new Float64Array(days + 1);

    S[0] = Math.max(0, N - I0 - Rec0);
    I[0] = I0;
    R[0] = Rec0;
    V[0] = 0;
    D[0] = 0;

    for (let t = 0; t < days; t++) {
        const s = S[t], i = I[t];

        const newInfections = beta * s * i / N;
        const vaccinated = vRate * s;              // total doses given
        const immunized = vEff * vaccinated;      // those who gain immunity
        const recoveries = gamma * i;
        const deaths = mu * i;

        S[t + 1] = Math.max(0, s - newInfections - immunized);
        V[t + 1] = V[t] + immunized;
        I[t + 1] = Math.max(0, i + newInfections - recoveries - deaths);
        R[t + 1] = R[t] + recoveries;
        D[t + 1] = D[t] + deaths;
    }

    return { S, V, I, R, D };
}

/* ── METRICS CALCULATION ─────────────────────────────────── */

/** Compute summary metrics from a simulation result */
function computeMetrics(result, params) {
    const { I, R, D, S } = result;
    const days = params.days;

    let peakI = 0;
    let peakDay = 0;

    for (let t = 0; t <= days; t++) {
        if (I[t] > peakI) {
            peakI = I[t];
            peakDay = t;
        }
    }

    const totalRecovered = R[days];
    const totalDeaths = D[days];
    const totalInfected = totalRecovered + totalDeaths; // cumulative (approx)
    const finalS = S[days];
    const vaccinated = result.V ? result.V[days] : 0;

    return { peakI, peakDay, totalInfected, totalRecovered, totalDeaths, finalS, vaccinated };
}

/* ── CHART SETUP ─────────────────────────────────────────── */

/** Derive chart color variables from CSS (adapts to theme) */
function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Build day labels array */
function dayLabels(days) {
    const labels = [];
    for (let i = 0; i <= days; i++) labels.push(i === 0 ? 'Day 0' : i % 50 === 0 || i === days ? `Day ${i}` : '');
    return labels;
}

/** Common chart options */
function commonOptions(days) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                labels: {
                    color: cssVar('--text-secondary'),
                    font: { family: "'DM Mono', monospace", size: 11 },
                    boxWidth: 18,
                    padding: 14,
                }
            },
            tooltip: {
                backgroundColor: cssVar('--bg-card-alt'),
                borderColor: cssVar('--border-strong'),
                borderWidth: 1,
                titleColor: cssVar('--text-primary'),
                bodyColor: cssVar('--text-secondary'),
                padding: 10,
                callbacks: {
                    label(ctx) {
                        return ` ${ctx.dataset.label}: ${Math.round(ctx.parsed.y).toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: cssVar('--text-muted'),
                    font: { family: "'DM Mono', monospace", size: 10 },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 10,
                },
                grid: { color: cssVar('--border') },
            },
            y: {
                ticks: {
                    color: cssVar('--text-muted'),
                    font: { family: "'DM Mono', monospace", size: 10 },
                    callback: v => v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + 'M' :
                        v >= 1_000 ? (v / 1_000).toFixed(0) + 'K' : v,
                },
                grid: { color: cssVar('--border') },
            }
        }
    };
}

/** Create or update the comparison chart (infected curves overlaid) */
function updateComparisonChart(resA, resB, params) {
    const labels = dayLabels(params.days);
    const arrA = Array.from(resA.I);
    const arrB = Array.from(resB.I);

    const data = {
        labels,
        datasets: [
            {
                label: 'Infected — A (No Vaccine)',
                data: arrA,
                borderColor: cssVar('--accent-a'),
                backgroundColor: cssVar('--accent-a') + '22',
                borderWidth: 2,
                fill: true,
                tension: 0.35,
                pointRadius: 0,
            },
            {
                label: 'Infected — B (Vaccinated)',
                data: arrB,
                borderColor: cssVar('--accent-b'),
                backgroundColor: cssVar('--accent-b') + '22',
                borderWidth: 2,
                borderDash: [6, 4],
                fill: true,
                tension: 0.35,
                pointRadius: 0,
            }
        ]
    };

    if (comparisonChart) {
        comparisonChart.data = data;
        comparisonChart.options = commonOptions(params.days);
        comparisonChart.update('none');
    } else {
        comparisonChart = new Chart(document.getElementById('comparisonChart'), {
            type: 'line',
            data,
            options: commonOptions(params.days),
        });
    }
}

/** Create or update Scenario A detail chart */
function updateChartA(resA, params) {
    const labels = dayLabels(params.days);

    const datasets = [
        {
            label: 'Susceptible',
            data: Array.from(resA.S),
            borderColor: cssVar('--accent-s'),
            borderWidth: 1.8,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        },
        {
            label: 'Infected',
            data: Array.from(resA.I),
            borderColor: cssVar('--accent-i'),
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        },
        {
            label: 'Recovered',
            data: Array.from(resA.R),
            borderColor: cssVar('--accent-r'),
            borderWidth: 1.8,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        },
        {
            label: 'Deceased',
            data: Array.from(resA.D),
            borderColor: cssVar('--accent-d'),
            borderWidth: 1.5,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        }
    ];

    const data = { labels, datasets };

    if (chartA) {
        chartA.data = data;
        chartA.options = commonOptions(params.days);
        chartA.update('none');
    } else {
        chartA = new Chart(document.getElementById('chartA'), {
            type: 'line',
            data,
            options: commonOptions(params.days),
        });
    }
}

/** Create or update Scenario B detail chart */
function updateChartB(resB, params) {
    const labels = dayLabels(params.days);

    const datasets = [
        {
            label: 'Susceptible',
            data: Array.from(resB.S),
            borderColor: cssVar('--accent-s'),
            borderWidth: 1.8,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        },
        {
            label: 'Infected',
            data: Array.from(resB.I),
            borderColor: cssVar('--accent-i'),
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        },
        {
            label: 'Recovered',
            data: Array.from(resB.R),
            borderColor: cssVar('--accent-r'),
            borderWidth: 1.8,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        },
        {
            label: 'Vaccinated',
            data: Array.from(resB.V),
            borderColor: cssVar('--accent-v'),
            borderWidth: 1.8,
            borderDash: [4, 3],
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        },
        {
            label: 'Deceased',
            data: Array.from(resB.D),
            borderColor: cssVar('--accent-d'),
            borderWidth: 1.5,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        }
    ];

    const data = { labels, datasets };

    if (chartB) {
        chartB.data = data;
        chartB.options = commonOptions(params.days);
        chartB.update('none');
    } else {
        chartB = new Chart(document.getElementById('chartB'), {
            type: 'line',
            data,
            options: commonOptions(params.days),
        });
    }
}

/* ── METRICS UI UPDATE ───────────────────────────────────── */

function updateMetrics(mA, mB, params) {
    const { beta, gamma } = params;
    const r0 = beta / gamma;
    const infPeriod = 1 / gamma;
    const herd = r0 > 1 ? (1 - 1 / r0) : 0;

    els.r0Val.textContent = r0.toFixed(2);
    els.infectiousPeriod.textContent = infPeriod.toFixed(1) + ' d';
    els.herdImmunity.textContent = pct(herd);

    // Color R0 by risk
    els.r0Val.style.color = r0 < 1 ? '#4db8ff' : r0 < 2 ? '#f5c542' : '#e05a5a';

    // Scenario A
    els.aPeakInfected.textContent = fmt(mA.peakI);
    els.aPeakDay.textContent = 'Day ' + mA.peakDay;
    els.aTotalInfected.textContent = fmt(mA.totalInfected);
    els.aTotalRecovered.textContent = fmt(mA.totalRecovered);
    els.aTotalDeaths.textContent = fmt(mA.totalDeaths);
    els.aFinalSusceptible.textContent = fmt(mA.finalS);

    // Scenario B
    els.bPeakInfected.textContent = fmt(mB.peakI);
    els.bPeakDay.textContent = 'Day ' + mB.peakDay;
    els.bTotalInfected.textContent = fmt(mB.totalInfected);
    els.bTotalRecovered.textContent = fmt(mB.totalRecovered);
    els.bTotalDeaths.textContent = fmt(mB.totalDeaths);
    els.bVaccinated.textContent = fmt(mB.vaccinated);
}

/* ── SLIDER DISPLAY UPDATES ──────────────────────────────── */

function updateSliderDisplays() {
    const p = getParams();

    els.populationVal.textContent = p.N.toLocaleString();
    els.initialInfectedVal.textContent = p.I0.toLocaleString();
    els.initialRecoveredVal.textContent = p.R0.toLocaleString();
    els.betaVal.textContent = p.beta.toFixed(2);
    els.gammaVal.textContent = p.gamma.toFixed(2);
    els.mortalityRateVal.textContent = pct(p.mu);
    els.vaccinationRateVal.textContent = pct(p.vRate);
    els.vaccineEfficacyVal.textContent = pct(p.vEff);
    els.daysVal.textContent = p.days;
}

/* ── MAIN SIMULATION RUNNER ──────────────────────────────── */

function runSimulation() {
    const params = getParams();

    // Validate: ensure I0 + R0 <= N
    if (params.I0 + params.R0 >= params.N) {
        params.I0 = Math.min(params.I0, params.N - 1);
        params.R0 = 0;
    }

    // Run both scenarios
    const resA = simulateSIRD(params);
    const resB = simulateSVIRD(params);

    lastResultA = resA;
    lastResultB = resB;

    // Compute metrics
    const mA = computeMetrics(resA, params);
    const mB = computeMetrics(resB, params);

    // Update UI
    updateSliderDisplays();
    updateMetrics(mA, mB, params);
    updateComparisonChart(resA, resB, params);
    updateChartA(resA, params);
    updateChartB(resB, params);
}

/* ── EXPORT FUNCTIONS ────────────────────────────────────── */

/** Build a CSV string from simulation results */
function buildCSV(resA, resB, params) {
    const rows = [
        ['Day',
            'A_Susceptible', 'A_Infected', 'A_Recovered', 'A_Deceased',
            'B_Susceptible', 'B_Infected', 'B_Recovered', 'B_Vaccinated', 'B_Deceased']
    ];

    for (let t = 0; t <= params.days; t++) {
        rows.push([
            t,
            Math.round(resA.S[t]), Math.round(resA.I[t]), Math.round(resA.R[t]), Math.round(resA.D[t]),
            Math.round(resB.S[t]), Math.round(resB.I[t]), Math.round(resB.R[t]),
            Math.round(resB.V[t]), Math.round(resB.D[t]),
        ]);
    }

    return rows.map(r => r.join(',')).join('\n');
}

/** Trigger a file download */
function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/** Export CSV handler */
function exportCSV() {
    if (!lastResultA || !lastResultB) return;
    const params = getParams();
    const csv = buildCSV(lastResultA, lastResultB, params);
    downloadFile('epidemic_simulation.csv', csv, 'text/csv');
}

/** Export text summary handler */
function exportSummary() {
    if (!lastResultA || !lastResultB) return;
    const params = getParams();
    const mA = computeMetrics(lastResultA, params);
    const mB = computeMetrics(lastResultB, params);
    const r0 = (params.beta / params.gamma).toFixed(2);
    const herd = params.beta / params.gamma > 1
        ? pct(1 - params.gamma / params.beta)
        : '0.0% (R₀ < 1, epidemic does not grow)';

    const summary = `EPIDEMIC CALCULATOR — Simulation Summary
Generated: ${new Date().toLocaleString()}
===================================================

MODEL PARAMETERS
  Population:            ${params.N.toLocaleString()}
  Initial Infected:      ${params.I0.toLocaleString()}
  Initially Immune:      ${params.R0.toLocaleString()}
  Transmission Rate β:   ${params.beta}
  Recovery Rate γ:       ${params.gamma}
  Mortality Rate μ:      ${pct(params.mu)}
  Vaccination Rate:      ${pct(params.vRate)} / day
  Vaccine Efficacy:      ${pct(params.vEff)}
  Simulation Duration:   ${params.days} days

DERIVED INDICATORS
  Basic Reproduction No. R₀:  ${r0}
  Infectious Period:          ${(1 / params.gamma).toFixed(1)} days
  Herd Immunity Threshold:    ${herd}

===================================================
SCENARIO A — WITHOUT VACCINATION
  Peak Infected:         ${fmt(mA.peakI)} (Day ${mA.peakDay})
  Total Infected:        ${fmt(mA.totalInfected)}
  Total Recovered:       ${fmt(mA.totalRecovered)}
  Total Deaths:          ${fmt(mA.totalDeaths)}
  Remaining Susceptible: ${fmt(mA.finalS)}

===================================================
SCENARIO B — WITH VACCINATION
  Peak Infected:         ${fmt(mB.peakI)} (Day ${mB.peakDay})
  Total Infected:        ${fmt(mB.totalInfected)}
  Total Recovered:       ${fmt(mB.totalRecovered)}
  Total Deaths:          ${fmt(mB.totalDeaths)}
  Vaccinated:            ${fmt(mB.vaccinated)}

===================================================
IMPACT OF VACCINATION (A → B)
  Peak Infected Reduction: ${mA.peakI > 0 ? pct(1 - mB.peakI / mA.peakI) : '—'}
  Deaths Prevented:        ${fmt(mA.totalDeaths - mB.totalDeaths)}

===================================================
SIR Model — Kermack & McKendrick (1927)
Euler method, daily time steps.
For educational purposes only.
`;

    downloadFile('epidemic_summary.txt', summary, 'text/plain');
}

/* ── RESET ───────────────────────────────────────────────── */

function resetToDefaults() {
    els.population.value = DEFAULTS.population;
    els.initialInfected.value = DEFAULTS.initialInfected;
    els.initialRecovered.value = DEFAULTS.initialRecovered;
    els.beta.value = DEFAULTS.beta;
    els.gamma.value = DEFAULTS.gamma;
    els.mortalityRate.value = DEFAULTS.mortalityRate;
    els.vaccinationRate.value = DEFAULTS.vaccinationRate;
    els.vaccineEfficacy.value = DEFAULTS.vaccineEfficacy;
    els.days.value = DEFAULTS.days;
    runSimulation();
}

/* ── THEME TOGGLE ────────────────────────────────────────── */

function initTheme() {
    // Default is dark
    document.documentElement.setAttribute('data-theme', 'dark');
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    els.themeIcon.textContent = isDark ? '☾' : '☀';
    els.themeLabel.textContent = isDark ? 'Dark' : 'Light';

    // Rebuild charts to pick up new CSS variables
    if (comparisonChart) { comparisonChart.destroy(); comparisonChart = null; }
    if (chartA) { chartA.destroy(); chartA = null; }
    if (chartB) { chartB.destroy(); chartB = null; }
    runSimulation();
}

/* ── TOOLTIPS ────────────────────────────────────────────── */

function initTooltips() {
    const popup = els.tooltipPopup;

    document.querySelectorAll('.tooltip-icon').forEach(icon => {
        const tip = icon.getAttribute('data-tip');
        if (!tip) return;

        icon.addEventListener('mouseenter', (e) => {
            popup.textContent = tip;
            popup.classList.add('visible');
            positionTooltip(e);
        });

        icon.addEventListener('mousemove', positionTooltip);

        icon.addEventListener('mouseleave', () => {
            popup.classList.remove('visible');
        });
    });

    function positionTooltip(e) {
        const x = e.clientX + 14;
        const y = e.clientY + 14;
        popup.style.left = Math.min(x, window.innerWidth - 240) + 'px';
        popup.style.top = Math.min(y, window.innerHeight - 80) + 'px';
    }
}

/* ── EVENT LISTENERS ─────────────────────────────────────── */

function initEvents() {
    // All sliders → run simulation on input
    const sliders = [
        els.population, els.initialInfected, els.initialRecovered,
        els.beta, els.gamma, els.mortalityRate,
        els.vaccinationRate, els.vaccineEfficacy, els.days
    ];

    sliders.forEach(slider => {
        slider.addEventListener('input', runSimulation);
    });

    els.resetBtn.addEventListener('click', resetToDefaults);
    els.exportCSV.addEventListener('click', exportCSV);
    els.exportSummary.addEventListener('click', exportSummary);
    els.themeToggle.addEventListener('click', toggleTheme);
}

/* ── INITIALISE ──────────────────────────────────────────── */

function init() {
    initTheme();
    initTooltips();
    initEvents();
    runSimulation();
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init);