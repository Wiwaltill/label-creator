# VLAN & Rack Label Generator v3

Statische Web-App ohne Server. `index.html` im Browser öffnen.

## Neu in v3

- Switch-Ports direkt in der Vorschau bearbeiten
- Untagged/PVID als Dropdown
- Tagged VLANs als Mehrfachauswahl-Dropdown
- VLAN-Liste frei konfigurierbar, z. B. `10,20,30,40`
- Port 1 kann per Button direkt auf `Untagged VLAN 10` + `Tagged VLAN 20` gesetzt werden
- Rack-/Ethercon-Beschriftung ebenfalls direkt in der Vorschau editierbar

## Drucken

Über **Drucken / PDF exportieren** öffnen. Im Druckdialog Skalierung auf **100% / tatsächliche Größe** stellen.

## CSV

Switch-CSV: `port,untagged,tagged,label,color`

Rack-CSV: `port,top,bottom,color`


## v4 Fehlerkorrektur

Die JavaScript-Datei verwendet nun keine neueren Operatoren wie `||=`, `??` oder `replaceAll` mehr. Dadurch funktioniert die App auch in älteren Browsern zuverlässiger. Außerdem bleiben die direkten Port- und Rack-Editoren auf dem Bildschirm sichtbar und nur beim Drucken werden die kompakten Druckansichten verwendet.
