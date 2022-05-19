#!/bin/bash
echo "in start.sh"
DATADIR="/node/blockchain"

if [ ! -d $DATADIR ]; then
mkdir -p $DATADIR;
fi

nodeos \
--signature-provider $1=KEY:$2  \
--plugin eosio::producer_plugin \
--plugin eosio::producer_api_plugin \
--plugin eosio::chain_plugin \
--plugin eosio::chain_api_plugin \
--plugin eosio::http_plugin \
--data-dir $DATADIR"/data" \
--blocks-dir $DATADIR"/blocks" \
--config-dir $DATADIR"/config" \
--producer-name $3 \
--http-server-address 0.0.0.0:$4 \
--p2p-listen-endpoint 0.0.0.0:$5 \
--access-control-allow-origin=* \
--filter-on=* \
--contracts-console \
--http-validate-host=false \
--verbose-http-errors \
--enable-stale-production \
--p2p-peer-address localhost:9010 \
--p2p-peer-address $6 \
--p2p-peer-address $7 \
--p2p-peer-address $8 \
>> $DATADIR"/nodeos.log" 2>&1 & \
echo $! > $DATADIR"/eosd.pid"
tail -f "$DATADIR/nodeos.log"