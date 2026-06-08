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
  return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function bindInputs(ids) {
  ids.forEach(id => $(id).addEventListener('input', renderAll));
}

function normalizeSwitchRow(row) {
  // Backwards compatibility for old CSVs: vlan+mode becomes untagged/tagged.
  if (row.untagged === undefined && row.tagged === undefined) {
    const mode = String(row.mode || '').toLowerCase();
    row.untagged = mode.includes('tag') && !mode.includes('untag') ? '' : (row.vlan || '');
    row.tagged = mode.includes('tag') && !mode.includes('untag') ? (row.vlan || '') : '';
  }
  return {
    port: Number(row.port) || '',
    untagged: row.untagged ?? '',
    tagged: row.tagged ?? '',
    label: row.label ?? '',
    color: row.color || '#ffffff'
  };
}

function renderSwitchTable() {
  const table = $('switchTable');
  table.innerHTML = `<thead><tr><th>Port</th><th>Untagged / PVID</th><th>Tagged VLANs</th><th>Label</th><th>Farbe</th><th></th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector('tbody');
  switchRows.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="number" value="${escapeHtml(row.port)}" data-i="${idx}" data-k="port"></td>
      <td><input placeholder="z. B. 10" value="${escapeHtml(row.untagged)}" data-i="${idx}" data-k="untagged"></td>
      <td><input placeholder="z. B. 20,30" value="${escapeHtml(row.tagged)}" data-i="${idx}" data-k="tagged"></td>
      <td><input value="${escapeHtml(row.label)}" data-i="${idx}" data-k="label"></td>
      <td><input type="color" value="${escapeHtml(row.color)}" data-i="${idx}" data-k="color"></td>
      <td><button class="remove" data-remove-switch="${idx}">×</button></td>`;
    tbody.appendChild(tr);
  });
  table.querySelectorAll('input').forEach(input => input.addEventListener('input', onTableInput));
  table.querySelectorAll('[data-remove-switch]').forEach(btn => btn.addEventListener('click', () => {
    switchRows.splice(Number(btn.dataset.removeSwitch), 1);
    renderAll();
  }));
}

function renderRackTable() {
  const table = $('rackTable');
  table.innerHTML = `<thead><tr><th>Nr.</th><th>Oben</th><th>Unten</th><th>Farbe</th><th></th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector('tbody');
  rackRows.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="number" value="${escapeHtml(row.port)}" data-rack-i="${idx}" data-k="port"></td>
      <td><input value="${escapeHtml(row.top)}" data-rack-i="${idx}" data-k="top"></td>
      <td><input value="${escapeHtml(row.bottom)}" data-rack-i="${idx}" data-k="bottom"></td>
      <td><input type="color" value="${escapeHtml(row.color)}" data-rack-i="${idx}" data-k="color"></td>
      <td><button class="remove" data-remove-rack="${idx}">×</button></td>`;
    tbody.appendChild(tr);
  });
  table.querySelectorAll('input').forEach(input => input.addEventListener('input', onTableInput));
  table.querySelectorAll('[data-remove-rack]').forEach(btn => btn.addEventListener('click', () => {
    rackRows.splice(Number(btn.dataset.removeRack), 1);
    renderAll();
  }));
}

function onTableInput(e) {
  const target = e.target;
  const key = target.dataset.k;
  const value = target.type === 'number' ? Number(target.value) : target.value;
  if (target.dataset.i !== undefined) switchRows[Number(target.dataset.i)][key] = value;
  if (target.dataset.rackI !== undefined) rackRows[Number(target.dataset.rackI)][key] = value;
  renderPreviews();
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
        ${switchRows.map(r => `
          <div class="port-box" style="height:${portHeight}mm;background:${escapeHtml(r.color)}">
            <div class="port-head"><span>${escapeHtml(r.port)}</span><span>${escapeHtml(portSummary(r))}</span></div>
            <div class="port-label">${escapeHtml(r.label)}</div>
            <div class="port-vlans">
              ${r.untagged ? `<span class="vlan-pill">Untagged ${escapeHtml(r.untagged)}</span>` : ''}
              ${r.tagged ? `<span class="vlan-pill tagged">Tagged ${escapeHtml(r.tagged)}</span>` : ''}
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
}

function renderRackPreview() {
  const width = Number($('rackWidth').value);
  const height = Number($('rackHeight').value);
  const fontSize = Number($('rackFontSize').value);
  $('rackPreview').innerHTML = `
    <div class="preview-title">${escapeHtml($('rackName').value)}</div>
    <div class="rack-strip" style="width:${width}mm;height:${height}mm;grid-template-columns:repeat(${rackRows.length},1fr);font-size:${fontSize}pt">
      ${rackRows.map(r => `
        <div class="rack-cell" style="background:${escapeHtml(r.color)}">
          <div class="rack-top">${escapeHtml(r.top || r.port)}</div>
          <div class="rack-bottom">${escapeHtml(r.bottom)}</div>
        </div>`).join('')}
    </div>
    <div class="cut-hint">Tipp: Bei Ethercon-Buchsen Streifenbreite messen und hier in mm eintragen.</div>`;
}

function renderPreviews() { renderSwitchPreview(); renderRackPreview(); }
function renderAll() { syncCounts(); renderSwitchTable(); renderRackTable(); renderPreviews(); }

function setView(view) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
  $('switchControls').classList.toggle('active', view === 'switch');
  $('rackControls').classList.toggle('active', view === 'rack');
  $('switchPreview').classList.toggle('active', view === 'switch');
  $('rackPreview').classList.toggle('active', view === 'rack');
}

function toCsv(rows, keys) {
  const esc = v => `"${String(v ?? '').replaceAll('"', '""')}"`;
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
    const cells = line.match(/("(?:""|[^"])*"|[^,]*)/g).filter((_, i) => i % 2 === 0).map(c => c.replace(/^"|"$/g, '').replaceAll('""', '"'));
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
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

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => setView(tab.dataset.view)));
bindInputs(['switchName', 'switchPortCount', 'switchPortsPerRow', 'switchWidth', 'switchPortHeight', 'rackName', 'rackPortCount', 'rackWidth', 'rackHeight', 'rackFontSize']);
$('printBtn').addEventListener('click', () => window.print());
$('addSwitchRow').addEventListener('click', () => { switchRows.push({ port: switchRows.length + 1, untagged: '', tagged: '', label: '', color: '#ffffff' }); $('switchPortCount').value = switchRows.length; renderAll(); });
$('addRackRow').addEventListener('click', () => { rackRows.push({ port: rackRows.length + 1, top: '', bottom: '', color: '#ffffff' }); $('rackPortCount').value = rackRows.length; renderAll(); });
$('renumberPorts').addEventListener('click', () => { switchRows.forEach((r, i) => r.port = i + 1); renderAll(); });
$('renumberRack').addEventListener('click', () => { rackRows.forEach((r, i) => r.port = i + 1); renderAll(); });
$('exportSwitchCsv').addEventListener('click', () => download('switch-labels.csv', toCsv(switchRows, ['port','untagged','tagged','label','color'])));
$('exportRackCsv').addEventListener('click', () => download('rack-labels.csv', toCsv(rackRows, ['port','top','bottom','color'])));
$('importSwitchCsv').addEventListener('change', e => e.target.files[0] && importCsv(e.target.files[0], 'switch'));
$('importRackCsv').addEventListener('change', e => e.target.files[0] && importCsv(e.target.files[0], 'rack'));
$('resetBtn').addEventListener('click', () => location.reload());
renderAll();
