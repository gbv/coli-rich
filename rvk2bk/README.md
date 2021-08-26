# Anreicherung des K10plus mit BK-Notationen auf Grundlage von RVK-Notationen

Im Rahmen des Projekt [coli-conc](https://coli-conc.gbv.de/) werden Mappings zwischen Klassen der Regensburger Verbundklassifikation (RVK) und Klassen der Basisklassifikation (BK) gesammelt, erstellt und kontrolliert (siehe [RVK-BK-Mappings in der Konkordanzdatenbank](https://coli-conc.gbv.de/cocoda/app/?toScheme=http%3A%2F%2Furi.gbv.de%2Fterminology%2Fbk%2F&fromScheme=http%3A%2F%2Furi.gbv.de%2Fterminology%2Frvk%2F&search=%7B%22fromScheme%22%3A%22RVK%22%2C%22toScheme%22%3A%22BK%22%7D)). Auf Grundlage dieser Mappings können Titeldatensätze im K10plus-Katalog um fehlende BK-Notationen ergänzt werden. Diese Anreicherung läuft unter dem Projektnamen **coli-rich**.

## Übersicht

Zur Anreicherung erfolgt in fünf Schritten:

1. [Erstellung von Mappings](#1-erstellung-von-mappings)
2. [Auswahl der für die Anreicherung in Frage kommenden Mappings](#2-auswahl-von-mappings)
3. [Auswahl der anzureichernden Titeldatensätze](#3-auswahl-von-titeldatensätzen)
4. Ermittlung der Anreicherung
5. Eintragung der Anreicherung im K10plus

Für den Produktivbetrieb werden Schritt 3 bis 5 dauerhaft und automatisch ablaufen.

### 1. Erstellung von Mappings

Zur Erstellung von Mappings dient die [Webanwendung Cocoda](https://coli-conc.gbv.de/cocoda/app/). Mappings können von allen Interessierten erstellt und per Benutzerinterface und APIs abgefragt werden. Jedes Mapping ist einem Benutzeraccount zugeordnet.

### 2. Auswahl von Mappings

Die Auswahl der für das Mapping in Frage kommenden Mappings basiert auf zwei Kritierien:

* Formal: Nur Mappings vom Mappingtype exactMatch (=) und narrowMatch (<) können für die automatische Anreicherung berücksichtigt werden, weil nur in diesen Fällen sicher ist dass alle mit einer RVK-Klassen (oder ihren Unterklassen) erschlossenen Titel auch in die gemappte BK-Klasse passen.

* Inhaltlich: Die ausgewählten Mappings müssen vertrauenswürdig sein. Die Auswahl kann auf Grundlage folgender Informationen erfolgen:

  * der Benutzeraccount unter dem ein Mapping erstellt wurde
  * ob das Mapping bestätigt wurde (die Bestätigung von Mappings ist nur ausgewählten Benutzeraccounts möglich)
  * ob und wie das Mapping bewertet wurde (alle Benutzeraccounts können Mappings mit +1 oder -1 bewerten)
  * ob und zu welcher Konkordanz das Mapping gehört (noch nicht umgesetzt)

  Momentan werden Mappings ausgewählt die *entweder* bestätigt wurden *oder* von einem ausgewählten Benutzeraccount stammen und nicht negativ bewertet wurden. Die Liste der ausgewählten Benutzeraccounts lässt sich konfigurieren.

Geplant is noch eine zusätzliche Konsistenzprüfung, nach der die ausgewählten Mappings in sich widerspruchsfrei sein müssen. So sollte beispielsweise eine RVK-Unterklasse nicht auf eine umfassendere BK-Klasse gemappt sein als ihre Oberklasse.

### 3. Auswahl von Titeldatensätzen

In der Pilotphase werden alle Titeldatensätze im K10plus ausgewählt, die mit RVK aber nicht mit BK erschlossen sind. Dabei gibt es zwei Möglichkeiten:

* Auswahl aller Titeldatensätze die mit einer RVK-Klasse oder mit in der Hierarchie darunter liegenden Klassen erschlossen sind (per SRU-Suchanfrage). Dies hat den Vorteil dass ausgehend von einem Mapping alle anzureichernden Titel ausgewählt werden können.

* Auswahl konkreter Titeldatensätze (per PPN oder PPN-Liste). Hierbei muss für jeden Titel einzeln geprüft werden ob und welche passenden Mappings zur Anreicherung vorhanden sind, was insgesamt langsamer ist.

Im Produktivbetrieb soll das Verfahren erweitert werden um vorhandene BK-Notationen zu überprüfen und um angereicherte BK-Notationen anzupassen wenn die ausgewählten Mappings geändert haben.

### 4. Ermittlung der Anreicherung

Nach Auswahl von Mappings und Titeldatensätzen können Datensätze mit einer RVK-Klasse α folgendermaßen um BK-Klassen angereichert werden:

* Gibt es ein Mapping α = β oder α < β passt die BK-Klasse β

* Gibt es stattdessen eine (ggf. transitive) Oberklasse γ von α mit einem Mapping γ = β oder γ < β dann passt ebenfalls die BK-Klasse β.
  Allerdings kann es sein, dass eine Unterklassen von β noch besser passen würde.

Die ermittelten Anreicherungen werden im [PICA Änderungsformat](https://pro4bib.github.io/pica/#/formate?id=%c3%84nderungsformat) zur Eintragung in den K10plus weitergegeben. Jede Anreicherung ist ein PICA-Feld `045Q/01` mit vier Unterfeldern:

* `$9` PPN des BK-Normdatensatzes
* `$a` BK-Notation
* `$A` Die Zeichenkette "`coli-conc RVK->BK`"
* `$A` Die URI des Mappings auf dessen Grundlage die Anreicherung ermittelt wurde

### 5. Eintragung der Anreicherung im K10plus

Die durch Anreicherung ermittelten Änderungen werden gesammelt und in Batches von einigen Tausend Änderungen in den K10plus eingetragen. Im Produktivbetrieb soll die Eintragung täglich oder mindestens wöchentlich erfolgen, so dass neu erstellte Mappings zeitnah zu Anreicherungen im K10plus führen. Je nach Anzahl der Datensätze ist auch eine Eintragung innerhalb von Minuten denkbar.

## Technische Umsetzung

Die Skripte in diesem Verzeichnis ermitteln Kataloganreicherung für den K10plus um fehlende BK-Notationen auf Grundlage vorhandener RVK-Notationen. Es handelt sich um eine erste Version in Perl, die später durch eine Neuimplementierung in JavaScript abgelöst werden soll.

### Installation und Konfiguration

* `cpanfile` Perl-Dependencies (`cpanm --installdeps .`)

* `catmandu.yaml` Konfigurationsdatei

## Skripte

* `./download-by-rvk.sh` läd Titeldatensätze beschränkt auf Normdatenfelder
  (BK und RVK) aus dem K10plus. Zur Vereinfachung der Suche nach RVK-Notationen
  werden nur Notationen aus zwei Buchstaben unterstützt, es werden jedoch alle
  mit diesen Buchstaben beginnenden Notationen gefunden.

  Das vollständige Herunterladen aller Datensätze mit RVK ist theoretisch so möglich (dauert fast einen
  Tag), es gibt aber einige Klassen deren Ergebnismengen zu groß sind:

  ~~~bash
  for X in {A..Z}; do for Y in {A..Z}; do ./download-by-rvk.sh $X$Y; done; done
  ~~~

* `/count.sh` zählt per SRU Anzahl der Titeldatensätze die eine gegebene Anfrage erfüllen.

* `rvkbk-mappings.sh` läd RVK-BK-Mappings vom Typ < oder = für eine gegebene RVK-Notation, mit Annotationen

* `trusted-mappings.jq`: filtern Mappings denen für die Anreicherung vertraut werden kann

* `rvk2bk.pl` sucht ausgehend von einer RVK-Notation nach passenden Mappings
  und geht die betreffende Download-Datei durch um BK-Anreicherung zu erzeugen. Beispiel:

  ~~~bash
  ./rvk2bk.pl "ET 500"  # TODO: Unterklassen einbeziehen
  ./rvk2bk.pl "XL"      # Ganze Oberklasse (weil auf BK-Blattknoten gemappt)
  ~~~

* `analysis.pl` durchläuft einen Teilbaum der RVK und ermittelt welcher Bereich durch Mappings abgedeckt ist.

## Beispiele

Hauptklassen der RVK, die per exactMatch auf eine BK-Unterklasse der untersten Ebene gemappt sind:

* `XL` Rechtsmedizin
* `YG` Neurologie
* `YP` Zahnmedizin
* `YQ` Kinderheilkunde
* `WT` Verhaltensforschung und Tierpsychologie

Klassen der RVK, die per exactMatch auf eine beliebige BK-Klasse gemappt sind:

* `ET 500` Lexikologie
* `ST 240 - ST 250` Programmiersprachen (derzeit nicht unterstützt, da Unterklassen relevant)

## Auswertung Vollständigkeit

Das Skript `analysis.pl` durchläuft einen Teilbaum der RVK und ermittelt welcher Bereich durch Mappings abgedeckt ist. Beispiel:

~~~
./analysis.pl WE
 WE                                      Cytologie
  WE 1400                                 Serien
  WE 2400 - WE 2439                       < 42.15 ok
  WE 2000 - WE 2039                       < 42.15 ok
  WE 6000                                 Ultrastruktur, Histochemie
  WE 6008                                 Internationale Kongresse für Histochemie und Cytochemie
  WE 1200                                 Nachschlage- und Tabellenwerke
  WE 2200                                 < 42.15 ok
  WE 5000 - WE 5700                       < 42.15 ok
  WE 2600                                 < 42.23 ok
  WE 2300 - WE 2339                       < 42.15 ok
  WE 1600                                 Kongresse
  WE 2500                                 < 42.15 ok
  WE 2100                                 < 42.15 ok
  WE 2900 - WE 2960                       < 42.15 ok
  WE 1800                                 < 42.15 ok
  WE 3000 - WE 4800                       < 42.15 ok
  WE 1000                                 < 42.15 ok

./analysis.pl 'WD 2000 - WD 3100'
  WD 2000 - WD 3100                       Biophysik
   WD 2200                                 < 42.12 ok
   WD 2000                                 < 42.12 ok
   WD 2350                                 < 42.12 ok
   WD 2700                                 Biophysik der Temperatur
   WD 2600                                 Bioelektrizität und Biomagnetismus
   WD 2400                                 = 35.72 ok
   WD 2500                                 Strahlenbiologie, Biophysik und Biochemie der Radioaktivität ; "Advances in radiation biology"
   WD 2100                                 < 42.12 ok
   WD 3000                                 < 42.12 ok
   WD 2800                                 < 42.12 ok
   WD 3100                                 < 42.12 ok
   WD 2950                                 < 42.12 ok
   WD 2300                                 < 42.12 ok
~~~

Für noch nicht gemappte Klassen wird die Klassenbenennung ausgegeben.

## Statistik

Mit dem Skript `count.sh` kann eine Anzahl von Datensätzen per SRU gezählt werden:

Anzahl von Datensätzen, deren Sacherschließung mit Mappings angereichert wurde:

    ./count.sh 'pica.seq=coli-conc.*'

Anzahl von Datensätzen, deren Sacherschließung mit RVK-Mappings angereichert wurde:

    ./count.sh 'pica.seq="coli-conc rvk.*"'

Anzahl von Datensätzen, deren Sacherschließung mit RVK-BK-Mappings angereichert wurde:

    ./count.sh 'pica.seq="coli-conc rvk bk"'

Anzahl von Datensätzen, deren Sacherschließung mit einem bestimmten Mapping angreichert wurde
(Achtung: Sonderzeichen durch Leerzeichen ersetzen!)
Beispiel: Mapping <https://coli-conc.gbv.de/api/mappings/5812d5a4-4301-4677-9236-e6e3b8d68f24>:

    ./count.sh 'pica.seq="https coli conc gbv de api mappings d415aba4-14c2-4a9c-822a-1a589787545d"'

