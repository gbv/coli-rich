# Anreicherung von Sacherschließung

Ein wesentliches Ziel des [Projekt coli-conc](https://coli-conc.gbv.de/) besteht in der Anreicherung der vorhandenen, heterogenen Sacherschließung in Bibliothekskatalogen mittels Konkordanzen zwischen verschiedenen Erschließungssystemen. Zur Ermittlung welche Anreicherung an einem PICA-Datensatz auf Grundlage von im Rahmen von coli-conc gesammelten Mappings vorgenommen werden kann, dient die Komponente **coli-rich**. Sie besteht aus Zwei Teilen:

1. Ein Webservice zur Abfrage von Anreicherungen in maschinenlesbarer Form
2. Ein Benutzerinterface zum Ausprobieren der Anreicherung (siehe <https://gbv.github.io/coli-rich/>)

Beide liefern die gleichen Ergebnisse. Per Benutzerinterface lässt sich eine Konfiguration erstellen die bestimmt, welche Art von Anreicherung auf Grundlage welcher Mappings erstellt werden sollen. Auch lässt sich das Ergebnis der konfigurierten Anreicherung an beliebigen Datensätzen direkt ausprobieren. Der Webservice ist dagegen für Massenabfragen mit einer ermittelten Konfiguration geeignet.

Als Eingabe dient eine PPN und eine PICA-Datenbank (standardmäßig der K10Plus-Katalog). Zurückgeliefert wird eine Liste von PICA-Feldern die hinzugefügt, geändert oder entfernt werden sollen. Bei neuen Erschließungsfeldern wird in Unterfeld `$A` die URI des Mappings eingetragen auf Grundlage welcher die Anreicherung ermittelt wurde. Mögliche Änderungen und Entfernungen betreffen nur die so gekennzeichneten Felder, beispielsweise wenn sich Mappings oder die Konfiguration geändert haben um die Anreicherung zu korrigieren oder zu verbessern.

Die Auswahl welche Datensätze angereichert werden sollen und die Eintragung der Änderung im PICA-Katalog und ist *nicht* Bestandteil von coli-rich. Dies hat den Vorteil dass Anreicherung gezielt vorgenommen werden kann und die Datenbank nicht mit Massen von Änderungen überlastet wird. Stattdessen können gezielt Datensätze angereichert werden, die beispielsweise

* einem bestimmten Bestand zugeordnet sind,
* über bereits über ausgewählte Sacherschließung verfügen, oder
* im Rahmen des Update-Prozess sowieso geändert werden müssen.

Bei Bedarf können im Rahmen von coli-rich allerdings Abfragen bereitgestellt werden die Datensätze ermitteln bei denen eine Anreicherung aussichtsreich ist. Im Handbuch *Einführung in die Verarbeitung von PICA-Daten* ist hierfür [ein Beispiel enthalten](https://pro4bib.github.io/pica/#/verarbeitung?id=schnittstellen).
