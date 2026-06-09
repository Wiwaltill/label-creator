(function () {
  'use strict';

  function byId(id) { return document.getElementById(id); }

  var switchPorts = [];
  var rackPorts = [];
  var activePage = 'switch';

  function initialSwitchPorts() {
    var labels = ['Uplink / Trunk','Mgmt','Audio','Audio','Licht','Licht','Video','Trunk','AP','Gast','Gast','Office','Spare','Spare','AP','AP'];
    var untagged = ['10','10','20','20','30','30','40','10','10','50','50','60','','','10','10'];
    var tagged = [['20'],[],[],[],[],[],[],['20','30','40'],['20','80'],[],[],[],[],[],['80'],['80']];
    var colors = ['#c4b5fd','#93c5fd','#86efac','#86efac','#fde68a','#fde68a','#fca5a5','#ddd6fe','#bfdbfe','#a7f3d0','#a7f3d0','#bfdbfe','#e5e7eb','#e5e7eb','#ddd6fe','#ddd6fe'];
    var arr = [];
    for (var i = 0; i < 16; i++) arr.push({ number: i + 1, label: labels[i], untagged: untagged[i], tagged: tagged[i], color: colors[i] });
    return arr;
  }

  function initialRackPorts() {
    var top = ['MAIN L','MAIN R','MON 1','MON 2','FOH A','FOH B','NET A','NET B','SPARE','SPARE','REC L','REC R'];
    var bottom = ['XLR','XLR','XLR','XLR','CAT','CAT','CAT','CAT','','','XLR','XLR'];
    var arr = [];
    for (var i = 0; i < 12; i++) arr.push({ top: top[i], bottom: bottom[i], color: '#ffffff' });
    return arr;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function splitValues(value) {
    return String(value || '').split(/[;,\s]+/).map(function (v) { return v.trim(); }).filter(Boolean);
  }

  function vlanOptions() {
    var values = splitValues(byId('vlanList').value);
    switchPorts.forEach(function (p) {
      if (p.untagged) values.push(p.untagged);
      (p.tagged || []).forEach(function (v) { values.push(v); });
    });
    var seen = {};
    var unique = [];
    values.forEach(function (v) { if (!seen[v]) { seen[v] = true; unique.push(v); } });
    unique.sort(function (a, b) {
      var na = Number(a), nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return String(a).localeCompare(String(b), 'de');
    });
    return unique;
  }

  function syncSizes() {
    var swCount = Math.max(1, Math.min(48, Number(byId('switchCount').value) || 16));
    byId('switchCount').value = swCount;
    while (switchPorts.length < swCount) switchPorts.push({ number: switchPorts.length + 1, label: '', untagged: '', tagged: [], color: '#ffffff' });
    while (switchPorts.length > swCount) switchPorts.pop();
    switchPorts.forEach(function (p, i) { p.number = i + 1; if (!Array.isArray(p.tagged)) p.tagged = splitValues(p.tagged); });

    var rackCount = Math.max(1, Math.min(48, Number(byId('rackCount').value) || 12));
    byId('rackCount').value = rackCount;
    while (rackPorts.length < rackCount) rackPorts.push({ top: '', bottom: '', color: '#ffffff' });
    while (rackPorts.length > rackCount) rackPorts.pop();
  }

  function fillSelect(select, selected, allowEmpty) {
    select.innerHTML = '';
    if (allowEmpty) {
      var empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '—';
      select.appendChild(empty);
    }
    vlanOptions().forEach(function (v) {
      var option = document.createElement('option');
      option.value = v;
      option.textContent = 'VLAN ' + v;
      if (Array.isArray(selected)) option.selected = selected.indexOf(v) !== -1;
      else option.selected = String(selected || '') === String(v);
      select.appendChild(option);
    });
  }

  function renderSwitch() {
    syncSizes();
    byId('switchTitle').textContent = byId('switchName').value || 'Switch';
    var width = Math.max(40, Number(byId('switchWidth').value) || 180);
    var height = Math.max(14, Number(byId('portHeight').value) || 38);
    var perRow = Math.max(1, Number(byId('portsPerRow').value) || 8);
    byId('switchLabel').style.width = width + 'mm';
    var grid = byId('switchGrid');
    grid.style.gridTemplateColumns = 'repeat(' + perRow + ', 1fr)';
    grid.innerHTML = '';

    switchPorts.forEach(function (port, index) {
      var node = byId('portTemplate').content.firstElementChild.cloneNode(true);
      node.style.background = port.color || '#ffffff';
      node.style.minHeight = height + 'mm';
      node.querySelector('.port-number').textContent = 'Port ' + port.number;
      node.querySelector('.print-port').textContent = port.number;
      var vlanText = [];
      if (port.untagged) vlanText.push('U:' + port.untagged);
      if (port.tagged && port.tagged.length) vlanText.push('T:' + port.tagged.join(','));
      node.querySelector('.print-vlan').textContent = vlanText.join('  ');
      node.querySelector('.print-label').textContent = port.label || '';

      var color = node.querySelector('.color-picker');
      color.value = port.color || '#ffffff';
      color.addEventListener('input', function () { port.color = color.value; node.style.background = color.value; });

      var label = node.querySelector('.port-label-input');
      label.value = port.label || '';
      label.addEventListener('input', function () { port.label = label.value; node.querySelector('.print-label').textContent = label.value; });

      var untagged = node.querySelector('.untagged-select');
      fillSelect(untagged, port.untagged, true);
      untagged.addEventListener('change', function () { port.untagged = untagged.value; renderSwitch(); });

      var tagged = node.querySelector('.tagged-select');
      fillSelect(tagged, port.tagged || [], false);
      tagged.addEventListener('change', function () {
        port.tagged = Array.prototype.slice.call(tagged.selectedOptions).map(function (o) { return o.value; });
        renderSwitch();
      });

      grid.appendChild(node);
    });
  }

  function renderRack() {
    syncSizes();
    byId('rackTitle').textContent = byId('rackName').value || 'Rack-Blende';
    var strip = byId('rackStrip');
    strip.style.width = Math.max(40, Number(byId('rackWidth').value) || 430) + 'mm';
    strip.style.minHeight = Math.max(8, Number(byId('rackHeight').value) || 22) + 'mm';
    strip.style.gridTemplateColumns = 'repeat(' + rackPorts.length + ', 1fr)';
    strip.style.fontSize = Math.max(5, Number(byId('rackFontSize').value) || 8) + 'pt';
    strip.innerHTML = '';

    rackPorts.forEach(function (port, index) {
      var node = byId('rackTemplate').content.firstElementChild.cloneNode(true);
      node.style.background = port.color || '#ffffff';
      node.querySelector('.rack-top').textContent = port.top || String(index + 1);
      node.querySelector('.rack-bottom').textContent = port.bottom || '';

      var top = node.querySelector('.rack-top-input');
      top.value = port.top || '';
      top.addEventListener('input', function () { port.top = top.value; node.querySelector('.rack-top').textContent = top.value || String(index + 1); });

      var bottom = node.querySelector('.rack-bottom-input');
      bottom.value = port.bottom || '';
      bottom.addEventListener('input', function () { port.bottom = bottom.value; node.querySelector('.rack-bottom').textContent = bottom.value; });

      var color = node.querySelector('.rack-color-input');
      color.value = port.color || '#ffffff';
      color.addEventListener('input', function () { port.color = color.value; node.style.background = color.value; });

      strip.appendChild(node);
    });
  }

  function setActive(page) {
    activePage = page;
    byId('tabSwitch').classList.toggle('active', page === 'switch');
    byId('tabRack').classList.toggle('active', page === 'rack');
    byId('switchSettings').classList.toggle('active', page === 'switch');
    byId('rackSettings').classList.toggle('active', page === 'rack');
    byId('switchPage').classList.toggle('active', page === 'switch');
    byId('rackPage').classList.toggle('active', page === 'rack');
  }

  function renderAll() { renderSwitch(); renderRack(); setActive(activePage); }

  function bind() {
    byId('tabSwitch').addEventListener('click', function () { setActive('switch'); });
    byId('tabRack').addEventListener('click', function () { setActive('rack'); });
    byId('printBtn').addEventListener('click', function () { window.print(); });
    byId('sampleBtn').addEventListener('click', function () { switchPorts = initialSwitchPorts(); rackPorts = initialRackPorts(); byId('switchCount').value = 16; byId('rackCount').value = 12; renderAll(); });
    byId('applyPort1').addEventListener('click', function () { if (!switchPorts[0]) switchPorts[0] = { number: 1, label: '', untagged: '', tagged: [], color: '#ffffff' }; switchPorts[0].untagged = '10'; switchPorts[0].tagged = ['20']; if (!switchPorts[0].label) switchPorts[0].label = 'Uplink / Trunk'; renderSwitch(); });
    byId('clearSwitch').addEventListener('click', function () { switchPorts = switchPorts.map(function (p, i) { return { number: i + 1, label: '', untagged: '', tagged: [], color: '#ffffff' }; }); renderSwitch(); });
    byId('clearRack').addEventListener('click', function () { rackPorts = rackPorts.map(function () { return { top: '', bottom: '', color: '#ffffff' }; }); renderRack(); });

    ['switchName','switchCount','portsPerRow','switchWidth','portHeight','vlanList','rackName','rackCount','rackWidth','rackHeight','rackFontSize'].forEach(function (id) {
      byId(id).addEventListener('input', renderAll);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    switchPorts = initialSwitchPorts();
    rackPorts = initialRackPorts();
    bind();
    renderAll();
  });
})();
