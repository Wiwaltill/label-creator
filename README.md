# VLAN Label Generator

Kleine, lokal laufende Webanwendung zur Erstellung von Port- und Rack-Beschriftungen für Netzwerk- und Veranstaltungstechnik.

## Funktionen

### Switch-Port-Beschriftung

* Visualisierung eines 16-Port-Switches
* Direkte Bearbeitung durch Klick auf einen Port
* VLAN-Zuweisung pro Port
* Unterstützung für:

  * Untagged VLAN (PVID)
  * Mehrere Tagged VLANs
* Farbliche Kennzeichnung von VLANs
* Druckoptimierte Darstellung für Aufkleber oder Legenden

### Rack- und Ethercon-Beschriftung

* Erstellung von Beschriftungsstreifen für Rack-Blenden
* Freie Benennung der Anschlüsse
* Geeignet für Ethercon-, Netzwerk-, Audio- oder DMX-Panels
* Ausdruck als Papierstreifen oder Etikett

## Typische Anwendungsfälle

### Access-Port

Port 2:

* Untagged: VLAN 10
* Tagged: keine

Anzeige:
U:10

### Trunk-Port

Port 1:

* Untagged: VLAN 10
* Tagged: VLAN 20, VLAN 30

Anzeige:
U:10
T:20,30

## Bedienung

1. `index.html` im Browser öffnen
2. VLANs definieren
3. Gewünschten Port anklicken
4. Untagged VLAN auswählen
5. Tagged VLANs auswählen
6. Beschriftungen prüfen
7. Über die Druckfunktion des Browsers als PDF exportieren oder direkt ausdrucken

## Druckhinweise

Für saubere Ausdrucke:

* Browser-Zoom auf 100 %
* Druckmaßstab auf „Tatsächliche Größe“
* Kopf- und Fußzeilen deaktivieren
* PDF-Ausgabe vor dem ersten Ausdruck prüfen

## Ziel

Schnelle und saubere Dokumentation von VLAN-Zuweisungen und Rack-Anschlüssen ohne externe Software oder Cloud-Dienste.
