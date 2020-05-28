package Config;
use v5.14;

use Config::Onion;

sub load {
    my $stem   = shift;
    my $config = Config::Onion->new;
    $config->load( "$stem.default", $stem );
    $config->get;
}

1;
