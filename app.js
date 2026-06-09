'use strict';

const STORAGE_KEY = 'vlanLabelGenerator.switches.v6';
const PALETTE = [
  { name: 'Blau', value: '#bfdbfe' },
  { name: 'Grün', value: '#bbf7d0' },
  { name: 'Gelb', value: '#fef08a' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Rot', value: '#fecaca' },
  { name: 'Lila', value: '#ddd6fe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Cyan', value: '#a5f3fc' },
  { name: 'Grau', value: '#e5e7eb' },
  { name: 'Dunkelgrau', value: '#cbd5e1' }
];

const defaultState = () => ({
  switchName: 'Switch 1',
  portCount: 16,
  selectedPort: 1,
  vlans: [
    { id: 10, name: 'Management', color: '#bfdbfe' },
    { id: 20, name: 'Clients', color: '#bbf7d0' },
    { id: 30, name: 'Audio', color: '#fef08a' },
    { id: 40, name: 'Guest', color: '#fed7aa' }
  ],
  ports: Array.from({ length: 16 }, (_, i) => ({
    number: i + 1,
    untagged: i === 0 ? 10 : 10,
    tagged: i === 0 ? [20] : [],
    customName: ''
  })),
  rack: { count: 12, prefix: 'PORT', labels: Array.from({ length: 12 }, (_, i) => `PORT ${i + 1}`) }
});

let state = defaultState();

const $ = (id) => document.getElementById(id);

function textColorFor(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return ((r * 299 + g * 587 + b * 114) / 1000) > 150 ? '#111827' : '#ffffff';
}

function getVlan(id) {
  return state.vlans.find(v => Number(v.id) === Number(id));
}

function portDisplayName(port) {
  return port.customName && port.customName.trim() ? port.customName.trim() : (getVlan(port.untagged)?.name || `VLAN ${port.untagged || '-'}`);
}

function portColor(port) {
  return getVlan(port.untagged)?.color || '#e5e7eb';
}

function fillPaletteSelect(select, selected) {
  select.innerHTML = '';
  PALETTE.forEach(c => {
    const option = document.createElement('option');
    option.value = c.value;
    option.textContent = c.name;
    option.selected = c.value === selected;
    option.style.backgroundColor = c.value;
    select.appendChild(option);
  });
  select.classList.add('color-select');
}

function renderAll() {
  $('switchName').value = state.switchName;
  $('printSwitchTitle').textContent = state.switchName || 'Switch';
  renderSavedSwitches();
  renderVlanManagement();
  renderSwitchGrid();
  renderLegend();
  renderPortEditor();
  renderRack();
}

function renderVlanManagement() {
  const list = $('vlanList');
  list.innerHTML = '';

  state.vlans.sort((a, b) => Number(a.id) - Number(b.id));
  state.vlans.forEach(vlan => {
    const row = document.createElement('div');
    row.className = 'vlan-row';

    const id = document.createElement('input');
    id.className = 'mini';
    id.type = 'number';
    id.value = vlan.id;
    id.addEventListener('change', () => renameVlanId(vlan.id, Number(id.value)));

    const name = document.createElement('input');
    name.className = 'mini';
    name.value = vlan.name;
    name.addEventListener('input', () => { vlan.name = name.value; renderSwitchGrid(); renderLegend(); renderPortEditor(); });

    const color = document.createElement('select');
    color.className = 'mini';
    fillPaletteSelect(color, vlan.color);
    color.addEventListener('change', () => { vlan.color = color.value; renderSwitchGrid(); renderLegend(); });

    const del = document.createElement('button');
    del.className = 'mini danger';
    del.textContent = '×';
    del.title = 'VLAN löschen';
    del.addEventListener('click', () => deleteVlan(vlan.id));

    row.append(id, name, color, del);
    list.appendChild(row);
  });

  fillPaletteSelect($('newVlanColor'), PALETTE[0].value);
}

function renameVlanId(oldId, newId) {
  if (!newId || newId < 1 || newId > 4094 || getVlan(newId)) { renderVlanManagement(); return; }
  const vlan = getVlan(oldId);
  if (!vlan) return;
  vlan.id = newId;
  state.ports.forEach(p => {
    if (Number(p.untagged) === Number(oldId)) p.untagged = newId;
    p.tagged = p.tagged.map(id => Number(id) === Number(oldId) ? newId : id);
  });
  renderAll();
}

function deleteVlan(id) {
  if (state.vlans.length <= 1) return;
  state.vlans = state.vlans.filter(v => Number(v.id) !== Number(id));
  const fallback = state.vlans[0]?.id || '';
  state.ports.forEach(p => {
    if (Number(p.untagged) === Number(id)) p.untagged = fallback;
    p.tagged = p.tagged.filter(t => Number(t) !== Number(id));
  });
  renderAll();
}

function addVlan() {
  const id = Number($('newVlanId').value);
  const name = $('newVlanName').value.trim();
  const color = $('newVlanColor').value;
  if (!id || id < 1 || id > 4094 || getVlan(id)) return;
  state.vlans.push({ id, name: name || `VLAN ${id}`, color });
  $('newVlanId').value = '';
  $('newVlanName').value = '';
  renderAll();
}

function renderSwitchGrid() {
  const grid = $('switchGrid');
  grid.innerHTML = '';
  state.ports.forEach(port => {
    const el = document.createElement('div');
    const bg = portColor(port);
    el.className = `port ${port.number === state.selectedPort ? 'selected' : ''}`;
    el.style.setProperty('--port-color', bg);
    el.style.color = textColorFor(bg);
    el.addEventListener('click', () => { state.selectedPort = port.number; renderSwitchGrid(); renderPortEditor(); });

    const tagged = port.tagged.length ? port.tagged.join(',') : '–';
    el.innerHTML = `
      <div class="port-head"><span>Port ${port.number}</span><span>${port.untagged || '-'}</span></div>
      <div class="port-body">
        <div class="port-name"></div>
        <div class="port-vlans">U:${port.untagged || '–'}<br>T:${tagged}</div>
      </div>`;
    el.querySelector('.port-name').textContent = portDisplayName(port);
    grid.appendChild(el);
  });
}

function renderLegend() {
  const legend = $('legend');
  legend.innerHTML = '';
  state.vlans.forEach(v => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="swatch" style="background:${v.color}"></span><strong>VLAN ${v.id}</strong> ${escapeHtml(v.name)}`;
    legend.appendChild(item);
  });
}

function renderPortEditor() {
  const container = $('portEditor');
  const port = state.ports.find(p => p.number === state.selectedPort);
  if (!port) { container.className = 'editor-empty'; container.textContent = 'Port anklicken, um ihn zu bearbeiten.'; return; }
  container.className = '';
  container.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = `Port ${port.number}`;
  title.style.margin = '0 0 10px';

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Portname / Override';
  const nameInput = document.createElement('input');
  nameInput.value = port.customName || '';
  nameInput.placeholder = `Automatisch: ${getVlan(port.untagged)?.name || ''}`;
  nameInput.addEventListener('input', () => { port.customName = nameInput.value; renderSwitchGrid(); });
  nameLabel.appendChild(nameInput);

  const untaggedLabel = document.createElement('label');
  untaggedLabel.textContent = 'Untagged VLAN / PVID';
  const untagged = document.createElement('select');
  state.vlans.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = `${v.id} – ${v.name}`;
    opt.selected = Number(port.untagged) === Number(v.id);
    untagged.appendChild(opt);
  });
  untagged.addEventListener('change', () => { port.untagged = Number(untagged.value); renderSwitchGrid(); renderPortEditor(); });
  untaggedLabel.appendChild(untagged);

  const taggedTitle = document.createElement('div');
  taggedTitle.innerHTML = '<strong>Tagged VLANs</strong>';
  taggedTitle.style.marginTop = '10px';
  const tagList = document.createElement('div');
  tagList.className = 'tag-list';
  state.vlans.forEach(v => {
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = port.tagged.map(Number).includes(Number(v.id));
    cb.addEventListener('change', () => {
      if (cb.checked && !port.tagged.map(Number).includes(Number(v.id))) port.tagged.push(v.id);
      if (!cb.checked) port.tagged = port.tagged.filter(id => Number(id) !== Number(v.id));
      port.tagged.sort((a, b) => Number(a) - Number(b));
      renderSwitchGrid();
    });
    label.append(cb, document.createTextNode(`${v.id} ${v.name}`));
    tagList.appendChild(label);
  });

  const actions = document.createElement('div');
  actions.className = 'row';
  const clearName = document.createElement('button');
  clearName.textContent = 'Namen erben';
  clearName.addEventListener('click', () => { port.customName = ''; renderSwitchGrid(); renderPortEditor(); });
  const clearTagged = document.createElement('button');
  clearTagged.textContent = 'Tagged leeren';
  clearTagged.addEventListener('click', () => { port.tagged = []; renderSwitchGrid(); renderPortEditor(); });
  actions.append(clearName, clearTagged);

  container.append(title, nameLabel, untaggedLabel, taggedTitle, tagList, actions);
}

function renderRack() {
  const grid = $('rackGrid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${Math.min(state.rack.count, 12)}, 1fr)`;
  $('rackCount').value = String(state.rack.count);
  $('rackPrefix').value = state.rack.prefix;

  for (let i = 0; i < state.rack.count; i++) {
    const el = document.createElement('div');
    el.className = 'rack-port';
    el.contentEditable = 'true';
    el.innerHTML = `<div class="rack-num">${i + 1}</div><div class="rack-label">${escapeHtml(state.rack.labels[i] || `${state.rack.prefix} ${i + 1}`)}</div>`;
    el.addEventListener('input', () => {
      const label = el.querySelector('.rack-label');
      state.rack.labels[i] = label ? label.textContent.trim() : el.textContent.trim();
    });
    grid.appendChild(el);
  }
}

function applyRack() {
  state.rack.count = Number($('rackCount').value);
  state.rack.prefix = $('rackPrefix').value.trim() || 'PORT';
  state.rack.labels = Array.from({ length: state.rack.count }, (_, i) => state.rack.labels[i] || `${state.rack.prefix} ${i + 1}`);
  renderRack();
}

function getSavedSwitches() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function setSavedSwitches(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderSavedSwitches() {
  const select = $('savedSwitches');
  const saved = getSavedSwitches();
  const current = select.value;
  select.innerHTML = '';
  Object.keys(saved).sort().forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
  if (current && saved[current]) select.value = current;
}

function saveSwitch() {
  state.switchName = $('switchName').value.trim() || 'Switch';
  const saved = getSavedSwitches();
  saved[state.switchName] = structuredCloneSafe(state);
  setSavedSwitches(saved);
  renderAll();
}

function loadSwitch() {
  const name = $('savedSwitches').value;
  const saved = getSavedSwitches();
  if (!name || !saved[name]) return;
  state = normalizeState(saved[name]);
  renderAll();
}

function deleteSwitch() {
  const name = $('savedSwitches').value;
  const saved = getSavedSwitches();
  if (!name || !saved[name]) return;
  delete saved[name];
  setSavedSwitches(saved);
  renderSavedSwitches();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(structuredCloneSafe(state), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(state.switchName || 'switch').replace(/[^a-z0-9_-]+/gi, '_')}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalizeState(JSON.parse(reader.result));
      renderAll();
    } catch (err) {
      alert('JSON konnte nicht importiert werden.');
    }
  };
  reader.readAsText(file);
}

function newSwitch() {
  state = defaultState();
  renderAll();
}

function normalizeState(raw) {
  const base = defaultState();
  const merged = { ...base, ...raw };
  merged.vlans = Array.isArray(raw.vlans) && raw.vlans.length ? raw.vlans : base.vlans;
  merged.ports = Array.isArray(raw.ports) && raw.ports.length ? raw.ports : base.ports;
  merged.ports = merged.ports.map((p, idx) => ({ number: idx + 1, untagged: p.untagged || merged.vlans[0].id, tagged: Array.isArray(p.tagged) ? p.tagged : [], customName: p.customName || '' }));
  merged.rack = { ...base.rack, ...(raw.rack || {}) };
  merged.selectedPort = merged.selectedPort || 1;
  return merged;
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function bindEvents() {
  $('printBtn').addEventListener('click', () => window.print());
  $('exportBtn').addEventListener('click', exportJson);
  $('importInput').addEventListener('change', e => e.target.files[0] && importJson(e.target.files[0]));
  $('switchName').addEventListener('input', () => { state.switchName = $('switchName').value; $('printSwitchTitle').textContent = state.switchName || 'Switch'; });
  $('newSwitchBtn').addEventListener('click', newSwitch);
  $('saveSwitchBtn').addEventListener('click', saveSwitch);
  $('loadSwitchBtn').addEventListener('click', loadSwitch);
  $('deleteSwitchBtn').addEventListener('click', deleteSwitch);
  $('addVlanBtn').addEventListener('click', addVlan);
  $('applyRackBtn').addEventListener('click', applyRack);
}

window.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  renderAll();
});
