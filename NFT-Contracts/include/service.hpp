#pragma once

#include <string>
#include <algorithm>
#include <cctype>
#include <locale>
#include <eosio/eosio.hpp>

using namespace std;
using namespace eosio;

/**
 * @author Rizwan Z
 * @brief purchase memo sub-string whitespace removal and convertion into a tuple of corresponding datatypes
 */

namespace service
{

    // remove whitespace from left end
    static inline void left(string &sub)
    {
        sub.erase(sub.begin(), find_if(sub.begin(), sub.end(), [](int ch) {
                      return !isspace(ch);
                  }));
    }

    // remove whitespace from right end
    static inline void right(string &sub)
    {
        sub.erase(find_if(sub.rbegin(), sub.rend(), [](int ch) {
                      return !isspace(ch);
                  }).base(),
                  sub.end());
    }

    // remove whitespace from both ends
    static inline string crop(string sub)
    {
        left(sub);
        right(sub);
        return sub;
    }

    tuple<string, name, uint64_t> stringtupler(const string &memo)
    {
        auto pstn_com1 = memo.find(',');
        auto pstn_com2 = memo.find(',', (pstn_com1 + 1));
        string err_msg = "the correct format of memo is sale_type,to_account,asset_id";
        check(pstn_com1 != string::npos, err_msg);
        check(pstn_com2 != string::npos, err_msg);
        if (pstn_com1 != string::npos && pstn_com2 != string::npos)
        {
            check((pstn_com2 != memo.size() - 1), err_msg);
            // An account name of 12 characters must be present between the two commas
            check((pstn_com2 - pstn_com1) == 13, err_msg);
        }
        // WASM doesn't handle errors, ergo when stoull error is thrown, execution is aborted
        string sale_type = crop(memo.substr(0, pstn_com1));
        name to_account = name(crop(memo.substr((pstn_com1 + 1), 12)));
        uint64_t asset_id = stoull(crop(memo.substr(pstn_com2 + 1)));

        return make_tuple(sale_type, to_account, asset_id);
    }
}
