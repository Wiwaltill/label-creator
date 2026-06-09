(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);

  const defaultSwitchRows = () => [
    { port: 1, untagged: '10', tagged: '20', label: 'Uplink / Trunk', color: '#c4b5fd' },
    { port: 2, untagged: '10', tagged: '', label: 'Mgmt', color: '#93c5fd' },
    { port: 3, untagged: '20', tagged: '', label: 'Audio', color: '#86efac' },
    { port: 4, untagged: '20', tagged: '', label: 'Audio', color: '#86efac' },
    { port: 5, untagged: '30', tagged: '', label: 'Licht', color: '#fde68a' },
    { port: 6, untagged: '30', tagged: '', label: 'Licht', color: '#fde68a' },
    { port: 7, untagged: '40', tagged: '', label: 'Video', color: '#fca5a5' },
    { port: 8, untagged: '10', tagged: '20,30,40', label: 'Trunk', color: '#ddd6fe' },
    { port: 9, untagged: '10', tagged: '20,80', label: 'AP', color: '#bfdbfe' },
    { port: 10, untagged: '50', tagged: '', label: 'Gast', color: '#a7f3d0' },
    { port: 11, untagged: '50', tagged: '', label: 'Gast', color: '#a7f3d0' },
    { port: 12, untagged: '60', tagged: '', label: 'Office', color: '#bfdbfe' },
    { port: 13, untagged: '', tagged: '', label: 'Spare', color: '#e5e7eb' },
    { port: 14, untagged: '', tagged: '', label: 'Spare', color: '#e5e7eb' },
    { port: 15, untagged: '10', tagged: '80', label: 'AP', color: '#ddd6fe' },
    { port: 16, untagged: '10', tagged: '80', label: 'AP', color: '#ddd6fe' }
  ];

  const defaultRackRows = () => Array.from({ length: 12 }, (_, i) => ({
    port: i + 1,
    top: ['MAIN L', 'MAIN R', 'MON 1', 'MON 2', 'FOH A', 'FOH B', 'NET A', 'NET B', 'SPARE', 'SPARE', 'REC L', 'REC R'][i] || `PORT ${i + 1}`,
    bottom: ['XLR', 'XLR', 'XLR', 'XLR', 'CAT', 'CAT', 'CAT', 'CAT', '', '', 'XLR', 'XLR'][i] || '',
    color: '#ffffff'
  }));

  let switchRows = defaultSwitchRows();
  let rackRows = defaultRackRows();
  let currentView = 'switch';

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  }

  function splitVlans(value) {
    return String(value || '').split(/[;,\s]+/).map(v => v.trim()).filter(Boolean);
  }

  function getVlanChoices() {
    const fromInput = splitVlans($('vlanChoices').value);
    const fromRows = switchRows.flatMap(r => [r.untagged, ...splitVlans(r.tagged)]).filter(Boolean);
    return [...new Set([...fromInput, ...fromRows])].sort((a, b) => {
      const na = Number(a), nb = Number(b);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return String(a).localeCompare(String(b), 'de');
    });
  }

  function normalizeSwitchRow(row, index = 0) {
    return {
      port: Number(row.port) || index + 1,
      untagged: String(row.untagged ?? '').trim(),
      tagged: splitVlans(row.tagged).join(','),
      label: String(row.label ?? ''),
      color: row.color || '#ffffff'
    };
  }

  function normalizeRackRow(row, index = 0) {
    return {
      port: Number(row.port) || index + 1,
      top: String(row.top ?? ''),
      bottom: String(row.bottom ?? ''),
      color: row.color || '#ffffff'
    };
  }

  function syncCounts() {
    const swCount = Math.max(1, Math.min(48, Number($('switchPortCount').value) || 16));
    $('switchPortCount').value = swCount;
    while (switchRows.length < swCount) switchRows.push({ port: switchRows.length + 1, untagged: '', tagged: '', label: '', color: '#ffffff' });
    while (switchRows.length > swCount) switchRows.pop();
    switchRows = switchRows.map(normalizeSwitchRow);

    const rackCount = Math.max(1, Math.min(48, Number($('rackPortCount').value) || 12));
    $('rackPortCount').value = rackCount;
    while (rackRows.length < rackCount) rackRows.push({ port: rackRows.length + 1, top: '', bottom: '', color: '#ffffff' });
    while (rackRows.length > rackCount) rackRows.pop();
    rackRows = rackRows.map(normalizeRackRow);
  }

  function optionList(selected = '') {
    const opts = ['<option value="">—</option>'];
    for (const v of getVlanChoices()) {
      opts.push(`<option value="${escapeHtml(v)}" ${String(selected) === String(v) ? 'selected' : ''}>VLAN ${escapeHtml(v)}</option>`);
    }
    return opts.join('');
  }

  function multiOptionList(selectedCsv = '') {
    const selected = new Set(splitVlans(selectedCsv));
    return getVlanChoices().map(v => `<option value="${escapeHtml(v)}" ${selected.has(String(v)) ? 'selected' : ''}>VLAN ${escapeHtml(v)}</option>`).join('');
  }

  function portSummary(r) {
    const parts = [];
    if (r.untagged) parts.push(`U:${r.untagged}`);
    if (r.tagged) parts.push(`T:${r.tagged}`);
    return parts.join('  ');
  }

  function renderSwitchPreview() {
    const width = Math.max(50, Number($('switchWidth').value) || 180);
    const portHeight = Math.max(12, Number($('switchPortHeight').value) || 34);
    const perRow = Math.max(1, Number($('switchPortsPerRow').value) || 8);
    const legend = new Map();
    switchRows.forEach(r => {
      if (r.untagged) legend.set(`u-${r.untagged}-${r.color}`, { label: `Untagged/PVID VLAN ${r.untagged}`, color: r.color });
      splitVlans(r.tagged).forEach(v => legend.set(`t-${v}-${r.color}`, { label: `Tagged VLAN ${v}`, color: r.color }));
    });

    $('switchPreview').innerHTML = `
      <div class="preview-title">${escapeHtml($('switchName').value)}</div>
      <div class="switch-label" style="width:${width}mm">
        <div class="switch-grid" style="grid-template-columns:repeat(${perRow},1fr)">
          ${switchRows.map((r, i) => `
            <div class="port-box" style="min-height:${portHeight}mm;background:${escapeHtml(r.color)}">
              <input class="port-color no-print" type="color" value="${escapeHtml(r.color)}" data-kind="switch" data-index="${i}" data-field="color" title="Port-Farbe">
              <div class="port-editor no-print">
                <strong>Port ${escapeHtml(r.port)}</strong>
                <input value="${escapeHtml(r.label)}" data-kind="switch" data-index="${i}" data-field="label" placeholder="Beschriftung">
                <label>Untagged/PVID
                  <select data-kind="switch" data-index="${i}" data-field="untagged">${optionList(r.untagged)}</select>
                </label>
                <label>Tagged VLANs
                  <select multiple data-kind="switch" data-index="${i}" data-field="tagged">${multiOptionList(r.tagged)}</select>
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
          <span class="legend-item"><strong>T</strong> = Tagged</span>
          ${[...legend.values()].map(x => `<span class="legend-item"><span class="swatch" style="background:${escapeHtml(x.color)}"></span>${escapeHtml(x.label)}</span>`).join('')}
        </div>
      </div>
      <div class="cut-hint">Druckdialog: Skalierung 100% / tatsächliche Größe wählen.</div>`;
  }

  function renderRackPreview() {
    const width = Math.max(50, Number($('rackWidth').value) || 430);
    const height = Math.max(5, Number($('rackHeight').value) || 20);
    const fontSize = Math.max(4, Number($('rackFontSize').value) || 8);
    $('rackPreview').innerHTML = `
      <div class="preview-title">${escapeHtml($('rackName').value)}</div>
      <div class="rack-strip" style="width:${width}mm;min-height:${height}mm;grid-template-columns:repeat(${rackRows.length},1fr);font-size:${fontSize}pt">
        ${rackRows.map((r, i) => `
          <div class="rack-cell" style="background:${escapeHtml(r.color)}">
            <div class="rack-editor no-print">
              <input value="${escapeHtml(r.top || r.port)}" data-kind="rack" data-index="${i}" data-field="top" placeholder="oben">
              <input value="${escapeHtml(r.bottom)}" data-kind="rack" data-index="${i}" data-field="bottom" placeholder="unten">
              <input class="rack-color" type="color" value="${escapeHtml(r.color)}" data-kind="rack" data-index="${i}" data-field="color" title="Farbe">
            </div>
            <div class="port-print">
              <div class="rack-top">${escapeHtml(r.top || r.port)}</div>
              <div class="rack-bottom">${escapeHtml(r.bottom)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div class="cut-hint">Ethercon-Streifen messen und Breite/Höhe in mm eintragen.</div>`;
  }

  function renderAll() {
    syncCounts();
    renderSwitchPreview();
    renderRackPreview();
    setView(currentView, false);
  }

  function setView(view, update = true) {
    currentView = view;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
    $('switchControls').classList.toggle('active', view === 'switch');
    $('rackControls').classList.toggle('active', view === 'rack');
    $('switchPreview').classList.toggle('active', view === 'switch');
    $('rackPreview').classList.toggle('active', view === 'rack');
    if (update) renderAll();
  }

  function onPreviewInput(e) {
    const el = e.target;
    const { kind, index, field } = el.dataset;
    if (!kind || field === undefined || index === undefined) return;
    const i = Number(index);
    if (!Number.isInteger(i)) return;
    if (kind === 'switch' && switchRows[i]) {
      if (field === 'tagged') switchRows[i].tagged = [...el.selectedOptions].map(o => o.value).join(',');
      else switchRows[i][field] = el.value;
      renderSwitchPreview();
    }
    if (kind === 'rack' && rackRows[i]) {
      rackRows[i][field] = el.value;
      renderRackPreview();
    }
  }

  function toCsv(rows, keys) {
    const esc = v => `"${String(v ?? '').replaceAll('"', '""')}"`;
    return [keys.join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n');
  }

  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const parseLine = (line) => {
      const cells = []; let cur = ''; let quoted = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') quoted = !quoted;
        else if (ch === ',' && !quoted) { cells.push(cur); cur = ''; }
        else cur += ch;
      }
      cells.push(cur);
      return cells;
    };
    const headers = parseLine(lines.shift()).map(h => h.trim());
    return lines.map(line => {
      const cells = parseLine(line);
      return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
    });
  }

  function importCsv(file, target) {
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result || ''));
      if (target === 'switch') {
        switchRows = rows.map(normalizeSwitchRow);
        $('switchPortCount').value = switchRows.length || 1;
      } else {
        rackRows = rows.map(normalizeRackRow);
        $('rackPortCount').value = rackRows.length || 1;
      }
      renderAll();
    };
    reader.readAsText(file);
  }

  function bind() {
    document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => setView(tab.dataset.view)));
    ['switchName','switchPortCount','switchPortsPerRow','switchWidth','switchPortHeight','vlanChoices','rackName','rackPortCount','rackWidth','rackHeight','rackFontSize']
      .forEach(id => $(id).addEventListener('input', renderAll));
    $('switchPreview').addEventListener('input', onPreviewInput);
    $('switchPreview').addEventListener('change', onPreviewInput);
    $('rackPreview').addEventListener('input', onPreviewInput);
    $('rackPreview').addEventListener('change', onPreviewInput);
    $('printBtn').addEventListener('click', () => window.print());
    $('resetBtn').addEventListener('click', () => { switchRows = defaultSwitchRows(); rackRows = defaultRackRows(); $('switchPortCount').value = 16; $('rackPortCount').value = 12; renderAll(); });
    $('applyPort1Default').addEventListener('click', () => { switchRows[0] = { ...switchRows[0], port: 1, untagged: '10', tagged: '20', label: switchRows[0]?.label || 'Uplink / Trunk', color: switchRows[0]?.color || '#c4b5fd' }; renderAll(); });
    $('renumberPorts').addEventListener('click', () => { switchRows.forEach((r, i) => r.port = i + 1); renderAll(); });
    $('renumberRack').addEventListener('click', () => { rackRows.forEach((r, i) => r.port = i + 1); renderAll(); });
    $('clearSwitch').addEventListener('click', () => { switchRows = switchRows.map((r, i) => ({ port: i + 1, untagged: '', tagged: '', label: '', color: '#ffffff' })); renderAll(); });
    $('clearRack').addEventListener('click', () => { rackRows = rackRows.map((r, i) => ({ port: i + 1, top: '', bottom: '', color: '#ffffff' })); renderAll(); });
    $('exportSwitchCsv').addEventListener('click', () => download('switch-labels.csv', toCsv(switchRows, ['port','untagged','tagged','label','color'])));
    $('exportRackCsv').addEventListener('click', () => download('rack-labels.csv', toCsv(rackRows, ['port','top','bottom','color'])));
    $('importSwitchCsv').addEventListener('change', e => e.target.files[0] && importCsv(e.target.files[0], 'switch'));
    $('importRackCsv').addEventListener('change', e => e.target.files[0] && importCsv(e.target.files[0], 'rack'));
  }

  window.addEventListener('DOMContentLoaded', () => { bind(); renderAll(); });
})();
