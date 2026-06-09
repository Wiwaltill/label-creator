'use strict';

const SWITCH_STORAGE_KEY = 'vlanLabelGenerator.switches.v7.php';

const defaultSwitchState = () => ({
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
    untagged: i === 0 ? 10 : null,
    tagged: i === 0 ? [20] : [],
    customName: ''
  }))
});

let state = defaultSwitchState();

function getVlan(id) {
  if (id === null || id === '' || typeof id === 'undefined') return null;
  return state.vlans.find(v => Number(v.id) === Number(id)) || null;
}

function portDisplayName(port) {
  if (port.customName && port.customName.trim()) return port.customName.trim();
  const vlan = getVlan(port.untagged);
  return vlan ? vlan.name : '';
}

function portColor(port) {
  const vlan = getVlan(port.untagged);
  return vlan ? vlan.color : '#ffffff';
}

function getSavedSwitches() {
  try { return JSON.parse(localStorage.getItem(SWITCH_STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function setSavedSwitches(data) {
  localStorage.setItem(SWITCH_STORAGE_KEY, JSON.stringify(data));
}

function normalizeSwitch(raw) {
  const base = defaultSwitchState();
  const merged = { ...base, ...(raw || {}) };
  merged.vlans = Array.isArray(merged.vlans) && merged.vlans.length ? merged.vlans : base.vlans;
  merged.ports = Array.from({ length: Number(merged.portCount) || 16 }, (_, i) => {
    const p = Array.isArray(raw?.ports) ? raw.ports[i] : null;
    return {
      number: i + 1,
      untagged: p && Object.prototype.hasOwnProperty.call(p, 'untagged') && p.untagged !== '' ? p.untagged : null,
      tagged: Array.isArray(p?.tagged) ? p.tagged : [],
      customName: p?.customName || ''
    };
  });
  merged.selectedPort = Math.min(Math.max(Number(merged.selectedPort) || 1, 1), merged.ports.length);
  return merged;
}

function renderAll() {
  $('switchName').value = state.switchName;
  $('printSwitchTitle').textContent = state.switchName || 'Switch';
  renderSavedSwitches();
  renderVlanManagement();
  renderSwitchGrid();
  renderLegend();
  renderPortEditor();
}

function renderSavedSwitches() {
  const select = $('savedSwitches');
  const current = select.value;
  const saved = getSavedSwitches();
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
    id.min = '1';
    id.max = '4094';
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
    del.type = 'button';
    del.textContent = '×';
    del.title = 'VLAN löschen';
    del.addEventListener('click', () => deleteVlan(vlan.id));

    row.append(id, name, color, del);
    list.appendChild(row);
  });
  fillPaletteSelect($('newVlanColor'), PALETTE[0].value);
}

function renameVlanId(oldId, newId) {
  if (!newId || newId < 1 || newId > 4094 || (Number(oldId) !== Number(newId) && getVlan(newId))) {
    renderVlanManagement();
    return;
  }
  const vlan = getVlan(oldId);
  if (!vlan) return;
  vlan.id = newId;
  state.ports.forEach(port => {
    if (Number(port.untagged) === Number(oldId)) port.untagged = newId;
    port.tagged = port.tagged.map(id => Number(id) === Number(oldId) ? newId : id);
  });
  renderAll();
}

function deleteVlan(id) {
  state.vlans = state.vlans.filter(v => Number(v.id) !== Number(id));
  state.ports.forEach(port => {
    if (Number(port.untagged) === Number(id)) port.untagged = null;
    port.tagged = port.tagged.filter(t => Number(t) !== Number(id));
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
    const bg = portColor(port);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `port ${port.number === state.selectedPort ? 'selected' : ''}`;
    el.style.setProperty('--port-color', bg);
    el.style.color = textColorFor(bg);
    el.addEventListener('click', () => { state.selectedPort = port.number; renderSwitchGrid(); renderPortEditor(); });

    const tagged = port.tagged.length ? port.tagged.join(', ') : '–';
    const untaggedText = port.untagged ? port.untagged : 'Keins';
    const name = portDisplayName(port) || '—';
    el.innerHTML = `
      <div class="port-head"><span>Port ${port.number}</span><span>${escapeHtml(untaggedText)}</span></div>
      <div class="port-body">
        <div class="port-name">${escapeHtml(name)}</div>
        <div class="port-vlans">U: ${escapeHtml(untaggedText)}<br>T: ${escapeHtml(tagged)}</div>
      </div>`;
    grid.appendChild(el);
  });
}

function renderLegend() {
  const legend = $('legend');
  legend.innerHTML = '';
  state.vlans.forEach(v => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="swatch" style="background:${v.color}"></span><strong>VLAN ${escapeHtml(v.id)}</strong> ${escapeHtml(v.name)}`;
    legend.appendChild(item);
  });
}

function renderPortEditor() {
  const container = $('portEditor');
  const port = state.ports.find(p => p.number === state.selectedPort);
  if (!port) return;
  container.className = '';
  container.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = `Port ${port.number}`;
  title.className = 'editor-title';

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Portname / Override';
  const nameInput = document.createElement('input');
  nameInput.value = port.customName || '';
  const inherited = getVlan(port.untagged)?.name || 'kein Name, da kein Untagged VLAN';
  nameInput.placeholder = `Automatisch: ${inherited}`;
  nameInput.addEventListener('input', () => { port.customName = nameInput.value; renderSwitchGrid(); });
  nameLabel.appendChild(nameInput);

  const untaggedLabel = document.createElement('label');
  untaggedLabel.textContent = 'Untagged VLAN / PVID';
  const untagged = document.createElement('select');
  const none = document.createElement('option');
  none.value = '';
  none.textContent = 'Keins / kein untagged VLAN';
  none.selected = port.untagged === null || port.untagged === '' || typeof port.untagged === 'undefined';
  untagged.appendChild(none);
  state.vlans.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = `${v.id} – ${v.name}`;
    opt.selected = Number(port.untagged) === Number(v.id);
    untagged.appendChild(opt);
  });
  untagged.addEventListener('change', () => {
    port.untagged = untagged.value === '' ? null : Number(untagged.value);
    renderSwitchGrid();
    renderPortEditor();
  });
  untaggedLabel.appendChild(untagged);

  const taggedTitle = document.createElement('div');
  taggedTitle.className = 'field-title';
  taggedTitle.textContent = 'Tagged VLANs';

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
  const inheritName = document.createElement('button');
  inheritName.type = 'button';
  inheritName.textContent = 'Namen erben';
  inheritName.addEventListener('click', () => { port.customName = ''; renderSwitchGrid(); renderPortEditor(); });
  const clearTagged = document.createElement('button');
  clearTagged.type = 'button';
  clearTagged.textContent = 'Tagged leeren';
  clearTagged.addEventListener('click', () => { port.tagged = []; renderSwitchGrid(); renderPortEditor(); });
  actions.append(inheritName, clearTagged);

  container.append(title, nameLabel, untaggedLabel, taggedTitle, tagList, actions);
}

function saveSwitch() {
  state.switchName = $('switchName').value.trim() || 'Switch';
  const saved = getSavedSwitches();
  saved[state.switchName] = clone(state);
  setSavedSwitches(saved);
  renderAll();
}

function loadSwitch() {
  const name = $('savedSwitches').value;
  const saved = getSavedSwitches();
  if (!name || !saved[name]) return;
  state = normalizeSwitch(saved[name]);
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
  downloadJson(`${state.switchName || 'switch'}.json`, clone(state));
}

function importJson(file) {
  readJsonFile(file, data => { state = normalizeSwitch(data); renderAll(); });
}

function newSwitch() {
  state = defaultSwitchState();
  renderAll();
}

function bindEvents() {
  $('printBtn').addEventListener('click', () => window.print());
  $('exportBtn').addEventListener('click', exportJson);
  $('importInput').addEventListener('change', e => e.target.files[0] && importJson(e.target.files[0]));
  $('switchName').addEventListener('input', () => {
    state.switchName = $('switchName').value;
    $('printSwitchTitle').textContent = state.switchName || 'Switch';
  });
  $('newSwitchBtn').addEventListener('click', newSwitch);
  $('saveSwitchBtn').addEventListener('click', saveSwitch);
  $('loadSwitchBtn').addEventListener('click', loadSwitch);
  $('deleteSwitchBtn').addEventListener('click', deleteSwitch);
  $('addVlanBtn').addEventListener('click', addVlan);
}

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  renderAll();
});
