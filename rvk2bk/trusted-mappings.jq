# Filter mappings which have
# - either been confirmed, or
# - have been created by a trusted user and not downvoted by anyone.
#
# USAGE: jq -cf trusted-mappings.jq

([

  # Jakob
  "https://coli-conc.gbv.de/login/users/3a1bb23f-8d60-4b7a-8bec-cc419d7f6ab6",
  "https://orcid.org/0000-0002-7613-4123",
  "https://github.com/nichtich",
  "https://www.wikidata.org/wiki/User:JakobVoss",
  "https://orcid.org/0000-0002-7613-4123",

  # Anne
  "https://github.com/schuchaa",

  # Viola Voß
  "https://coli-conc.gbv.de/login/users/a5ba5153-ddb4-4d58-b733-dd7948636885",

  # Stefan
  "https://github.com/stefandesu"
]
| map( { (.): true } ) | add) as $TRUSTED |

(.annotations | any(.motivation == "moderating"))                       as $CONFIRMED |
(.annotations | any(.motivation == "assessing" and .bodyValue == "-1")) as $DOWNVOTED |
(.creator     | any(.uri as $URI | $TRUSTED | has($URI)))               as $TRUSTED |

select( $CONFIRMED or ($TRUSTED and ($DOWNVOTED|not)) )
