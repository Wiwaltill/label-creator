# VLAN & Rack Label Generator

Statische Webanwendung für Switch-Port-Legenden und Rack-/Ethercon-Beschriftungsstreifen.

## Nutzung

1. ZIP entpacken.
2. `index.html` im Browser öffnen.
3. Im Switch-Reiter direkt in den Port-Kacheln beschriften.
4. Untagged/PVID und Tagged VLANs per Dropdown setzen.
5. Im Rack-Reiter Buchsen direkt in der Vorschau beschriften.
6. Über „Drucken / PDF“ ausgeben. Im Druckdialog Skalierung auf 100% bzw. „tatsächliche Größe“ stellen.

## Beispiel

Port 1 ist in den Beispieldaten bereits gesetzt auf:

- Untagged/PVID: VLAN 10
- Tagged: VLAN 20

## Hinweise

- Die App läuft komplett lokal ohne Server.
- Keine externen Bibliotheken, keine Internetverbindung nötig.
- Tagged VLANs sind eine Mehrfachauswahl. Auf Desktop: Strg/Cmd oder Shift gedrückt halten.
