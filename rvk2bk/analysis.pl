#!/usr/bin/env perl
use v5.14;
use JSON::API;
use Catmandu ':all';

my @queue = grep { $_ =~ /^[A-Z]{2}/ } @ARGV;
die "Bitte RVK-Notation(en) angeben!\n" unless @queue;

my %mappingTypes = (
    close   => "≈",
    exact   => "=",
    narrow  => "<",
    broad   => ">",
    related => "~",
);

while (@queue) {
    my $notation = shift @queue;
    my $rvk      = getRVKClass($notation);

    if ($rvk) {
        my $depth = scalar @{ $rvk->{ancestors} };
        print(( " " x $depth )
            . "$notation"
              . ( " " x ( 40 - length $notation ) ) );

        # if type < or type =: no narrower
        # otherwise check narrower
        my $mapped;
        my @mappings = getRVKBKMappings($notation);
        if (@mappings) {
            for (@mappings) {
                $_->{type}[0] =~ /#([a-z]+)Match/;
                my $type = $mappingTypes{$1};
                my $to   = join '+',
                  map { $_->{notation}[0] } @{ $_->{to}{memberSet} };
                print "$type $to ";
                my $leaf = !@{ getBK($to)->{narrower} };
                $mapped = 1 if ( $type eq '<' or $type eq '=' ) and $leaf;
            }
            say "ok" if $mapped;
        }
        else {
            say $rvk->{prefLabel}{de};
        }

        unless ($mapped) {
            push @queue, map { $_->{notation}[0] } @{ $rvk->{narrower} };
        }
    }
    else {
        say "$notation ???";
    }
}

# gegeben ein RVK-Baum: wie vollständig sind die Klassen abgedeckt?

sub getRVKClass {
    my $api    = JSON::API->new('http://coli-conc.gbv.de/rvk/api/data');
    my $result = $api->get(
        '',
        {
            notation   => $_[0],
            voc        => "http://uri.gbv.de/terminology/rvk/",
            properties => "narrower,ancestors",
        }
    );
    return ref $result ? $result->[0] : undef;
}

sub getRVKBKMappings {
    my $rvkNotation = shift;

    # TODO: get trusted mappings only
    my $api = JSON::API->new('http://coli-conc.gbv.de/api/mappings');
    return @{
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
}

# Look up a BK class by its notation.
# Returns JSKOS concept including "narrower".
# Dies if BK class not found.
sub getBK {
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

    $cache{$notation} = $concepts->[0];
    return $concepts->[0];
}

