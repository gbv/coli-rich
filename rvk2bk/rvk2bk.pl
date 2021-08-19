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
            type =>
'http://www.w3.org/2004/02/skos/core#exactMatch|http://www.w3.org/2004/02/skos/core#narrowMatch',
        }
    )
};
die "Keine Mappings RVK $rvkNotation ≤ ? BK gefunden.\n"
  unless @mappings;

# TODO: auch Mappingtyp http://www.w3.org/2004/02/skos/core#narrowMatch berücksichtigen

@mappings = grep { scalar @{ $_->{to}{memberSet} } == 1 } @mappings;
die "Mehrere oder keine 1-zu-1 Mappings von RVK $rvkNotation auf BK gefunden\n"
  unless @mappings == 1;

# TODO: auch 1-zu-n Mappings z.B. <https://coli-conc.gbv.de/api/mappings/b91e597e-e91f-4932-938a-198233e96e61>

# TODO validate Mapping
my $mappingUri = $mappings[0]->{uri};    # or die "Fehlende Mapping-URI";
my $bkNotation = $mappings[0]->{to}{memberSet}[0]{notation}[0]
  ;                                      #  or die "Fehlende BK-Notation";

my $bkConcept = getBKByNotation($bkNotation);

# TODO: auch innerhalb der BK Mappen?
die "BK $bkNotation is kein Blattkonzept\n"
  if @{ $bkConcept->{narrower} };

my $rvkCheck;   # testet ob RVK-Klasse gleich oder unterhalb von rvkNotation ist
if ( length $rvkNotation == 2 ) {
    say "RVK $rvkNotation (und Unterklassen) => BK $bkNotation ($mappingUri)";
    $rvkCheck = sub { $_[0] =~ /^$rvkNotation / };
}
else {
    # TODO: auch Unterklassen einbeziehen
    say "RVK $rvkNotation => BK $bkNotation ($mappingUri)";
    $rvkCheck = sub { isNarrowerOrEqualRVK( $rvkNotation, $_[0] ) };
}

my $outFile = "$rvkNotation.rvk2bk.pica";
$outFile =~ s/ //g;
my $writer = pica_writer( 'plain', annotated => 1, fh => $outFile );
my $count = 0;

sub isNarrowerOrEqualRVK {
    my ( $parent, $child ) = map { s/ //gr } @_;
    return 1 if $child eq $parent;

    if (   $parent =~ /^([A-Z]{2})(\d+)-([A-Z]{2})(\d+)$/
        && $1 eq $3
        && $2 < $4 )
    {
        my ( $class, $from, $to ) = ( $1, $2, $4 );
        if ( $child =~ /^([A-Z]{2})(\d+)$/ ) {
            return ( $class eq $1 && $2 >= $from && $2 <= $to );
        }
    }

    return;
}

while ( my $record = $parser->next ) {
    my $ppn = $record->fields('003@');
    my $bk  = $record->fields('045Q');
    my $rvk = $record->fields('045R');

    # Datensatz hat schon BK-Notation
    # TODO: ggf. bestehende BK-Notation ändern
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

    print "\r$count" unless ++$count % 10;
}
say;

if ($count) {
    say "Written $count changes to $outFile";
}
else {
    say "No changes.";
    unlink $outFile;
}

#### FUNCTIONS

# Look up a BK class by its notation.
# Returns JSKOS concept including "narrower" and additional key "PPN".
# Dies if BK class not found.
sub getBKByNotation {
    state %cache;

    my $notation = shift;
    return $cache{$notation} if exists $cache{$notation};

    my $concepts = JSON::API->new('http://api.dante.gbv.de/')->get(
        '/data',
        {
            uri        => "http://uri.gbv.de/terminology/bk/$notation",
            properties => 'narrower',
        }
    );
    die "BK $notation nicht gefunden" unless @$concepts == 1;

    # get PPN of BK record
    my $importer = importer( 'kxpnorm', query => "pica.bkl=$notation" );
    my $pica = $importer->next;
    die "Failed to get unique PPN for BK record $notation\n"
      if !$pica || $importer->next;

    $concepts->[0]{PPN} = $pica->{_id};

    $cache{$notation} = $concepts->[0];
    return $concepts->[0];
}

