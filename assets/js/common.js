'use strict';

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
  { name: 'Dunkelgrau', value: '#cbd5e1' },
  { name: 'Weiß', value: '#ffffff' }
];

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function textColorFor(hex) {
  const normalized = String(hex || '#e5e7eb').replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16) || 0;
  const g = parseInt(normalized.substring(2, 4), 16) || 0;
  const b = parseInt(normalized.substring(4, 6), 16) || 0;
  return ((r * 299 + g * 587 + b * 114) / 1000) > 150 ? '#111827' : '#ffffff';
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function fillPaletteSelect(select, selected) {
  select.innerHTML = '';
  PALETTE.forEach(color => {
    const opt = document.createElement('option');
    opt.value = color.value;
    opt.textContent = color.name;
    opt.selected = color.value === selected;
    opt.style.backgroundColor = color.value;
    select.appendChild(opt);
  });
  select.classList.add('color-select');
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.replace(/[^a-z0-9_.-]+/gi, '_');
  a.click();
  URL.revokeObjectURL(a.href);
}

function readJsonFile(file, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    try { callback(JSON.parse(reader.result)); }
    catch { alert('JSON konnte nicht importiert werden.'); }
  };
  reader.readAsText(file);
}
