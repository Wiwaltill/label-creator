# VLAN & Rack Label Generator

Eine kleine statische Webanwendung zum Erstellen von:

- Switch-Port-Legenden für VLANs
- Beschriftungsstreifen für Rack-Blenden / Ethercon-Buchsen

## Start

1. ZIP entpacken.
2. `index.html` im Browser öffnen.
3. Daten eintragen oder CSV importieren.
4. Über **Drucken / PDF exportieren** ausgeben.

## Druckhinweise

- Im Druckdialog **Skalierung: 100% / tatsächliche Größe** wählen.
- Browser-Kopf-/Fußzeilen deaktivieren.
- Für finale Etiketten zuerst auf Normalpapier testen und nachmessen.

## CSV-Formate

### Switch

```csv
port,vlan,label,mode,color
1,10,Mgmt,Untagged,#93c5fd
2,99,Trunk,Tagged,#c4b5fd
```

### Rack

```csv
port,top,bottom,color
1,MAIN L,XLR,#ffffff
2,NET A,CAT,#e5e7eb
```

## Anpassung

Alles liegt in drei Dateien:

- `index.html` – Oberfläche
- `styles.css` – Layout und Druckdesign
- `app.js` – Logik, CSV, Vorschau

Die App läuft komplett lokal ohne Server und ohne externe Abhängigkeiten.
