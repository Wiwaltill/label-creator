<?php
$pageTitle = $pageTitle ?? 'VLAN Label Generator';
$activePage = $activePage ?? '';
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($pageTitle) ?></title>
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
<header class="app-header no-print">
  <div>
    <h1>VLAN Label Generator</h1>
    <p>Beschriftungen für Switche, VLANs und Rackblenden lokal erstellen.</p>
  </div>
  <nav class="main-nav" aria-label="Hauptnavigation">
    <a class="<?= $activePage === 'switch' ? 'active' : '' ?>" href="index.php">Switches</a>
    <a class="<?= $activePage === 'rack' ? 'active' : '' ?>" href="rack.php">Rackblenden</a>
  </nav>
</header>
