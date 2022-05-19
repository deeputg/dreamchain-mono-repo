# Dreamchain

Welcome to the Dreamchain source code repository! This project enables you to take part in Dreamchain blockchain network. It is a fork of eosio software.

## Instructions

### Running natively

1. Clone this repo

```
git clone git@github.com:Dreamchain-org/DreamChainCore.git
```

2. enter the folder

```
cd DreamChainCore
```

3. Build the core using a prebuilt script file located in scrips folder

```
./scripts/eosio_build.sh
```

4. Install the core using a prebuilt script file located in scrips folder

```
./scripts/eosio_install.sh
```

5. For uninstalling

```
./scripts/eosio_uninstall.sh
```

6.  To run the node

```
./scripts/node/automated_start.sh arg1 arg2 arg3 arg4 arg5 arg6 arg7 arg8

arg1 - public key of the node (must be created prior to this step)
arg2 - private key of the node(must be created prior to this step)
arg3 - account name (must be created prior to this step)
arg4 - nodeos running port (default:8888)
arg5 - p2p listening port (default:9010)
arg6 - ip address of another working node with its p2p port
arg7 - ip address of another working node with its p2p port
arg8 - ip address of another working node with its p2p port

```

All the arguments are mandatory.

7. If the node stoped working with a log - "hard restart required", please run the following command to restart the node

```
./scripts/node/hard_start.sh arg1 arg2 arg3 arg4 arg5 arg6 arg7 arg8

arg1 - public key of the node (must be of the stopped node)
arg2 - private key of the node(must be of the stopped node)
arg3 - account name (must be of the stopped node)
arg4 - nodeos running port (default:8888)
arg5 - p2p listening port (default:9010)
arg6 - ip address of another working node with its p2p port
arg7 - ip address of another working node with its p2p port
arg8 - ip address of another working node with its p2p port
```

All the arguments are mandatory.

### Running on Docker

1.  Clone this repo

```
git clone git@github.com:Dreamchain-org/DreamChainCore.git
```

2. enter the folder

```
cd DreamChainCore
```

3.  build the docker file by running the following command

```
docker build dreamchain/node:latest .
```

4.  run the docker image by running the following command (make sure you are in `DreamChainCore/scripts/node` directory)

```
docker run -d -v `pwd`:/node/ -p 8888:8888 -p 9010:9010 dreamchain/node:latest /node/automated_start.sh arg1 arg2 arg3 arg4 arg5 arg6 arg7 arg8

arg1 - public key of the node (must be created prior to this step)
arg2 - private key of the node(must be created prior to this step)
arg3 - account name (must be created prior to this step)
arg4 - nodeos running port (default:8888)
arg5 - p2p listening port (default:9010)
arg6 - ip address of another working node with its p2p port
arg7 - ip address of another working node with its p2p port
arg8 - ip address of another working node with its p2p port


```

All the arguments are mandatory.

4. If the node stoped working with a log - "hard restart required", please run the following command to restart the node (make sure you are in `DreamChainCore/scripts/node` directory)

```
docker run -d -v `pwd`:/node/ -p 8888:8888 -p 9010:9010 dreamchain/node:latest /node/hard_start.sh arg1 arg2 arg3 arg4 arg5 arg6 arg7 arg8

arg1 - public key of the node (must be of the stopped node)
arg2 - private key of the node(must be of the stopped node)
arg3 - account name (must be of the stopped node)
arg4 - nodeos running port (default:8888)
arg5 - p2p listening port (default:9010)
arg6 - ip address of another working node with its p2p port
arg7 - ip address of another working node with its p2p port
arg8 - ip address of another working node with its p2p port
```

All the arguments are mandatory.

## Branches

To create a new feature or bugfix (or chore) please create a new branch and use a prefix (e.g `feature/my-awesome-new-feature` or `bugfix/something-not-working`). The prefixes we use are `bug`, `feat`, `chore` and `hotfix`. Please don't use anything else.
