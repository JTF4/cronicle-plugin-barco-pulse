ERROR=0
ARGV="$@"


HOMEDIR="$(dirname "$(cd -- "$(dirname "$0")" && (pwd -P 2>/dev/null || pwd))")"

cd $HOMEDIR

if [ "x$ARGV" = "x" ] ; then 
    echo 'ERR: Must specify a source and destination'
fi

if [ "x$ARGV" != "x" ] ; then 
    cp -R $1 $2
fi

