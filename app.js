const $ = (id) => document.getElementById(id);

let switchRows = [
  { port: 1, untagged: '10', tagged: '20', label: 'Uplink / Trunk', color: '#c4b5fd' },
  { port: 2, untagged: '10', tagged: '', label: 'Mgmt', color: '#93c5fd' },
  { port: 3, untagged: '20', tagged: '', label: 'Audio', color: '#86efac' },
  { port: 4, untagged: '20', tagged: '', label: 'Audio', color: '#86efac' },
  { port: 5, untagged: '30', tagged: '', label: 'Licht', color: '#fde68a' },
  { port: 6, untagged: '30', tagged: '', label: 'Licht', color: '#fde68a' },
  { port: 7, untagged: '40', tagged: '', label: 'Video', color: '#fca5a5' },
  { port: 8, untagged: '10', tagged: '20,30,40', label: 'Trunk', color: '#ddd6fe' },
  { port: 9, untagged: '10', tagged: '20', label: 'AP', color: '#bfdbfe' },
  { port: 10, untagged: '50', tagged: '', label: 'Gast', color: '#a7f3d0' },
  { port: 11, untagged: '50', tagged: '', label: 'Gast', color: '#a7f3d0' },
  { port: 12, untagged: '60', tagged: '', label: 'Office', color: '#bfdbfe' },
  { port: 13, untagged: '', tagged: '', label: 'Spare', color: '#e5e7eb' },
  { port: 14, untagged: '', tagged: '', label: 'Spare', color: '#e5e7eb' },
  { port: 15, untagged: '10', tagged: '80', label: 'AP', color: '#ddd6fe' },
  { port: 16, untagged: '10', tagged: '80', label: 'AP', color: '#ddd6fe' },
];

let rackRows = Array.from({ length: 12 }, (_, i) => ({
  port: i + 1,
  top: ['MAIN L', 'MAIN R', 'MON 1', 'MON 2', 'FOH A', 'FOH B', 'NET A', 'NET B', 'SPARE', 'SPARE', 'REC L', 'REC R'][i] || `PORT ${i + 1}`,
  bottom: ['XLR', 'XLR', 'XLR', 'XLR', 'CAT', 'CAT', 'CAT', 'CAT', '', '', 'XLR', 'XLR'][i] || '',
  color: '#ffffff'
}));

function escapeHtml(value) {
  return String(value != null ? value : '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function getVlanChoices() {
  const configured = $('vlanChoices').value.split(/[;,\s]+/).map(v => v.trim()).filter(Boolean);
  const used = switchRows.flatMap(r => [r.untagged, ...String(r.tagged || '').split(/[;,\s]+/)]).map(v => String(v).trim()).filter(Boolean);
  return [...new Set([...configured, ...used])].sort((a, b) => Number(a) - Number(b));
}

function normalizeSwitchRow(row) {
  if (row.vlan && !row.untagged && !row.tagged) {
    const mode = String(row.mode || '').toLowerCase();
    row.untagged = mode.includes('untag') ? row.vlan : '';
    row.tagged = mode.includes('tag') && !mode.includes('untag') ? row.vlan : '';
  }
  return {
    port: Number(row.port) || '',
    untagged: row.untagged != null ? row.untagged : '',
    tagged: row.tagged != null ? row.tagged : '',
    label: row.label != null ? row.label : '',
    color: row.color || '#ffffff'
  };
}

function syncCounts() {
  const swCount = Number($('switchPortCount').value);
  while (switchRows.length < swCount) switchRows.push({ port: switchRows.length + 1, untagged: '', tagged: '', label: '', color: '#ffffff' });
  while (switchRows.length > swCount) switchRows.pop();
  switchRows = switchRows.map(normalizeSwitchRow);
  const rackCount = Number($('rackPortCount').value);
  while (rackRows.length < rackCount) rackRows.push({ port: rackRows.length + 1, top: '', bottom: '', color: '#ffffff' });
  while (rackRows.length > rackCount) rackRows.pop();
}

function portSummary(r) {
  const parts = [];
  if (r.untagged) parts.push(`U:${r.untagged}`);
  if (r.tagged) parts.push(`T:${r.tagged}`);
  return parts.join('  ');
}

function optionList(selected = '', includeEmpty = true) {
  const choices = getVlanChoices();
  return `${includeEmpty ? '<option value="">—</option>' : ''}${choices.map(v => `<option value="${escapeHtml(v)}" ${String(selected) === String(v) ? 'selected' : ''}>VLAN ${escapeHtml(v)}</option>`).join('')}`;
}

function multiOptionList(selectedCsv = '') {
  const selected = new Set(String(selectedCsv || '').split(/[;,\s]+/).map(v => v.trim()).filter(Boolean));
  return getVlanChoices().map(v => `<option value="${escapeHtml(v)}" ${selected.has(String(v)) ? 'selected' : ''}>Tagged VLAN ${escapeHtml(v)}</option>`).join('');
}

function renderSwitchPreview() {
  const width = Number($('switchWidth').value);
  const portHeight = Number($('switchPortHeight').value);
  const perRow = Number($('switchPortsPerRow').value);
  const uniqueVlans = new Map();
  switchRows.forEach(r => {
    if (r.untagged) uniqueVlans.set(`U-${r.untagged}-${r.color}`, { type: 'Untagged/PVID', vlan: r.untagged, color: r.color });
    String(r.tagged || '').split(/[;,\s]+/).filter(Boolean).forEach(v => uniqueVlans.set(`T-${v}-${r.color}`, { type: 'Tagged', vlan: v, color: r.color }));
  });
  $('switchPreview').innerHTML = `
    <div class="preview-title">${escapeHtml($('switchName').value)}</div>
    <div class="switch-label" style="width:${width}mm">
      <div class="switch-grid" style="grid-template-columns: repeat(${perRow}, 1fr)">
        ${switchRows.map((r, i) => `
          <div class="port-box" style="min-height:${portHeight}mm;background:${escapeHtml(r.color)}" data-port-index="${i}">
            <input class="port-color no-print" type="color" value="${escapeHtml(r.color)}" data-i="${i}" data-k="color" title="Port-Farbe">
            <div class="port-editor no-print">
              <strong>Port ${escapeHtml(r.port)}</strong>
              <input value="${escapeHtml(r.label)}" data-i="${i}" data-k="label" placeholder="Label">
              <label>Untagged/PVID
                <select data-i="${i}" data-k="untagged">${optionList(r.untagged, true)}</select>
              </label>
              <label>Tagged
                <select multiple data-i="${i}" data-k="taggedMulti">${multiOptionList(r.tagged)}</select>
              </label>
            </div>
            <div class="port-print">
              <div class="port-head"><span>${escapeHtml(r.port)}</span><span>${escapeHtml(portSummary(r))}</span></div>
              <div class="port-label">${escapeHtml(r.label)}</div>
              <div class="port-vlans">
                ${r.untagged ? `<span class="vlan-pill">Untagged ${escapeHtml(r.untagged)}</span>` : ''}
                ${r.tagged ? `<span class="vlan-pill tagged">Tagged ${escapeHtml(r.tagged)}</span>` : ''}
              </div>
            </div>
          </div>`).join('')}
      </div>
      <div class="legend">
        <span class="legend-item"><strong>U</strong> = Untagged/PVID</span>
        <span class="legend-item"><strong>T</strong> = Tagged VLANs</span>
        ${[...uniqueVlans.values()].map(r => `<span class="legend-item"><span class="swatch" style="background:${escapeHtml(r.color)}"></span>${escapeHtml(r.type)} VLAN ${escapeHtml(r.vlan)}</span>`).join('')}
      </div>
    </div>
    <div class="cut-hint">Maßhaltig drucken: Im Druckdialog Skalierung auf 100% / tatsächliche Größe stellen.</div>`;
  bindDirectSwitchEditors();
}

function renderRackPreview() {
  const width = Number($('rackWidth').value);
  const height = Number($('rackHeight').value);
  const fontSize = Number($('rackFontSize').value);
  $('rackPreview').innerHTML = `
    <div class="preview-title">${escapeHtml($('rackName').value)}</div>
    <div class="rack-strip" style="width:${width}mm;min-height:${height}mm;grid-template-columns:repeat(${rackRows.length},1fr);font-size:${fontSize}pt">
      ${rackRows.map((r, i) => `
        <div class="rack-cell" style="background:${escapeHtml(r.color)}">
          <div class="rack-editor no-print">
            <input value="${escapeHtml(r.top || r.port)}" data-rack-i="${i}" data-k="top" placeholder="oben">
            <input value="${escapeHtml(r.bottom)}" data-rack-i="${i}" data-k="bottom" placeholder="unten">
          </div>
          <div class="rack-top port-print">${escapeHtml(r.top || r.port)}</div>
          <div class="rack-bottom port-print">${escapeHtml(r.bottom)}</div>
        </div>`).join('')}
    </div>
    <div class="cut-hint">Tipp: Bei Ethercon-Buchsen Streifenbreite messen und hier in mm eintragen.</div>`;
  bindDirectRackEditors();
}

function bindDirectSwitchEditors() {
  $('switchPreview').querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', onDirectSwitchInput);
    el.addEventListener('change', onDirectSwitchInput);
  });
}
function bindDirectRackEditors() {
  $('rackPreview').querySelectorAll('input').forEach(el => el.addEventListener('input', onDirectRackInput));
}
function onDirectSwitchInput(e) {
  const el = e.target;
  const i = Number(el.dataset.i);
  const k = el.dataset.k;
  if (!Number.isFinite(i) || !k) return;
  if (k === 'taggedMulti') {
    switchRows[i].tagged = [...el.selectedOptions].map(o => o.value).join(',');
  } else {
    switchRows[i][k] = el.value;
  }
  renderSwitchPreview();
}
function onDirectRackInput(e) {
  const el = e.target;
  const i = Number(el.dataset.rackI);
  const k = el.dataset.k;
  if (!Number.isFinite(i) || !k) return;
  rackRows[i][k] = el.value;
  renderRackPreview();
}

function renderPreviews() { renderSwitchPreview(); renderRackPreview(); }
function renderAll() { syncCounts(); renderPreviews(); }

function setView(view) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
  $('switchControls').classList.toggle('active', view === 'switch');
  $('rackControls').classList.toggle('active', view === 'rack');
  $('switchPreview').classList.toggle('active', view === 'switch');
  $('rackPreview').classList.toggle('active', view === 'rack');
}

function toCsv(rows, keys) {
  const esc = v => `"${String(v != null ? v : '').replace(/"/g, '""')}"`;
  return [keys.join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n');
}
function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.map(line => {
    const cells = [];
    let cur = '', quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = !quoted;
      else if (ch === ',' && !quoted) { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] != null ? cells[i] : '']));
  });
}
function importCsv(file, target) {
  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCsv(reader.result);
    if (target === 'switch') {
      switchRows = rows.map(normalizeSwitchRow);
      $('switchPortCount').value = switchRows.length;
    } else {
      rackRows = rows.map(r => ({ port: Number(r.port), top: r.top, bottom: r.bottom, color: r.color || '#ffffff' }));
      $('rackPortCount').value = rackRows.length;
    }
    renderAll();
  };
  reader.readAsText(file);
}

function bindInputs(ids) { ids.forEach(id => $(id).addEventListener('input', renderAll)); }

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => setView(tab.dataset.view)));
bindInputs(['switchName', 'switchPortCount', 'switchPortsPerRow', 'switchWidth', 'switchPortHeight', 'vlanChoices', 'rackName', 'rackPortCount', 'rackWidth', 'rackHeight', 'rackFontSize']);
$('printBtn').addEventListener('click', () => window.print());
$('renumberPorts').addEventListener('click', () => { switchRows.forEach((r, i) => r.port = i + 1); renderAll(); });
$('renumberRack').addEventListener('click', () => { rackRows.forEach((r, i) => r.port = i + 1); renderAll(); });
$('applyPort1Default').addEventListener('click', () => { if (!switchRows[0]) return; switchRows[0].untagged = '10'; switchRows[0].tagged = '20'; if (!switchRows[0].label) switchRows[0].label = 'Uplink / Trunk'; renderAll(); });
$('exportSwitchCsv').addEventListener('click', () => download('switch-labels.csv', toCsv(switchRows, ['port','untagged','tagged','label','color'])));
$('exportRackCsv').addEventListener('click', () => download('rack-labels.csv', toCsv(rackRows, ['port','top','bottom','color'])));
$('importSwitchCsv').addEventListener('change', e => e.target.files[0] && importCsv(e.target.files[0], 'switch'));
$('importRackCsv').addEventListener('change', e => e.target.files[0] && importCsv(e.target.files[0], 'rack'));
$('resetBtn').addEventListener('click', () => location.reload());
renderAll();
