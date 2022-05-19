#include <dreamoji.hpp>
#include <math.h>

ACTION dreamoji::instantiate(const symbol_code &sym, const string &version)
{
    require_auth(get_self());
    // valid symbol
    check(sym.is_valid(), "not valid symbol");

    // can only have one symbol per contract
    config_index config_table(get_self(), get_self().value);
    auto config_singleton = config_table.get_or_create(get_self(), tokenconfigs{"dreamoji"_n, version, sym, 0, 0, 0});

    // instantiate will always update version when called
    config_singleton.version = version;
    config_table.set(config_singleton, get_self());
}

ACTION dreamoji::create(const name &issuer,
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
                        const asset &max_supply)
{
    require_recipient(issuer);
    check(is_account(issuer), "issuer account does not exist");
    require_auth(issuer);

    time_point_sec max_issue_window = time_point_sec(0);
    // true max supply, not time based supply window
    if (max_issue_days == 0)
    {
        // cannot have both max_supply and max_issue_days be 0
        _checkasset(max_supply, fungible);
    }
    else
    {
        uint32_t max_issue_seconds = max_issue_days * 24 * 3600;
        max_issue_window = time_point_sec(current_time_point()) + max_issue_seconds;
        check(max_supply.amount >= 0, "max supply must be 0 or greater");
        if (fungible == false)
        {
            check(max_supply.symbol.precision() == 0, "NFT must have max supply as int, precision of 0");
        }
    }

    // check if rev_partner account exists
    check(is_account(rev_partner), "rev_partner account does not exist");
    // check split frac is between 0 and 1
    check((rev_split <= 1.0) && (rev_split >= 0.0), "rev_split must be between 0 and 1");

    // get category_name_id
    config_index config_table(get_self(), get_self().value);
    check(config_table.exists(), "Symbol table does not exist, instantiate first");
    auto config_singleton = config_table.get();
    auto category_name_id = config_singleton.category_name_id;

    category_index category_table(get_self(), get_self().value);
    auto existing_category = category_table.find(category.value);

    // category hasn't been created before, create it
    if (existing_category == category_table.end())
    {
        category_table.emplace(get_self(), [&](auto &cat) {
            cat.category = category;
        });
    }

    asset current_supply = asset(0, symbol(config_singleton.symbol, max_supply.symbol.precision()));
    asset issued_supply = asset(0, symbol(config_singleton.symbol, max_supply.symbol.precision()));

    stats_index stats_table(get_self(), category.value);
    check(stats_table.find(token_name.value) == stats_table.end(), "Token with category and token_name exists");
    // token type hasn't been created, create it
    stats_table.emplace(get_self(), [&](auto &stats) {
        stats.category_name_id = category_name_id;
        stats.issuer = issuer;
        stats.rev_partner = rev_partner;
        stats.token_name = token_name;
        stats.fungible = fungible;
        stats.burnable = burnable;
        stats.sellable = sellable;
        stats.transferable = transferable;
        stats.current_supply = current_supply;
        stats.issued_supply = issued_supply;
        stats.rev_split = rev_split;
        stats.base_uri = base_uri;
        stats.max_supply = max_supply;
        stats.max_issue_window = max_issue_window;
    });

    // successful creation of token, update category_name_id to reflect
    config_singleton.category_name_id++;
    config_table.set(config_singleton, get_self());
}

ACTION dreamoji::issue(const name &to,
                       const name &category,
                       const name &token_name,
                       const asset &quantity,
                       const string &relative_uri,
                       const string &memo)
{

    check(is_account(to), "to account does not exist");
    check(memo.size() <= 256, "memo has more than 256 bytes");

    // dreamstats table
    stats_index stats_table(get_self(), category.value);
    const auto &dream_stats = stats_table.get(token_name.value, "Token with category and token_name does not exist");

    // ensure have issuer authorization and valid quantity
    require_auth(dream_stats.issuer);

    _checkasset(quantity, dream_stats.fungible);
    string string_precision = "precision of quantity must be " + to_string(dream_stats.max_supply.symbol.precision());
    check(quantity.symbol == dream_stats.max_supply.symbol, string_precision.c_str());

    // time based minting
    if (dream_stats.max_issue_window != time_point_sec(0))
    {
        check(time_point_sec(current_time_point()) <= dream_stats.max_issue_window, "issue window has closed, cannot issue more");
    }

    if (dream_stats.max_supply.amount != 0)
    {
        // check cannot issue more than max supply, careful of overflow of uint
        check(quantity.amount <= (dream_stats.max_supply.amount - dream_stats.issued_supply.amount), "Cannot issue more than max supply");
    }

    if (dream_stats.fungible == false)
    {
        check(quantity.amount <= 100, "can issue up to 100 at a time");
        asset issued_supply = dream_stats.issued_supply;
        asset one_token = asset(1, dream_stats.max_supply.symbol);
        for (uint64_t i = 1; i <= quantity.amount; i++)
        {
            _mint(to, dream_stats.issuer, category, token_name, issued_supply, relative_uri);
            // used to keep track of serial number when minting multiple
            issued_supply += one_token;
        }
    }
    _add_balance(to, get_self(), category, token_name, dream_stats.category_name_id, quantity);

    // increase current supply
    stats_table.modify(dream_stats, same_payer, [&](auto &s) {
        s.current_supply += quantity;
        s.issued_supply += quantity;
    });
}

ACTION dreamoji::freezemaxsup(const name &category, const name &token_name)
{
    require_auth(get_self());

    // dreamstats table
    stats_index stats_table(get_self(), category.value);
    const auto &dream_stats = stats_table.get(token_name.value, "Token with category and token_name does not exist");
    check(dream_stats.max_issue_window != time_point_sec(0), "can't freeze max supply unless time based minting");
    check(dream_stats.issued_supply.amount != 0, "need to issue at least one token before freezing");
    stats_table.modify(dream_stats, same_payer, [&](auto &s) {
        s.max_supply = dream_stats.issued_supply;
        s.max_issue_window = time_point_sec(0);
    });
}

ACTION dreamoji::burnnft(const name &owner,
                         const vector<uint64_t> &nft_ids)
{

    require_auth(owner);

    check(nft_ids.size() <= 20, "max batch size of 20");
    // loop through vector of nft_ids, check token exists
    lock_index lock_table(get_self(), get_self().value);
    dream_index dreamoji_table(get_self(), get_self().value);
    stats_index stats_table(get_self(), get_self().value);
    for (auto const &nft_id : nft_ids)
    {
        const auto &token = dreamoji_table.get(nft_id, "token does not exist");
        check(token.owner == owner, "must be token owner");

        stats_index stats_table(get_self(), token.category.value);
        const auto &dream_stats = stats_table.get(token.token_name.value, "dreamoji stats not found");

        check(dream_stats.burnable == true, "Not burnable");
        check(dream_stats.fungible == false, "Cannot call burnnft on fungible token, call burnft instead");
        // make sure token not locked;
        auto locked_nft = lock_table.find(nft_id);
        check(locked_nft == lock_table.end(), "token locked");

        asset quantity(1, dream_stats.max_supply.symbol);
        // decrease current supply and issued supply
        stats_table.modify(dream_stats, same_payer, [&](auto &s) {
            s.current_supply -= quantity;
            s.issued_supply -= quantity;
        });

        // erase from dreamstats table
        asset burned_out(0, dream_stats.max_supply.symbol);
        if (dream_stats.current_supply == burned_out)
        {
            stats_table.erase(dream_stats);
        }

        // lower balance from owner
        _sub_balance(owner, dream_stats.category_name_id, quantity);

        // erase token
        dreamoji_table.erase(token);
    }
}

ACTION dreamoji::burnft(const name &owner,
                        const uint64_t &category_name_id,
                        const asset &quantity)
{

    require_auth(owner);

    account_index from_account(get_self(), owner.value);
    const auto &acct = from_account.get(category_name_id, "token does not exist in account");

    stats_index stats_table(get_self(), acct.category.value);
    const auto &dream_stats = stats_table.get(acct.token_name.value, "dreamoji stats not found");

    _checkasset(quantity, true);
    string string_precision = "precision of quantity must be " + to_string(dream_stats.max_supply.symbol.precision());
    check(quantity.symbol == dream_stats.max_supply.symbol, string_precision.c_str());
    // lower balance from owner
    _sub_balance(owner, category_name_id, quantity);

    // decrease current supply
    stats_table.modify(dream_stats, same_payer, [&](auto &s) {
        s.current_supply -= quantity;
    });
}

ACTION dreamoji::transfernft(const name &from,
                             const name &to,
                             const vector<uint64_t> &nft_ids)
{

    check(nft_ids.size() <= 20, "max batch size of 20");
    // ensure authorized to send from account
    require_auth(from);
    // ensure 'to' account exists
    check(is_account(to), "to account does not exist");
    check(from != to, "cannot transfer to self");

    link_index link_table(get_self(), get_self().value);
    dream_index dream_table(get_self(), get_self().value);
    for (auto const &nft_id : nft_ids) {
        auto const &token = dream_table.get(nft_id, "token not found");
        check(link_table.find(nft_id) == link_table.end(), "cannot directly transfer linked NFTs without the parent NFT");
    }

    _changeowner(from, to, nft_ids, true);
}

ACTION dreamoji::transferft(const name &from,
                            const name &to,
                            const name &category,
                            const name &token_name,
                            const asset &quantity,
                            const string &memo)
{

    // ensure authorized to send from account
    check(from != to, "cannot transfer to self");
    require_auth(from);

    // ensure 'to' account exists
    check(is_account(to), "to account does not exist");

    // check memo size
    check(memo.size() <= 256, "memo has more than 256 bytes");

    require_recipient(from);
    require_recipient(to);

    stats_index stats_table(get_self(), category.value);
    const auto &dream_stats = stats_table.get(token_name.value, "dreamoji stats not found");
    check(dream_stats.transferable == true, "not transferable");
    check(dream_stats.fungible == true, "Must be fungible token");

    _checkasset(quantity, true);
    string string_precision = "precision of quantity must be " + to_string(dream_stats.max_supply.symbol.precision());
    check(quantity.symbol == dream_stats.max_supply.symbol, string_precision.c_str());
    _sub_balance(from, dream_stats.category_name_id, quantity);
    _add_balance(to, get_self(), category, token_name, dream_stats.category_name_id, quantity);
}

ACTION dreamoji::nftokensale(const name &seller,
                             const vector<uint64_t> &nft_ids,
                             const asset &net_sale_amount,
                             const uint64_t &sale_period_sec)
{

    require_auth(seller);

    check(nft_ids.size() <= 20, "max batch size of 20");
    check(net_sale_amount.amount > .02 * pow(10, net_sale_amount.symbol.precision()), "minimum price of at least 0.02 DRMI");
    check(net_sale_amount.symbol == symbol(symbol_code("DRMI"), 4), "only DRMI with precision of 4 is accepted for sale");

    dream_index dreamoji_table(get_self(), get_self().value);
    ask_index ask_table(get_self(), get_self().value);
    link_index link_table(get_self(), get_self().value);

    check(ask_table.find(nft_ids[0]) == ask_table.end(), "ongoing sale of batch with id: " + to_string(nft_ids[0]) + " must be ended before selling again");

    for (auto const &nft_id : nft_ids)
    {
        const auto &token = dreamoji_table.get(nft_id, "token does not exist");
        check(link_table.find(nft_id) == link_table.end(), "cannot directly sell linked NFTs without the parent NFT");

        stats_index stats_table(get_self(), token.category.value);
        const auto &dream_stats = stats_table.get(token.token_name.value, "dreamoji stats not found");

        check(dream_stats.sellable == true, "not sellable");
        check(seller == token.owner, "not token owner");
        
        // make sure token not locked;
        lock_index lock_table(get_self(), get_self().value);
        auto locked_nft = lock_table.find(nft_id);
        check(locked_nft == lock_table.end(), "token locked");

        // add token to lock table
        lock_table.emplace(get_self(), [&](auto &l) {
            l.nft_id = nft_id;
        });
    }

    // add batch to table of asks
    // set id to the first dreamoji being listed, if only one being listed, simplifies life
    ask_table.emplace(get_self(), [&](auto &a) {
        a.batch_id = nft_ids[0];
        a.nft_ids = nft_ids;
        a.seller = seller;
        a.amount = net_sale_amount;
        a.expiration = time_point_sec(current_time_point()) + sale_period_sec;
    });
}

ACTION dreamoji::licencesale(const name &seller,
                             const asset &price,
                             const vector<uint64_t> &nft_ids,
                             const uint16_t &lcnc_limit,
                             const uint64_t &sale_period_sec,
                             const uint64_t &lcnc_period_sec)
{

    require_auth(seller);
    require_recipient(seller);

    check(nft_ids.size() <= 20, "max batch size of 20");
    check(price.amount > .02 * pow(10, price.symbol.precision()), "minimum price of at least 0.02 DRMI");
    check(price.symbol == symbol(symbol_code("DRMI"), 4), "only DRMI with precision of 4 is accepted for sale");

    dream_index dreamoji_table(get_self(), get_self().value);
    sale_index sale_table(get_self(), get_self().value);
    link_index link_table(get_self(), get_self().value);

    for (auto const &nft_id : nft_ids)
    {
        const auto &token = dreamoji_table.get(nft_id, "token does not exist");

        check(link_table.find(nft_id) == link_table.end(), "cannot directly license linked NFTs without the parent NFT");
        check(seller == token.owner, "token needs to be owned before it can be licensed out");
        check(sale_table.find(nft_id) == sale_table.end(), "ongoing sale of NFT with id: " + to_string(nft_id) + " must be ended before selling again");

        lock_index lock_table(get_self(), get_self().value);
        // check(lock_table.find(nft_id) == lock_table.end(), "token locked");
        if (lock_table.find(nft_id) == lock_table.end())
        {
            // add token to lock table
            lock_table.emplace(get_self(), [&](auto &l) {
                l.nft_id = nft_id;
            });
        }

        // add nft to table of licence sales
        sale_table.emplace(get_self(), [&](auto &sl) {
            sl.nft_id = nft_id;
            sl.seller = seller;
            sl.price = price;
            sl.lcnc_limit = lcnc_limit;
            sl.end_of_sale = time_point_sec(current_time_point()) + sale_period_sec;
            sl.lcnc_period_sec = lcnc_period_sec;
        });
    }
}

ACTION dreamoji::license(const name &owner,
                         const vector<name> &to,
                         const vector<uint64_t> &nft_ids,
                         const uint64_t &period,
                         const bool &relicense)
{

    require_auth(owner);
    require_recipient(owner);

    check(nft_ids.size() <= 20, "max batch size of 20");
    check(to.size() <= 20, "max licensee size of 20");
    check(nft_ids.size() > 0, "min batch size of 1");
    check(to.size() > 0, "min licensed_to size of 1");

    dream_index dreamoji_table(get_self(), get_self().value);
    licence_index lcnc_table(get_self(), owner.value);
    lock_index lock_table(get_self(), get_self().value);

    for (auto j = 0; j < to.size(); ++j)
    {
        // ensure the licensee account exists on dream-chain and isn't the same as the owner account
        check(is_account(to[j]), "To account does not exist");
        check(!(owner == to[j]), "Cannot license to yourself");
    }
    for (auto const &nft_id : nft_ids)
    {
        check(dreamoji_table.find(nft_id) != dreamoji_table.end(), "Asset id: " + to_string(nft_id) + " couldn't be found at the specified scope");
        // check(lock_table.find(nft_id) == lock_table.end(), "Asset id: " + to_string(nft_id) + " is locked");

        // if (auto lcnc = lcnc_table.find(nft_id); lcnc != lcnc_table.end())
        // {
        //     check(!(lcnc->relicense == false), "For asset id:" + to_string(nft_id) + " the terms of licensing forbid re-license.");

        //     for (auto j = 0; j < to.size(); ++j)
        //     {
        //         check(!(lcnc->owner == to[j]), "Asset id:" + to_string(nft_id) + "is not allowed re-license to original owner of asset");
        //         for (auto k = 0; k < lcnc->licensed_to.size(); ++k)
        //         {
        //             check(!(lcnc->licensed_to[k] == to[j]), "Asset id:" + to_string(nft_id) + " has already been licensed to this account");
        //         }
        //     }

        //     vector<name> licencee_vector = lcnc->licensed_to;
        //     licencee_vector.insert(licencee_vector.end(), to.begin(), to.end());

        //     lcnc_table.modify(lcnc, same_payer, [&](auto &lc) {
        //         lc.licensed_to = licencee_vector;
        //         lc.expiration = time_point_sec(current_time_point()) + period;
        //         lc.relicense = relicense;
        //     });
        // }
        // else
        // {
            
            _createlicence(nft_id, owner, to, period, relicense);
        // }
    }
}

ACTION dreamoji::extend(const name &owner,
                        const uint64_t &lcnc_id,
                        const uint64_t &period)
{

    require_auth(owner);
    require_recipient(owner);

    licence_index lcnc_table(get_self(), owner.value);
    const auto &licence = lcnc_table.get(lcnc_id, string("Asset id: " + to_string(lcnc_id) + " is not licensed").c_str());
    
    check(owner == licence.owner, "You are not the owner of asset id: " + to_string(lcnc_id));
    check(licence.relicense == true, "Licence agreement was on the basis of non-extension");
    check(time_point_sec(current_time_point()) > licence.expiration, "Cannot extend this licence before it's expiration date.");

    lcnc_table.modify(licence, same_payer, [&](auto &s) {
        s.expiration = time_point_sec(current_time_point()) + period;
    });
}

ACTION dreamoji::revoke(const name &owner, const vector<name> &from, const vector<uint64_t> &lcnc_ids)
{

    require_auth(owner);
    require_recipient(owner);

    check(lcnc_ids.size() > 0, "min batch size of 1");
    check(lcnc_ids.size() < 20, "max batch size of 20");

    licence_index lcnc_table(get_self(), owner.value);
    lock_index lock_table(get_self(), get_self().value);

    for (auto const &lcnc_id : lcnc_ids)
    {
        const auto &licence = lcnc_table.get(lcnc_id, string("Asset id: " + to_string(lcnc_id) + " is not licensed").c_str());
        check(owner == licence.owner, "You are not the owner of the licensed nft: " + to_string(lcnc_id) + ". Owner is: " + licence.owner.to_string() + " , you entered: " + owner.to_string());
        check(time_point_sec(current_time_point()) > licence.expiration, "Cannot revoke this licence before it's expiration date.");

        vector<name> licencee_vector = licence.licensed_to;

        // remove single/multiple licensee entries but not the entire licensed_to vector
        if (from.size() <= licencee_vector.size())
        {
            for (auto j = 0; j < from.size(); ++j)
            {
                licencee_vector.erase(std::remove(licencee_vector.begin(), licencee_vector.end(), from[j]), licencee_vector.end());
            }

            // remove entire entry from licence table
            if (licencee_vector.empty())
            {
                const auto &licence = lcnc_table.get(lcnc_id, string("Asset id: " + to_string(lcnc_id) + " is not licensed").c_str());
                lcnc_table.erase(licence);
                // remove locks
                const auto &locked_nft = lock_table.get(licence.nft_id, "NFT not found in lock table");
                if (lcnc_table.find(licence.nft_id) == lcnc_table.end()) {
                    lock_table.erase(locked_nft);
                }
            }

            else {
                lcnc_table.modify(licence, same_payer, [&](auto &s) {
                s.licensed_to = licencee_vector;
                });
            }
        }

        else
        {
            check(1 == 0, "Please recheck the submitted licensed_to value(s)");
        }
    }
}

ACTION dreamoji::endnftsale(const name &seller,
                            const uint64_t &batch_id)
{
    ask_index ask_table(get_self(), get_self().value);
    const auto &ask = ask_table.get(batch_id, "cannot find sale to close");

    lock_index lock_table(get_self(), get_self().value);
    if (time_point_sec(current_time_point()) <= ask.expiration)
    {
        require_auth(seller);
        check(ask.seller == seller, "only the seller can cancel a sale in progress");
    }
    // sale has expired anyone can call this and ask removed, token removed from asks/lock
    for (auto const &nft_id : ask.nft_ids)
    {
        const auto &locked_nft = lock_table.get(nft_id, "nft not found in lock table");
        lock_table.erase(locked_nft);
    }
    ask_table.erase(ask);
}

ACTION dreamoji::endlcncsale(const name &seller,
                             const uint64_t &nft_id)
{
    sale_index sale_table(get_self(), get_self().value);
    const auto &sale = sale_table.get(nft_id, "cannot find sale to close");

    lock_index lock_table(get_self(), get_self().value);
    if (time_point_sec(current_time_point()) <= sale.end_of_sale)
    {
        require_auth(seller);
        check(sale.seller == seller, "only the seller can cancel a sale in progress");
    }

    // sale has expired anyone can call this and sale removed, token removed from sales/lock
    const auto &locked_nft = lock_table.get(nft_id, "nft not found in lock table");
    lock_table.erase(locked_nft);
    sale_table.erase(sale);
}

ACTION dreamoji::linknfts(const vector<uint64_t> &nft_ids, const uint64_t &link_to, const name &owner)
{
    require_auth(owner);
    require_recipient(owner);

    dream_index dreamoji_table(get_self(), get_self().value);
    const auto &dreamoji = dreamoji_table.get(link_to, "Parent NFT doesn't exist");

    link_index link_table(get_self(), get_self().value);
    for (auto const &nft_id : nft_ids) {
        const auto &child = dreamoji_table.get(nft_id, string("Child NFT with id: "+ to_string(nft_id) +" doesn't exist").c_str());
        check(dreamoji.owner == child.owner, "The parent and child NFT must belong to the same owner");
        check(link_table.find(nft_id) == link_table.end(), "Child NFT with id: "+ to_string(nft_id) +" is already equipped to another parent NFT");
        if (link_table.find(nft_id) == link_table.end()) {
            link_table.emplace(get_self(), [&](auto &ln) {
                ln.nft_id = nft_id;
            });
        }
    }
    
    vector<uint64_t> children = dreamoji.children;
    children.insert(children.end(), nft_ids.begin(), nft_ids.end());
    dreamoji_table.modify(dreamoji, same_payer, [&](auto &dr) {
        dr.children = children;
    });
}

ACTION dreamoji::unlinknfts(const vector<uint64_t> &nft_ids, const uint64_t &linked_to, const name &owner)
{
    require_auth(owner);
    require_recipient(owner);

    dream_index dreamoji_table(get_self(), get_self().value);
    link_index link_table(get_self(), get_self().value);
    const auto &dreamoji = dreamoji_table.get(linked_to, "Parent NFT doesn't exist");
    vector<uint64_t> children = dreamoji.children;
    
    for (auto const &nft_id : nft_ids) {
        check(dreamoji_table.find(nft_id) != dreamoji_table.end(), "Child NFT with id: "+ to_string(nft_id) +" doesn't exist");
        const auto &linked_nft = link_table.get(nft_id, string("NFT of id: " + to_string(nft_id) + " hasn't been linked").c_str());
        link_table.erase(linked_nft);
        children.erase(std::remove(children.begin(), children.end(), nft_id), children.end());
    }

    dreamoji_table.modify(dreamoji, same_payer, [&](auto &dr) {
        dr.children = children;
    });
}

// method to log nft_id and match transaction to action
ACTION dreamoji::logcall(const uint64_t &nft_id)
{
    require_auth(get_self());
}

// method to log successful sale
ACTION dreamoji::logsale(const vector<uint64_t> &nft_ids, const name &seller, const name &buyer, const name &receiver)
{
    require_auth(get_self());
}

// method to log lcnc_id and match transaction to action
ACTION dreamoji::loglicense(const uint64_t &lcnc_id)
{
    require_auth(get_self());
}

// method that handles all DRMI transfers by eosio.token from any buyer to the contract account
void dreamoji::purchase(const name &from,
                        const name &to,
                        const asset &quantity,
                        const string &memo)
{

    // allow DRMI to be sent by sending with empty string memo
    if (memo == "deposit")
        return;
    // don't allow spoofs
    if (to != get_self())
        return;
    if (from == name("eosio.stake"))
        return;
    check(quantity.symbol == symbol(symbol_code("DRMI"), 4), "Purchase only using DRMI");
    check(memo.length() <= 32, "memo too long");

    // memo format comma separated: "sale_type,to_account,asset_id"
    string sale_type;
    name to_account;
    uint64_t asset_id;
    tie(sale_type, to_account, asset_id) = stringtupler(memo);

    if (sale_type == "nftoken" || sale_type == "nft" || sale_type == "n")
    {

        ask_index ask_table(get_self(), get_self().value);
        const auto &ask = ask_table.get(asset_id, "cannot find nft sale listing");
        check(ask.amount.amount == quantity.amount, "send the correct amount");
        check(ask.expiration > time_point_sec(current_time_point()), "sale has expired");

        // amounts owed to all parties
        map<name, asset> fee_map = _calcfees(ask.nft_ids, ask.amount, ask.seller);
        for (auto const &fee : fee_map)
        {
            auto account = fee.first;
            auto amount = fee.second;

            // if seller is contract, no need to send DRMI again
            if (account != get_self())
            {
                // send DRMI to account owed
                action(permission_level{get_self(), name("active")},
                       name("eosio.token"), name("transfer"),
                       make_tuple(get_self(), account, amount, string("sale of dreamoji")))
                    .send();
            }
        }

        // remove locks, remove from ask table
        lock_index lock_table(get_self(), get_self().value);
        for (auto const &nft_id : ask.nft_ids)
        {
            const auto &locked_nft = lock_table.get(nft_id, "dreamoji not found in lock table");
            lock_table.erase(locked_nft);
        }

        // nft(s) bought, change owner to buyer regardless of transferable
        _changeowner(ask.seller, to_account, ask.nft_ids, false);
        SEND_INLINE_ACTION(*this, logsale, {{get_self(), "active"_n}}, {ask.nft_ids, ask.seller, from, to_account});

        // remove sale listing
        ask_table.erase(ask);
    }

    /**
     * @brief Purchase licence by spending DRMI tokens
     * @author Rizwan Z
     */
    else if (sale_type == "licence" || sale_type == "license" || sale_type == "lcnc" || sale_type == "l")
    {
        vector<name> to_vector;
        to_vector.insert(to_vector.begin(), to_account);

        sale_index sale_table(get_self(), get_self().value);
        const auto &sale = sale_table.get(asset_id, "The asset's licence hasn't been put for sale yet");
        check(sale.price.amount == quantity.amount, "send the exact amount of DRMI");
        check(sale.end_of_sale > time_point_sec(current_time_point()), "licence sale has expired");
        check(sale.lcnc_limit != 0, "all licences of this nft has been sold out");

        // if seller is contract, no need to send DRMI again
        if (sale.seller != get_self())
        {
            // send DRMI to the licence seller from contract
            action(permission_level{get_self(), name("active")},
                   name("eosio.token"), name("transfer"),
                   make_tuple(get_self(), sale.seller, sale.price, string("sending DRMI to the licence seller")))
                .send();
        }

        sale_table.modify(sale, same_payer, [&](auto &sl) {
            sl.lcnc_limit -= 1;
        });

        vector<uint64_t> licensed_nftid;
        licensed_nftid.push_back(sale.nft_id);
        SEND_INLINE_ACTION(*this, logsale, {{get_self(), "active"_n}}, {licensed_nftid, sale.seller, from, to_account});

        _createlicence(sale.nft_id, sale.seller, to_vector, sale.lcnc_period_sec, false);

    }

    else
    {
        check(1 == 0, "parameter to differentiate between purchase of nftoken/licence is required");
    }
}

// Private
map<name, asset> dreamoji::_calcfees(vector<uint64_t> nft_ids, asset ask_amount, name seller)
{
    map<name, asset> fee_map;
    dream_index dreamoji_table(get_self(), get_self().value);
    int64_t tot_fees = 0;
    for (auto const &nft_id : nft_ids)
    {
        const auto &token = dreamoji_table.get(nft_id, "token does not exist");

        stats_index stats_table(get_self(), token.category.value);
        const auto &dream_stats = stats_table.get(token.token_name.value, "asset stats not found");

        name rev_partner = dream_stats.rev_partner;
        if (dream_stats.rev_split == 0.0)
        {
            continue;
        }

        double fee = static_cast<double>(ask_amount.amount) * dream_stats.rev_split / static_cast<double>(nft_ids.size());
        asset fee_asset(fee, ask_amount.symbol);
        auto ret_val = fee_map.insert({rev_partner, fee_asset});
        tot_fees += fee_asset.amount;
        if (ret_val.second == false)
        {
            fee_map[rev_partner] += fee_asset;
        }
    }
    //add seller to fee_map minus fees
    asset seller_amount(ask_amount.amount - tot_fees, ask_amount.symbol);
    auto ret_val = fee_map.insert({seller, seller_amount});
    if (ret_val.second == false)
    {
        fee_map[seller] += seller_amount;
    }
    return fee_map;
}

// Private
void dreamoji::_changeowner(const name &from, const name &to, const vector<uint64_t> &nft_ids, const bool &istransfer)
{
    check(nft_ids.size() <= 20, "max batch size of 20");

    dream_index dreamoji_table(get_self(), get_self().value);
    lock_index lock_table(get_self(), get_self().value);

    // loop through vector of nft_ids, check token exists
    for (auto const &nft_id : nft_ids)
    {
        const auto &token = dreamoji_table.get(nft_id, "token does not exist");
        check(lock_table.find(nft_id) == lock_table.end(), "token locked, cannot transfer");

        // transfer linked or equiped NFTs
        if (token.children.empty() == false) {
            _changeowner(from, to, token.children, false);
        }

        stats_index stats_table(get_self(), token.category.value);
        const auto &dream_stats = stats_table.get(token.token_name.value, "dreamoji stats not found");

        if (istransfer)
        {
            check(token.owner == from, "must be token owner");
            check(dream_stats.transferable == true, "not transferable");
        }

        // notifiy both parties
        require_recipient(from);
        require_recipient(to);
        dreamoji_table.modify(token, same_payer, [&](auto &t) {
            t.owner = to;
        });

        // amount 1, precision 0 for NFT
        asset quantity(1, dream_stats.max_supply.symbol);
        _sub_balance(from, dream_stats.category_name_id, quantity);
        _add_balance(to, get_self(), token.category, token.token_name, dream_stats.category_name_id, quantity);
    }
}

// Private
void dreamoji::_checkasset(const asset &amount, const bool &fungible)
{
    auto sym = amount.symbol;
    if (fungible)
    {
        check(amount.amount > 0, "amount must be positive");
    }
    else
    {
        check(sym.precision() == 0, "NFT must be an int, precision of 0");
        check(amount.amount >= 1, "NFT amount must be >= 1");
    }

    config_index config_table(get_self(), get_self().value);
    auto config_singleton = config_table.get();
    check(config_singleton.symbol.raw() == sym.code().raw(), "Symbol must match symbol in config");
    check(amount.is_valid(), "invalid amount");
}

// Private
void dreamoji::_mint(const name &to,
                     const name &issuer,
                     const name &category,
                     const name &token_name,
                     const asset &issued_supply,
                     const string &relative_uri)
{

    dream_index dreamoji_table(get_self(), get_self().value);
    auto nft_id = _nextnftid();
    dreamoji_table.emplace(get_self(), [&](auto &dj) {
        dj.id = nft_id;
        dj.serial_number = issued_supply.amount + 1;
        dj.owner = to;
        dj.category = category;
        dj.token_name = token_name;
        dj.relative_uri = relative_uri;
    });

    SEND_INLINE_ACTION(*this, logcall, {{get_self(), "active"_n}}, {nft_id});
}

// available_primary_key() will reuse id's if last minted token is burned -- bad
uint64_t dreamoji::_nextnftid()
{

    // get next_nft_id and increment
    config_index config_table(get_self(), get_self().value);
    check(config_table.exists(), "dreamoji config table does not exist, instantiate first");
    auto config_singleton = config_table.get();
    auto next_nft_id = config_singleton.next_nft_id++;
    config_table.set(config_singleton, get_self());
    return next_nft_id;
}

uint64_t dreamoji::_nextlicenceid()
{

    // get next_licence_id and increment
    config_index config_table(get_self(), get_self().value);
    check(config_table.exists(), "dreamoji config table does not exist, instantiate first");
    auto config_singleton = config_table.get();
    auto next_licence_id = config_singleton.next_licence_id++;
    config_table.set(config_singleton, get_self());
    return next_licence_id;
}

// Private
void dreamoji::_add_balance(const name &owner, const name &ram_payer, const name &category, const name &token_name,
                            const uint64_t &category_name_id, const asset &quantity)
{
    account_index to_account(get_self(), owner.value);
    auto acct = to_account.find(category_name_id);
    if (acct == to_account.end())
    {
        to_account.emplace(get_self(), [&](auto &a) {
            a.category_name_id = category_name_id;
            a.category = category;
            a.token_name = token_name;
            a.amount = quantity;
        });
    }
    else
    {
        to_account.modify(acct, same_payer, [&](auto &a) {
            a.amount += quantity;
        });
    }
}

// Private
void dreamoji::_sub_balance(const name &owner, const uint64_t &category_name_id, const asset &quantity)
{

    account_index from_account(get_self(), owner.value);
    const auto &acct = from_account.get(category_name_id, "token does not exist in account");
    check(acct.amount.amount >= quantity.amount, "quantity is more than account balance");

    if (acct.amount.amount == quantity.amount)
    {
        from_account.erase(acct);
    }
    else
    {
        from_account.modify(acct, same_payer, [&](auto &a) {
            a.amount -= quantity;
        });
    }
}

//Private
void dreamoji::_createlicence(const uint64_t &nft_id, const name &owner, const vector<name> &to, const uint64_t &period, const bool &relicense)
{

    auto licence_id = _nextlicenceid();
    licence_index lcnc_table(get_self(), get_self().value);
    lock_index lock_table(get_self(), get_self().value);
    lcnc_table.emplace(get_self(), [&](auto &lc) {
        lc.licence_id = licence_id;
        lc.nft_id = nft_id;
        lc.owner = owner;
        lc.licensed_to = to;
        lc.expiration = time_point_sec(current_time_point()) + period;
        lc.relicense = relicense;
    });
    // add token to lock table
    if (lock_table.find(nft_id) == lock_table.end()) {
        lock_table.emplace(get_self(), [&](auto &l) {
            l.nft_id = nft_id;
        });
    }
    SEND_INLINE_ACTION(*this, loglicense, {{get_self(), "active"_n}}, {licence_id});

    dream_index dreamoji_table(get_self(), get_self().value);
    auto &token = dreamoji_table.get(nft_id, "nftoken doesn't exist");
    if (token.children.empty() == false) {
        for (auto const &child_id : token.children) {
            _createlicence(child_id, owner, to, period, relicense);
        }
    }
}

extern "C"
{
    void apply(uint64_t receiver, uint64_t code, uint64_t action)
    {
        auto self = receiver;

        if (code == self)
        {
            switch (action)
            {
                EOSIO_DISPATCH_HELPER(dreamoji, (instantiate)(create)(issue)(freezemaxsup)(burnnft)(burnft)(transfernft)(transferft)(nftokensale)(licencesale)(license)(extend)(revoke)(endnftsale)(endlcncsale)(linknfts)(unlinknfts)(logcall)(logsale)(loglicense))
            }
        }

        else
        {
            if (action == name("transfer").value && code == name("eosio.token").value)
            {
                execute_action(name(receiver), name(code), &dreamoji::purchase);
            }
        }
    }
}
