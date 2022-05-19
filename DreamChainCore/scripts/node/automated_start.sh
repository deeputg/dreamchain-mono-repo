#!/bin/bash
echo $1
DATADIR="/node/blockchain"
# checking if the data directory exist - if not it means it should call genesis_start.sh to start the node
if [ -d "$DATADIR" ]; then
  /node/start.sh "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8"
  #checking if the exit status of the previous start call is an error, if so calling hard_start.sh
  if [ "$?" = "1" ]; then
	/node/hard_start.sh "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8"
  fi
else
  /node/genesis_start.sh "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8"
fi