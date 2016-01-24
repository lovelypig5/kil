#!/bin/bash
echo "[kil]: start install kil in your os."
cur=$(cd "$(dirname "$0")"; pwd)
kilAlias="alias kil='node $cur/cli.js'"

addAlias(){
    echo "[kil]: add alias to $file. "
    echo $kilAlias >> ~/$file
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

echo "[kil]: start check your os..."
UNAME=$(uname)
echo "[kil]: os $UNAME found."
if [ $UNAME == "Darwin" ]; then
    file=".bash_profile"
    process
    echo "[kil]: source ~/$file"
    source ~/$file
    echo "[kil]: kil is installed. please restart the terminal!"
elif [ $UNAME == "Linux" ]; then
    file=".bash_aliases"
    sceFile=".bashrc"
    process
    echo "[kil]: source ~/.bashrc"
    source ~/$sceFile
    echo "[kil]: kil is installed. please restart the terminal!"
else
    echo "Windows"
fi