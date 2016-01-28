#!/bin/bash
echo "[kil]: begin install kil in your system."
if [ $0 == "-bash" ]; then
    cur=$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)
else
    cur=$(cd "$(dirname "$0")"; pwd)
fi
kilAlias="alias kil='node $cur/cli.js'"
setPath="export KIL_HOME=$cur"

addAlias(){
    echo "[kil]: add alias to $file. "
    echo $kilAlias >> ~/$file
    echo $setPath >> ~/$file
}

process(){
    if [ -e ~/$file ]; then
        echo "[kil]: try find alias at $file. "
        grep -q "$kilAlias" ~/$file
        if [ $? = 0 ]; then
            echo "[kil]: alias exists! "
        else
            addAlias
        fi
    else
        echo "[kil]: create new file $file"
        touch ~/$file
        addAlias
    fi
}

echo "[kil]: start checking your os..."
UNAME=$(uname)
echo "[kil]: os $UNAME is found."
if [ $UNAME == "Darwin" ] || [ $UNAME == "Linux" ]; then
    file=".bash_profile"
    process
    echo "[kil]: source ~/$file"
    source ~/$file
    echo "[kil]: kil is installed. please restart bash or source ~/$file manually to enable kil alias!"
else
    echo "Windows"
fi