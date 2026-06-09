'use strict';

const RACK_STORAGE_KEY = 'vlanLabelGenerator.racks.v7.php';

const defaultRackState = () => ({
  rackName: 'Rackblende 1',
  count: 12,
  prefix: 'PORT',
  labels: Array.from({ length: 12 }, (_, i) => `PORT ${i + 1}`)
});

let rackState = defaultRackState();

function getSavedRacks() {
  try { return JSON.parse(localStorage.getItem(RACK_STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function setSavedRacks(data) {
  localStorage.setItem(RACK_STORAGE_KEY, JSON.stringify(data));
}

function normalizeRack(raw) {
  const base = defaultRackState();
  const merged = { ...base, ...(raw || {}) };
  merged.count = Number(merged.count) || 12;
  merged.prefix = merged.prefix || 'PORT';
  merged.labels = Array.from({ length: merged.count }, (_, i) => {
    return Array.isArray(raw?.labels) && raw.labels[i] ? raw.labels[i] : `${merged.prefix} ${i + 1}`;
  });
  return merged;
}

function renderAll() {
  $('rackName').value = rackState.rackName;
  $('rackCount').value = String(rackState.count);
  $('rackPrefix').value = rackState.prefix;
  $('printRackTitle').textContent = rackState.rackName || 'Rackblende';
  renderSavedRacks();
  renderRackGrid();
}

function renderSavedRacks() {
  const select = $('savedRacks');
  const current = select.value;
  const saved = getSavedRacks();
  select.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '— auswählen —';
  select.appendChild(empty);
  Object.keys(saved).sort().forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
  if (current && saved[current]) select.value = current;
}

function renderRackGrid() {
  const grid = $('rackGrid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${Math.min(rackState.count, 12)}, 1fr)`;
  for (let i = 0; i < rackState.count; i++) {
    const el = document.createElement('div');
    el.className = 'rack-port';
    el.innerHTML = `<div class="rack-num">${i + 1}</div><div class="rack-label" contenteditable="true">${escapeHtml(rackState.labels[i] || `${rackState.prefix} ${i + 1}`)}</div>`;
    const label = el.querySelector('.rack-label');
    label.addEventListener('input', () => { rackState.labels[i] = label.textContent.trim(); });
    grid.appendChild(el);
  }
}

function applyRack() {
  const oldLabels = rackState.labels || [];
  rackState.rackName = $('rackName').value.trim() || 'Rackblende';
  rackState.count = Number($('rackCount').value) || 12;
  rackState.prefix = $('rackPrefix').value.trim() || 'PORT';
  rackState.labels = Array.from({ length: rackState.count }, (_, i) => oldLabels[i] || `${rackState.prefix} ${i + 1}`);
  renderAll();
}

function saveRack() {
  rackState.rackName = $('rackName').value.trim() || 'Rackblende';
  const saved = getSavedRacks();
  saved[rackState.rackName] = clone(rackState);
  setSavedRacks(saved);
  renderAll();
}

function loadRack() {
  const name = $('savedRacks').value;
  const saved = getSavedRacks();
  if (!name || !saved[name]) return;
  rackState = normalizeRack(saved[name]);
  renderAll();
}

function deleteRack() {
  const name = $('savedRacks').value;
  const saved = getSavedRacks();
  if (!name || !saved[name]) return;
  delete saved[name];
  setSavedRacks(saved);
  renderSavedRacks();
}

function exportRackJson() {
  downloadJson(`${rackState.rackName || 'rackblende'}.json`, clone(rackState));
}

function importRackJson(file) {
  readJsonFile(file, data => { rackState = normalizeRack(data); renderAll(); });
}

function newRack() {
  rackState = defaultRackState();
  renderAll();
}

function bindEvents() {
  $('printBtn').addEventListener('click', () => window.print());
  $('rackName').addEventListener('input', () => {
    rackState.rackName = $('rackName').value;
    $('printRackTitle').textContent = rackState.rackName || 'Rackblende';
  });
  $('applyRackBtn').addEventListener('click', applyRack);
  $('newRackBtn').addEventListener('click', newRack);
  $('saveRackBtn').addEventListener('click', saveRack);
  $('loadRackBtn').addEventListener('click', loadRack);
  $('deleteRackBtn').addEventListener('click', deleteRack);
  $('exportRackBtn').addEventListener('click', exportRackJson);
  $('importRackInput').addEventListener('change', e => e.target.files[0] && importRackJson(e.target.files[0]));
}

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  renderAll();
});
