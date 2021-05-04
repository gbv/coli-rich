# Anreicherung des K10plus mit BK-Notationen auf Grundlage von RVK-Notationen

Die Skripte in diesem Verzeichnis ermitteln Kataloganreicherung für den K10plus um fehlende BK-Notationen auf Grundlage vorhandener RVK-Notationen.

* `cpanfile` Perl-Dependencies (`cpanm --installdeps .`)

* `catmandu.yaml` Konfigurationsdatei

*  `./download-by-rvk.sh` läd Titeldatensätze beschränkt auf Normdatenfelder
   (BK und RVK) aus dem K10plus. Zur Vereinfachung der Suche nach RVK-Notationen
   werden nur Notationen aus zwei Buchstaben unterstützt, es werden jedoch alle
   mit diesen Buchstaben beginnenden Notationen gefunden.

Das vollständige Herunterladen aller Datensätze mit RVK ist theoretisch so möglich (dauert fast einen
Tag), es gibt aber einige Klassen deren Ergebnismengen zu groß sind:

    ~~~bash
    for X in {A..Z}; do for Y in {A..Z}; do ./download-by-rvk.sh $X$Y; done; done
    ~~~

* `rvk2bk.pl` sucht ausgehend von einer RVK-Notation nach einem passenden 1-zu-1 exactMatch-Mapping
  und geht die betreffende Download-Datei durch um BK-Anreicherung zu erzeugen. Beispiel:

    ./rvk2bk.pl "ET 500"  # TODO: Unterklassen einbeziehen
    ./rvk2bk.pl "XL"      # Ganze Oberklasse (weil auf BK-Blattknoten gemappt)

## Beispiele

Hauptklassen der RVK, die per exactMatch auf eine BK-Unterklasse der untersten Ebene gemappt sind:

* `XL` Rechtsmedizin
* `YG` Neurologie
* `YP` Zahnmedizin
* `YQ` Kinderheilkunde

Klassen der RVK, die per exactMatch auf eine beliebige BK-Klasse gemappt sind:

* `ET 500` Lexikologie
* `ST 240 - ST 250` Programmiersprachen (derzeit nicht unterstützt, da Unterklassen relevant)
