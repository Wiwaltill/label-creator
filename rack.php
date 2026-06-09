<?php
$pageTitle = 'Rackblenden | VLAN Label Generator';
$activePage = 'rack';
include __DIR__ . '/includes/header.php';
?>
<main class="layout">
  <aside class="sidebar no-print">
    <section class="panel">
      <h2>Rackblende</h2>
      <label>Projekt / Blende
        <input id="rackName" type="text" placeholder="z. B. Stagebox Panel A">
      </label>
      <label>Anzahl Buchsen
        <select id="rackCount">
          <option>4</option><option>6</option><option>8</option><option selected>12</option><option>16</option><option>24</option>
        </select>
      </label>
      <label>Beschriftungs-Prefix
        <input id="rackPrefix" type="text" value="PORT">
      </label>
      <button id="applyRackBtn" class="primary">Felder erzeugen</button>
    </section>

    <section class="panel">
      <h2>Speichern</h2>
      <div class="row">
        <button id="newRackBtn">Neu</button>
        <button id="saveRackBtn" class="primary">Speichern</button>
      </div>
      <label>Gespeicherte Rackblenden
        <select id="savedRacks"></select>
      </label>
      <div class="row">
        <button id="loadRackBtn">Laden</button>
        <button id="deleteRackBtn" class="danger">Löschen</button>
      </div>
      <div class="row">
        <button id="exportRackBtn">JSON exportieren</button>
        <label class="file-button">JSON importieren<input id="importRackInput" type="file" accept="application/json"></label>
      </div>
    </section>

    <section class="panel">
      <h2>Ausgabe</h2>
      <button id="printBtn" class="primary">Drucken / PDF</button>
      <p class="hint">Beschriftungen direkt im Feld anklicken und ändern.</p>
    </section>
  </aside>

  <section class="preview">
    <div class="print-page rack-only">
      <section class="print-section">
        <div class="title-row">
          <h2 id="printRackTitle">Rackblende</h2>
          <span class="subtitle">Ethercon-/Panel-Beschriftung</span>
        </div>
        <div id="rackGrid" class="rack-grid"></div>
      </section>
    </div>
  </section>
</main>
<script src="assets/js/common.js"></script>
<script src="assets/js/rack.js"></script>
<?php include __DIR__ . '/includes/footer.php'; ?>
