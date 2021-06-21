#!/usr/bin/env perl
use v5.14;
use PICA::Data qw(1.18 :all);
use Catmandu qw(importer);
use JSON::API;

# Ausgehend von einer RVK-Notation
my $rvkNotation = shift @ARGV;
die "Bitte RVK-Klasse angeben (muss mit zwei Buchstaben anfangen)!\n"
  unless $rvkNotation =~ /^[A-Z][A-Z]/;

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

@mappings = grep { scalar @{ $_->{to}{memberSet} } == 1 } @mappings;
die "Mehrere oder keine 1-zu-1 Mappings von RVK $rvkNotation auf BK gefunden\n"
  unless @mappings == 1;

my $mappingUri = $mappings[0]->{uri} or die "Fehlende Mapping-URI";
my $bkNotation = $mappings[0]->{to}{memberSet}[0]{notation}[0]
  or die "Fehlende BK-Notation";

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
my $bkPPN = $bkRecord->{_id};
say "$bkNotation = $bkPPN";

my $rvkCheck;
if ( length $rvkNotation == 2 ) {
    say "RVK $rvkNotation (und Unterklassen) => BK $bkNotation ($mappingUri)";
    $rvkCheck = sub { $_[0] =~ /^$rvkNotation / };
    die "BK $bkNotation is kein Blattkonzept\n"
      if @{ $bkConcepts->[0]{narrower} };
}
else {
    # TODO: auch Unterklassen einbeziehen
    say "RVK $rvkNotation => BK $bkNotation ($mappingUri)";
    $rvkCheck = sub { $_[0] eq $rvkNotation };
}

# TODO: escape name?
my $outFile = "$rvkNotation.rvk2bk.pica";
my $writer = pica_writer( 'plain', annotated => 1, fh => $outFile );
my $count;

while ( my $record = $parser->next ) {
    my $ppn = $record->fields('003@');
    my $bk  = $record->fields('045Q');
    my $rvk = $record->fields('045R');

    next if grep { $_ eq $bkNotation } $record->values('045Q$a');

    next unless grep { $rvkCheck->($_) } $record->values('045R$a');

    $writer->write(
        [
            @$ppn,
            [
                '045Q', '01',
                9 => $bkPPN,
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
