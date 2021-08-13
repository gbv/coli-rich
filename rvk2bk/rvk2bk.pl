#!/usr/bin/env perl
use v5.14;
use PICA::Data qw(1.18 :all);
use Catmandu qw(importer);
use JSON::API;

# Ausgehend von einer RVK-Notation
my $rvkNotation = shift @ARGV;
die "Bitte RVK-Klasse angeben (muss mit zwei Buchstaben anfangen)!\n"
  unless $rvkNotation =~ /^[A-Z][A-Z]/;

# PICA-Teildump einlesen (könnte auch direkt per SRU abgefragt werden)
my $rvkBase = substr $rvkNotation, 0, 2;
my $parser = pica_parser( 'plain', bless => 1, fh => "$rvkBase.pica" );

# Finde passendes Mapping (TODO: Nur bestätigte Mappings?)
my $api      = JSON::API->new('http://coli-conc.gbv.de/api/mappings');
my @mappings = @{
    $api->get(
        '',
        {
            from      => $rvkNotation,
            fromSchme => 'http://uri.gbv.de/terminology/rvk/',
            toScheme  => 'http://uri.gbv.de/terminology/bk/',
            type      => 'http://www.w3.org/2004/02/skos/core#exactMatch',
        }
    )
};
die "Kein exactMatch von RVK $rvkNotation auf BK gefunden\n"
  unless @mappings;

# TODO: auch Mappingtyp http://www.w3.org/2004/02/skos/core#narrowMatch berücksichtigen

@mappings = grep { scalar @{ $_->{to}{memberSet} } == 1 } @mappings;
die "Mehrere oder keine 1-zu-1 Mappings von RVK $rvkNotation auf BK gefunden\n"
  unless @mappings == 1;

# TODO: auch 1-zu-n Mappings z.B. <https://coli-conc.gbv.de/api/mappings/b91e597e-e91f-4932-938a-198233e96e61>

my $mappingUri = $mappings[0]->{uri} or die "Fehlende Mapping-URI";
my $bkNotation = $mappings[0]->{to}{memberSet}[0]{notation}[0]
  or die "Fehlende BK-Notation";

sub getBKByNotation {
    my $bkNotation = shift;

    my $bkConcepts = JSON::API->new('http://api.dante.gbv.de/')->get(
        '/data',
        {
            uri        => "http://uri.gbv.de/terminology/bk/$bkNotation",
            properties => 'narrower',
        }
    );
    die "BK $bkNotation nicht gefunden" unless @$bkConcepts == 1;

    # get PPN of BK record
    my $importer = importer( 'kxpnorm', query => "pica.bkl=$bkNotation" );
    my $bkRecord = $importer->next;
    die "Failed to get unique PPN for BK record $bkNotation\n"
      if !$bkRecord || $importer->next;

    $bkConcepts->[0]{PPN} = $bkRecord->{_id};
    return $bkConcepts->[0];
}

my $bkConcept = getBKByNotation($bkNotation);

my $rvkCheck;   # testet ob RVK-Klasse gleich oder unterhalb von rvkNotation ist
if ( length $rvkNotation == 2 ) {
    say "RVK $rvkNotation (und Unterklassen) => BK $bkNotation ($mappingUri)";
    $rvkCheck = sub { $_[0] =~ /^$rvkNotation / };
    die "BK $bkNotation is kein Blattkonzept\n"
      if @{ $bkConcept->{narrower} };
}
else {
    # TODO: auch Unterklassen einbeziehen
    say "RVK $rvkNotation => BK $bkNotation ($mappingUri)";
    $rvkCheck = sub { $_[0] eq $rvkNotation };
}

my $outFile = "$rvkNotation.rvk2bk.pica";
$outFile =~ s/ //g;
my $writer = pica_writer( 'plain', annotated => 1, fh => $outFile );
my $count;

while ( my $record = $parser->next ) {
    my $ppn = $record->fields('003@');
    my $bk  = $record->fields('045Q');
    my $rvk = $record->fields('045R');

    # Datensatz hat schon BK-Notation
    next if grep { $_ eq $bkNotation } $record->values('045Q$a');

    # Datensatz hat keine passende RVK-Notation zum Mappen
    next unless grep { $rvkCheck->($_) } $record->values('045R$a');

    $writer->write(
        [
            @$ppn,
            [
                '045Q', '01',
                9 => $bkConcept->{PPN},
                a => $bkNotation,
                A => 'coli-conc RVK->BK',
                A => $mappingUri,
                '+'
            ]
        ]
    );

    $count++;
}

say "Written $count changes to $outFile";
