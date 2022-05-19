#pragma once

#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>
#include <eosio/eosio.hpp>
#include <eosio/time.hpp>
#include <eosio/singleton.hpp>
#include <eosio/transaction.hpp>

#include <string>
#include <vector>
#include <iterator>
#include <algorithm>

#include "service.hpp"

using namespace std;
using namespace eosio;
using namespace service;

CONTRACT dreamoji : public contract
{
public:
    using contract::contract;

    dreamoji(name receiver, name code, datastream<const char *> ds)
        : contract(receiver, code, ds) {}

    ACTION instantiate(const symbol_code &symbol,
                       const string &version);

    ACTION create(const name &issuer,
                  const name &rev_partner,
                  const name &category,
                  const name &token_name,
                  const bool &fungible,
                  const bool &burnable,
                  const bool &sellable,
                  const bool &transferable,
                  const double &rev_split,
                  const string &base_uri,
                  const uint32_t &max_issue_days,
                  const asset &max_supply);

    ACTION issue(const name &to,
                 const name &category,
                 const name &token_name,
                 const asset &quantity,
                 const string &relative_uri,
                 const string &memo);

    ACTION freezemaxsup(const name &category, const name &token_name);

    ACTION burnnft(const name &owner,
                   const vector<uint64_t> &nft_ids);

    ACTION burnft(const name &owner,
                  const uint64_t &category_name_id,
                  const asset &quantity);

    ACTION transfernft(const name &from,
                       const name &to,
                       const vector<uint64_t> &nft_ids);

    ACTION transferft(const name &from,
                      const name &to,
                      const name &category,
                      const name &token_name,
                      const asset &quantity,
                      const string &memo);

    ACTION nftokensale(const name &seller,
                       const vector<uint64_t> &nft_ids,
                       const asset &net_sale_amount,
                       const uint64_t &sale_period_sec);

    ACTION licencesale(const name &seller,
                       const asset &price,
                       const vector<uint64_t> &nft_ids,
                       const uint16_t &lcnc_limit,
                       const uint64_t &sale_period_sec,
                       const uint64_t &lcnc_period_sec);

    ACTION license(const name &owner,
                   const vector<name> &to,
                   const vector<uint64_t> &nft_ids,
                   const uint64_t &period,
                   const bool &relicense);

    ACTION extend(const name &owner,
                  const uint64_t &lcnc_id,
                  const uint64_t &period);

    ACTION revoke(const name &owner,
                  const vector<name> &from,
                  const vector<uint64_t> &lcnc_ids);

    ACTION endnftsale(const name &seller,
                      const uint64_t &batch_id);

    ACTION endlcncsale(const name &seller,
                       const uint64_t &nft_id);

    ACTION linknfts(const vector<uint64_t> &nft_ids,
                    const uint64_t &link_to,
                    const name &owner);

    ACTION unlinknfts(const vector<uint64_t> &nft_ids,
                      const uint64_t &linked_to,
                      const name &owner);
    
    ACTION logcall(const uint64_t &nft_id);

    ACTION logsale(const vector<uint64_t> &nft_ids,
                   const name &seller,
                   const name &buyer,
                   const name &receiver);

    ACTION loglicense(const uint64_t &lcnc_id);

    // The memo determines whether the sale_type is nftoken or licence
    void purchase(const name &from,
                  const name &to,
                  const asset &quantity,
                  const string &memo);

    TABLE lockednfts
    {
        uint64_t nft_id;
        uint64_t primary_key() const { return nft_id; }
    };

    using lock_index = multi_index<"lockednfts"_n, lockednfts>;

    TABLE linkednfts
    {
        uint64_t nft_id;
        uint64_t primary_key() const { return nft_id; }
    };

    using link_index = multi_index<"linkednfts"_n, linkednfts>;

    // scope is self
    TABLE asks
    {
        uint64_t batch_id;
        vector<uint64_t> nft_ids;
        name seller;
        asset amount;
        time_point_sec expiration;

        uint64_t primary_key() const { return batch_id; }
        uint64_t get_seller() const { return seller.value; }
    };

    using ask_index = multi_index<"asks"_n, asks,
                                  indexed_by<"seller"_n, const_mem_fun<asks, uint64_t, &asks::get_seller>>>;

    TABLE tokenconfigs
    {
        name standard;
        string version;
        symbol_code symbol;
        uint64_t category_name_id;
        uint64_t next_nft_id;
        uint64_t next_licence_id;
    };

    using config_index = singleton<"tokenconfigs"_n, tokenconfigs>;

    TABLE categoryinfo
    {
        name category;

        uint64_t primary_key() const { return category.value; }
    };

    using category_index = multi_index<"categoryinfo"_n, categoryinfo>;

    // scope is category, then token_name is unique
    TABLE dreamstats
    {
        bool fungible;
        bool burnable;
        bool sellable;
        bool transferable;
        name issuer;
        name rev_partner;
        name token_name;
        uint64_t category_name_id;
        asset max_supply;
        time_point_sec max_issue_window;
        asset current_supply;
        asset issued_supply;
        double rev_split;
        string base_uri;

        uint64_t primary_key() const { return token_name.value; }
    };

    using stats_index = multi_index<"dreamstats"_n, dreamstats>;

    // scope is self
    TABLE dreams
    {
        uint64_t id;
        uint64_t serial_number;
        name owner;
        name category;
        name token_name;
        std::optional<string> relative_uri;
        vector<uint64_t> children;

        uint64_t primary_key() const { return id; }
        uint64_t secondary_key() const { return category.value; }
        uint64_t get_owner() const { return owner.value; }
    };
    EOSLIB_SERIALIZE(dreams, (id)(serial_number)(owner)(category)(token_name)(relative_uri)(children))

    using dream_index = multi_index<"dreams"_n, dreams,
                                       indexed_by<"category"_n, const_mem_fun<dreams, uint64_t, &dreams::secondary_key>>,
                                       indexed_by<"owner"_n, const_mem_fun<dreams, uint64_t, &dreams::get_owner>>>;

    // scope is owner
    TABLE accounts
    {
        uint64_t category_name_id;
        name category;
        name token_name;
        asset amount;

        uint64_t primary_key() const { return category_name_id; }
    };

    using account_index = multi_index<"accounts"_n, accounts>;

    // scope is self
    TABLE sales
    {
        uint64_t nft_id;
        name seller;
        asset price;
        uint16_t lcnc_limit;
        time_point_sec end_of_sale;
        uint64_t lcnc_period_sec;

        uint64_t primary_key() const { return nft_id; }
        uint64_t get_seller() const { return seller.value; }
    };

    using sale_index = multi_index<"sales"_n, sales,
                                   indexed_by<"seller"_n, const_mem_fun<sales, uint64_t, &sales::get_seller>>>;

    // scope is self
    TABLE licences
    {
        uint64_t licence_id;
        uint64_t nft_id;
        name owner;
        vector<name> licensed_to;
        time_point_sec expiration;
        bool relicense;

        auto primary_key() const { return licence_id; }
        uint64_t secondary_key() const { return nft_id; }
        uint64_t get_owner() const { return owner.value; }
    };

    using licence_index = multi_index<"licences"_n, licences,
                                      indexed_by<"nftoken"_n, const_mem_fun<licences, uint64_t, &licences::secondary_key>>,
                                      indexed_by<"owner"_n, const_mem_fun<licences, uint64_t, &licences::get_owner>>>;

private:
    map<name, asset> _calcfees(vector<uint64_t> nft_ids, asset ask_amount, name seller);
    void _changeowner(const name &from, const name &to, const vector<uint64_t> &nft_ids, const bool &istransfer);
    void _checkasset(const asset &amount, const bool &fungible);
    void _mint(const name &to, const name &issuer, const name &category, const name &token_name, const asset &issued_supply, const string &relative_uri);
    void _add_balance(const name &owner, const name &issuer, const name &category, const name &token_name, const uint64_t &category_name_id, const asset &quantity);
    void _sub_balance(const name &owner, const uint64_t &category_name_id, const asset &quantity);
    void _createlicence(const uint64_t &nft_id, const name &owner, const vector<name> &to, const uint64_t &period, const bool &relicense);
    uint64_t _nextnftid();
    uint64_t _nextlicenceid();
};
