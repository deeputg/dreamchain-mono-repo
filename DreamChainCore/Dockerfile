FROM ubuntu:18.04
COPY . /DreamchainCore
# COPY ./build/1.8/ /eosio/1.8
# COPY ./scripts/cdt/ /eosio/cdt
RUN apt update
RUN apt install git curl -y
RUN /DreamchainCore/scripts/eosio_build.sh -y
RUN /DreamchainCore/scripts/eosio_install.sh

# ENV PATH="/eosio/1.8/bin:${PATH}"
# ENV PATH="/eosio/cdt/build:${PATH}"


ENV PATH="~eosio/1.8/bin:${PATH}"
ENV PATH="/DreamchainCore/scripts/cdt/build:${PATH}"