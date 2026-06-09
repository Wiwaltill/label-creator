# VLAN & Rack Label Generator

Statische Webanwendung zum lokalen Öffnen im Browser. Keine Installation, kein Server.

## Nutzung

1. ZIP entpacken.
2. `index.html` im Browser öffnen.
3. Switch oder Rack-Blende auswählen.
4. Direkt in den Port-/Rack-Feldern beschriften.
5. Über **Drucken / PDF** drucken oder als PDF speichern.

## Switch-Ports

- **Untagged/PVID**: genau ein VLAN pro Port per Dropdown.
- **Tagged VLANs**: mehrere VLANs per Mehrfachauswahl. Dafür Strg/Cmd oder Shift gedrückt halten.
- Die VLAN-Liste kannst du oben als kommagetrennte Liste pflegen, z. B. `10,20,30,40,80`.
- Beispielbutton: Port 1 auf `Untagged 10` und `Tagged 20` setzen.

## CSV

Switch CSV-Spalten: `port,untagged,tagged,label,color`

Rack CSV-Spalten: `port,top,bottom,color`
