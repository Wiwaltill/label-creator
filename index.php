<?php
$pageTitle = 'Switch-Beschriftung | VLAN Label Generator';
$activePage = 'switch';
include __DIR__ . '/includes/header.php';
?>
<main class="layout">
  <aside class="sidebar no-print">
    <section class="panel">
      <h2>Switch</h2>
      <label>Switch-Name
        <input id="switchName" type="text" placeholder="z. B. FOH-Switch 1">
      </label>
      <div class="row">
        <button id="newSwitchBtn">Neu</button>
        <button id="saveSwitchBtn" class="primary">Speichern</button>
      </div>
      <label>Gespeicherte Switche
        <select id="savedSwitches"></select>
      </label>
      <div class="row">
        <button id="loadSwitchBtn">Laden</button>
        <button id="deleteSwitchBtn" class="danger">Löschen</button>
      </div>
      <div class="row">
        <button id="exportBtn">JSON exportieren</button>
        <label class="file-button">JSON importieren<input id="importInput" type="file" accept="application/json"></label>
      </div>
    </section>

    <section class="panel">
      <h2>VLANs vorbereiten</h2>
      <div id="vlanList" class="vlan-list"></div>
      <div class="vlan-form">
        <input id="newVlanId" type="number" min="1" max="4094" placeholder="ID">
        <input id="newVlanName" type="text" placeholder="Name">
        <select id="newVlanColor"></select>
        <button id="addVlanBtn">VLAN hinzufügen</button>
      </div>
      <p class="hint">VLANs werden zuerst hier angelegt und danach den Ports zugewiesen. Farben kommen aus einer festen Palette.</p>
    </section>

    <section class="panel">
      <h2>Port bearbeiten</h2>
      <div id="portEditor" class="editor-empty">Port anklicken, um ihn zu bearbeiten.</div>
    </section>

    <section class="panel">
      <h2>Ausgabe</h2>
      <button id="printBtn" class="primary">Drucken / PDF</button>
      <p class="hint">Beim Drucken im Browser „Hintergrundgrafiken“ aktivieren, damit die VLAN-Farben mitgedruckt werden.</p>
    </section>
  </aside>

  <section class="preview">
    <div class="print-page">
      <section class="print-section">
        <div class="title-row">
          <h2 id="printSwitchTitle">Switch</h2>
          <span class="subtitle">Port-Legende</span>
        </div>
        <div id="switchGrid" class="switch-grid"></div>
        <div id="legend" class="legend"></div>
      </section>
    </div>
  </section>
</main>
<script src="assets/js/common.js"></script>
<script src="assets/js/switch.js"></script>
<?php include __DIR__ . '/includes/footer.php'; ?>
