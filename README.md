# VLAN Label Generator

Lokale Webanwendung zur Erstellung von Switch-Port-Legenden und Rack-/Ethercon-Beschriftungen.

## Start

1. ZIP entpacken
2. `index.html` im Browser öffnen
3. VLANs anlegen, Ports anklicken und zuweisen
4. Über **Drucken / PDF** ausgeben

Die Anwendung läuft vollständig lokal. Es wird kein Server und keine Internetverbindung benötigt.

## Wichtige Funktionen

- Zentrale VLAN-Verwaltung mit ID, Name und Farbe
- Port-Bearbeitung direkt am visualisierten Switch
- Untagged/PVID als Auswahlfeld
- Tagged VLANs als Mehrfachauswahl
- Port übernimmt automatisch den Namen und die Farbe des Untagged-VLANs
- Portname kann optional überschrieben werden
- Definierte Farbpalette statt Betriebssystem-Farbdialog
- Speicherung mehrerer Switche im Browser per Local Storage
- JSON-Import und JSON-Export für Backup oder Weitergabe
- Rack-/Ethercon-Beschriftungsstreifen mit editierbaren Feldern
- Druckoptimierung inklusive Farbdruck über `print-color-adjust`

## Beispiel

Port 1:

- Untagged/PVID: VLAN 10 Management
- Tagged: VLAN 20 Clients

Anzeige im Port:

```text
Management
U:10
T:20
```

## Speichern

Über **Speichern** wird der aktuelle Switch unter dem eingetragenen Namen im Browser gespeichert. Die Daten bleiben auf demselben Gerät und im selben Browser erhalten.

Für ein zusätzliches Backup kann die Konfiguration als JSON exportiert und später wieder importiert werden.

## Druckhinweise

Für korrekte Farben im Ausdruck:

- Im Browserdruckdialog „Hintergrundgrafiken“ bzw. „Background graphics“ aktivieren
- Maßstab auf 100 % oder „Tatsächliche Größe“ stellen
- Kopf- und Fußzeilen deaktivieren
- Vor dem ersten Ausdruck als PDF prüfen

## Dateien

- `index.html` – Oberfläche
- `styles.css` – Layout und Druckdarstellung
- `app.js` – Logik, Speicherung, Import/Export
- `README.md` – diese Dokumentation
