# Anreicherung des K10plus mit BK-Notationen auf Grundlage von RVK-Notationen

Die Skripte in diesem Verzeichnis ermitteln Kataloganreicherung für den K10plus um fehlende BK-Notationen auf Grundlage vorhandener RVK-Notationen.

* `cpanfile` Perl-Dependencies (`cpanm --installdeps .`)

* `catmandu.yaml` Konfigurationsdatei

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

