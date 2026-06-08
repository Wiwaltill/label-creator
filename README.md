# VLAN & Rack Label Generator

Statische Web-App zur lokalen Erstellung von Switch-Port-Legenden und Rack-/Ethercon-Beschriftungsstreifen.

## Nutzung

1. ZIP entpacken.
2. `index.html` im Browser öffnen.
3. Werte eintragen.
4. Über **Drucken / PDF exportieren** ausgeben.
5. Im Druckdialog **Skalierung 100 %** bzw. **Tatsächliche Größe** wählen.

## Switch-Legende

Die Switch-Tabelle unterstützt getrennte VLAN-Angaben pro Port:

- `untagged`: Native VLAN / PVID, z. B. `10`
- `tagged`: ein oder mehrere getaggte VLANs, z. B. `20` oder `20,30,40`
- `label`: frei wählbarer Portname, z. B. `AP`, `Trunk`, `Mgmt`
- `color`: Farbe für die visuelle Gruppe

Beispiel:  
Port 1 mit VLAN 10 untagged und VLAN 20 tagged:

```csv
port,untagged,tagged,label,color
"1","10","20","Uplink / Trunk","#c4b5fd"
```

In der Vorschau wird das als `U:10 T:20` angezeigt. Die Legende erklärt `U = Untagged/PVID` und `T = Tagged VLANs`.

Alte CSV-Dateien mit `port,vlan,label,mode,color` werden beim Import weiterhin grob unterstützt.

## Rack-Blende

CSV-Spalten:

```csv
port,top,bottom,color
```

`top` und `bottom` werden als zwei Textzeilen pro Buchse angezeigt.

## Dateien

- `index.html` – Oberfläche
- `styles.css` – Layout und Druckformatierung
- `app.js` – Logik, CSV-Import/Export, Vorschau
