# Dreamchain-Sharp
C# client library for DreamChain blockchains.
```
Install-Package drm-sharp
```

### Prerequisite to build

Visual Studio 2017+


```
Install-Package drm-sharp
```

### Usage

#### Configuration

In order to interact with eos blockchain you need to create a new instance of the **Drm** class with a **DrmConfigurator**.

Example:

```csharp
Drm drm = new Drm(new DrmConfigurator()
{    
    HttpEndpoint = "https://15.206.79.84", //Mainnet
    ChainId = "0e64d141d9b3984271eaf55eda643d3a5a3f05e12ad6ab48837c54bdadbd1dfe",
    ExpireSeconds = 60,
    SignProvider = new DefaultSignProvider("myprivatekey")
});
```
* HttpEndpoint - http or https location of a nodeosd server providing a chain API.
* ChainId - unique ID for the blockchain you're connecting to. If no ChainId is provided it will get from the get_info API call.
* ExpireInSeconds - number of seconds before the transaction will expire. The time is based on the nodeosd's clock. An unexpired transaction that may have had an error is a liability until the expiration is reached, this time should be brief.
* SignProvider - signature implementation to handle available keys and signing transactions. Use the DefaultSignProvider with a privateKey to sign transactions inside the lib.

#### Api read methods

- **GetInfo** call
```csharp
var result = await drm.GetInfo();
```
Returns:
```csharp
class GetInfoResponse 
{ 
    string server_version;
    string chain_id;
    UInt32 head_block_num;
    UInt32 last_irreversible_block_num;
    string last_irreversible_block_id;
    string head_block_id;
    DateTime head_block_time;
    string head_block_producer;
    string virtual_block_cpu_limit;
    string virtual_block_net_limit;
    string block_cpu_limit;
    string block_net_limit;
}
```

- **GetAccount** call
```csharp
var result = await drm.GetAccount("myaccountname");
```
Returns:
```csharp
class GetAccountResponse
{
    string account_name;
    UInt32 head_block_num;
    DateTime head_block_time;
    bool privileged;
    DateTime last_code_update;
    DateTime created;
    Int64 ram_quota;
    Int64 net_weight;
    Int64 cpu_weight; 
    Resource net_limit; 
    Resource cpu_limit;
    UInt64 ram_usage;
    List<Permission> permissions;
    RefundRequest refund_request;
    SelfDelegatedBandwidth self_delegated_bandwidth;
    TotalResources total_resources;
    VoterInfo voter_info;
}
```

- **GetBlock** call
```csharp
var result = await drm.GetBlock("blockIdOrNumber");
```
Returns:
```csharp
class GetBlockResponse
{
    DateTime timestamp;
    string producer;
    UInt32 confirmed;
    string previous;
    string transaction_mroot;
    string action_mroot;
    UInt32 schedule_version;
    Schedule new_producers;
    List<Extension> block_extensions;
    List<Extension> header_extensions;
    string producer_signature;
    List<TransactionReceipt> transactions;
    string id;
    UInt32 block_num;
    UInt32 ref_block_prefix;
}
```

- **GetTableRows** call
    * Json
    * Code - accountName of the contract to search for table rows
    * Scope - scope text segmenting the table set
    * Table - table name 
    * TableKey - unused so far?
    * LowerBound - lower bound for the selected index value
    * UpperBound - upper bound for the selected index value
    * KeyType - Type of the index choosen, ex: i64
    * Limit
    * IndexPosition - 1 - primary (first), 2 - secondary index (in order defined by multi_index), 3 - third index, etc
    * EncodeType - dec, hex
	* Reverse - reverse result order
	* ShowPayer - show ram payer

```csharp
var result = await drm.GetTableRows(new GetTableRowsRequest() {
    json = true,
    code = "eosio.token",
    scope = "EOS",
    table = "stat"
});
```

Returns:

```csharp
class GetTableRowsResponse
{
    List<object> rows
    bool?        more
}
```

Using generic type

```csharp
/*JsonProperty helps map the fields from the api*/
public class Stat
{
    public string issuer { get; set; }
    public string max_supply { get; set; }
    public string supply { get; set; }
}

var result = await Drm.GetTableRows<Stat>(new GetTableRowsRequest()
{
    json = true,
    code = "eosio.token",
    scope = "EOS",
    table = "stat"
});
```

Returns:

```csharp
class GetTableRowsResponse<Stat>
{
    List<Stat> rows
    bool?      more
}
```

- **GetTableByScope** call
    * Code - accountName of the contract to search for tables
    * Table - table name to filter
    * LowerBound - lower bound of scope, optional
    * UpperBound - upper bound of scope, optional
    * Limit
    * Reverse - reverse result order

```csharp
var result = await drm.GetTableByScope(new GetTableByScopeRequest() {
   code = "eosio.token",
   table = "accounts"
});
```

Returns:

```csharp
class GetTableByScopeResponse
{
    List<TableByScopeResultRow> rows
    string more
}

class TableByScopeResultRow
{
    string code;
    string scope;
    string table;
    string payer;
    UInt32? count;
}
```

- **GetActions** call
    * accountName - accountName to get actions history
    * pos - a absolute sequence positon -1 is the end/last action
    * offset - the number of actions relative to pos, negative numbers return [pos-offset,pos), positive numbers return [pos,pos+offset)

```csharp
var result = await drm.GetActions("myaccountname", 0, 10);
```

Returns:

```csharp
class GetActionsResponse
{
    List<GlobalAction> actions;
    UInt32 last_irreversible_block;
    bool time_limit_exceeded_error;
}
```

#### Create Transaction

**NOTE: using anonymous objects and / or properties as action data is not supported on WEBGL Unity exports
Use data as dictionary or strongly typed objects with fields.**

```csharp
var result = await drm.CreateTransaction(new Transaction()
{
    actions = new List<Api.v1.Action>()
    {
        new Api.v1.Action()
        {
            account = "eosio.token",
            authorization = new List<PermissionLevel>()
            {
                new PermissionLevel() {actor = "tester112345", permission = "active" }
            },
            name = "transfer",
            data = new { from = "tester112345", to = "tester212345", quantity = "0.0001 DRMC", memo = "hello crypto world!" }
        }
    }
});
```

Data can also be a Dictionary with key as string. The dictionary value can be any object with nested Dictionaries

```csharp
var result = await drm.CreateTransaction(new Transaction()
{
    actions = new List<Api.v1.Action>()
    {
        new Api.v1.Action()
        {
            account = "eosio.token",
            authorization = new List<PermissionLevel>()
            {
                new PermissionLevel() {actor = "tester112345", permission = "active" }
            },
            name = "transfer",
            data = new Dictionary<string, string>()
            {
                { "from", "tester112345" },
                { "to", "tester212345" },
                { "quantity", "0.0001 DRMC" },
                { "memo", "hello crypto world!" }
            }
        }
    }
});
```

Returns the transactionId
#### Custom SignProvider

Is also possible to implement your own **ISignProvider** to customize how the signatures and key handling is done.

Example:

```csharp
/// <summary>
/// Signature provider implementation that uses a private server to hold keys
/// </summary>
class SuperSecretSignProvider : ISignProvider
{
   /// <summary>
   /// Get available public keys from signature provider server
   /// </summary>
   /// <returns>List of public keys</returns>
   public async Task<IEnumerable<string>> GetAvailableKeys()
   {
        var result = await HttpHelper.GetJsonAsync<SecretResponse>("https://supersecretserver.com/get_available_keys");
        return result.Keys;
   }
   
   /// <summary>
   /// Sign bytes using the signature provider server
   /// </summary>
   /// <param name="chainId">Chain id</param>
   /// <param name="requiredKeys">required public keys for signing this bytes</param>
   /// <param name="signBytes">signature bytes</param>
   /// <param name="abiNames">abi contract names to get abi information from</param>
   /// <returns>List of signatures per required keys</returns>
   public async Task<IEnumerable<string>> Sign(string chainId, List<string> requiredKeys, byte[] signBytes)
   {
        var result = await HttpHelper.PostJsonAsync<SecretSignResponse>("https://supersecretserver.com/sign", new SecretRequest {
            chainId = chainId,
            RequiredKeys = requiredKeys,
            Data = signBytes
        });
        return result.Signatures;
   }
}

// create new Drm client instance using your custom signature provider
Drm drm = new Drm(new DrmConfigurator()
{
    SignProvider = new SuperSecretSignProvider(),
    HttpEndpoint = "https://15.206.79.84", //Mainnet
    ChainId = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
});
```
#### CombinedSignersProvider

Is also possible to combine multiple signature providers to complete all the signatures for a transaction

Example:

```csharp
Drm drm = new Drm(new DrmConfigurator()
{    
    HttpEndpoint = "https://15.206.79.84", //Mainnet
    ChainId = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
    ExpireSeconds = 60,
    SignProvider = new CombinedSignersProvider(new List<ISignProvider>() {
       new SuperSecretSignProvider(),
       new DefaultSignProvider("myprivatekey")
    }),
});
```
#### 1.Account Management 
This contains account management functionalities specific to dreamchain. The different account management functionalities added are as follows
```
1.1.KeyPair Generation
doKeyGeneration();
Can be used to create the pair of active and owner keys(Login and restore Keys)
```
- **Generate Key Pair** call
```csharp
var result = await drm.doKeyGeneration();
```
Returns:
```csharp
{
  "recoveryPrivateKey": "5JjbM8NNZmzmvFmWAg71hcfgeBvkU4MwTp6pnqGpKE825z1M51A",
  "recoveryPublicKey": "DRM7MnD1uvWx6d4qjfiysqe8FgW4itYYJPx5uMaVaRcUYXGKJPZBd",
  "logiPrivatenKey": "5KNSEekRteX6MFShpLVtEapBuXooAZLLbaJXyDu65a2hc537aAF",
  "loginPublicKey": "DRM82Hc45mts9uXqWeKSHnZmc9G4CymvyzkdecYFycoERfew9QzNf"
}
```

```
1.2.Signup
doSignup(walletApiUrl,accountName, loginPublicKey, restorePublicKey)
Can be used to create a new account 
Parameters:
walletApiUrl- The api url
accountName - Account name
loginPublicKey - The key which will be used to generate keystore
restorePublicKey - The key which is used to update the login key if its lost
```
```csharp
//Sample Code

Drm drm = GetDrm();
const walletApiUrl = URL;
const accountName = "testdata1234";
const loginPublicKey = "DRM82Hc45mts9uXqWeKSHnZmc9G4CymvyzkdecYFycoERfew9QzNf";
const restorePublicKey = "DRM7MnD1uvWx6d4qjfiysqe8FgW4itYYJPx5uMaVaRcUYXGKJPZBd";
JObject result = drm.doSignup(walletApiUrl,accountName, loginPublicKey, restorePublicKey);
```

```
1.3.Login
doLogin(drm,loginKey)
Can be used to login to an account 
Parameters:
drm -  That will be the Drm object(*)
loginKey - The key to login into an account
```
```csharp
//Sample Code

Drm drm = GetDrm();
const loginKey = "5KNSEekRteX6MFShpLVtEapBuXooAZLLbaJXyDu65a2hc537aAF";
string result = await drm.doLogin(drm, loginKey);

```
```
1.4.GetAccountInfo
doGetAccountInfo(drm, accountName)
Can be used to fetch the account information
Parameters:
drm -  That will be the Drm object 
accountName - Account name of which the information has to be fetched
```
```csharp
//Sample Code

Drm drm = GetDrm();
const accountName = "testdata1234";
JObject result = await drm.doGetAccountInfo(drm, accountName);

```
```
1.5.Balance Check
doGetBalance(drm,accountName , currency)
Can be used to fetch the account balance
Parameters:
drm -  That will be the Drm object 
accountName - Account name of which the information has to be fetched
currency - Currency to be checked(DRMI/DRMC)
```
```csharp
//Sample Code

Drm drm = GetDrm();
const accountName = "testdata1234";
const currency = "DRMC";
string result = await drm.doGetBalance(drm,accountName , currency);

```
```
1.6.Keystore Generation
doKeyStoreGeneration(loginKey, keystorePassword)
Can be used to create a keystore file
Parameters:
loginKey - The key to login into an account
keystorePassword - Password to be used to access the keystore 
```
```csharp

//Sample Code

Drm drm = GetDrm();
const loginKey = "5KNSEekRteX6MFShpLVtEapBuXooAZLLbaJXyDu65a2hc537aAF";
const restorePassword = "somestrongpassword";
string result = await drm.doKeyStoreGeneration(loginKey, keystorePassword);

```
```
1.7.Faucet
doGetDrmc(walletApiUrl, accountName)
Can be used to add balance to account
Parameters:
walletApiUrl- The api url
accountName - Account name to which the balance has to be added
```
```csharp

//Sample Code

Drm drm = GetDrm();
const accountName = "testdata1234";
const walletApiUrl = URL;
JObject response = await drm.doGetDrmc(walletApiUrl, accountName);

const accountName = "testdata1234";
const walletApiUrl = URL;
JObject response = await drm.doGetDrmi(walletApiUrl, accountName);

```
                            
```
1.8.Change Login Key
doChangeLoginKey(drm, loginAccountName, recoveryKey, newPublicKey)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
loginAccountName - Account name 
recoveryKey - Recovery key of the account
newPublicKey - New login publickey
```
```csharp

//Sample Code

const privateKey = "5KNSEekRteX6MFShpLVtEapBuXooAZLLbaJXyDu65a2hc537aAF";
Drm drm = GetDrm(privateKey);
const loginAccountName = "testdata1234";
const newPublicKey = "DRM4wX4zwztwnBcWa4iFqxfGefXyCoVLLn6JpVGQS6oupuTnvboGn";
string tx = await drm.doChangeLoginKey(drm, loginAccountName, newPublicKey);

```
#### 1.NFT Management 
This contains NFT functionalities specific to dreamchain. The different NFT functionalities added are as follows

```csharp

2.1.Create NFT
doCreateToken(drm,creator,data)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
creator - Creator of NFT
data - Object conatining parameters

```
```csharp

//Sample Code

                string privatekey = "<privatekey>";
                Drm drm = GetDrm(privatekey);
                string creator = "<accountname>";
               object data = new
                {
                    issuer = creator,  //12 char account name which should authorize doIssue
                    rev_partner = creator, //any 12 char account that get a share from the sale of token
                    category = "avatars",
                    token_name = "superman", 
                    fungible = false,
                    burnable = true,
                    sellable = true,
                    transferable = true,
                    rev_split = 0.05,
                    base_uri = "https://dreamchain.netobjex.com/avatars/",
                    max_issue_days = 0,
                    max_supply = "1 DRMT"
                };

```
```csharp

2.2.Issue NFT
doIssueToken(drm,data)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
data - Object conatining parameters
```csharp

//Sample Code
               object data = new
                {
                                       to = account_name, //12 char account of owner who should authorize all further NFT actions
                                       category = "avatars",
                                       token_name = "superman",
                                       quantity = "1 DRMT", //must be less than max_supply
                                       relative_uri = "superman", //for variations in metadata of tokens with   same base_uri
                                       memo = "Enjoy your avatar!"
                };


```


```csharp


2.3.Burn NFT
doBurnToken(drm,auth,data)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
auth- who authenticate the transaction
data - Object conatining parameters
```
```csharp

//Sample Code

               object data = new
                {
                                       owner = “<account_name>”,
                                       dgood_ids = [1] //NFT ID can be listed as a batch or as single nft
                }


```

```csharp


2.4.Transfer Token
doTransferToken(drm,auth,data)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
auth- who authenticate the transaction
data - Object conatining parameters
```
```csharp

//Sample Code
               object data = new
                {
                                       from = “<account_name>”, //owner account
                                       to = “<account_name>”, //receiver account
                                       dgoods_ids = [1,2], //NFT ID can be listed as a batch or as single nft
                                       memo = "Enjoy your avatar!"
                }

```

```csharp


2.5.List SaleNFT
doListSaleNFT(drm,auth,data)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
auth- who authenticate the transaction
data - Object conatining parameters
```
```csharp

//Sample Code
               object data = new
                {
                                       seller = “<account_name>”,
                                       dgood_ids = [1], //id of nft to be put for sale
                                       net_sale_amount = "120.0000 DRMI" //precision 4 is mandatory

                }


```

```csharp
2.6.Close SaleNFT
doCloseSaleNFT(drm,auth,data)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
auth- who authenticate the transaction
data - Object conatining parameters
```
```csharp

//Sample Code
               object data = new
                {
                                       seller = “<account_name>”, //needs seller auth before sale expiration
                                       batch_id = 1 //id of nft to remove from sale listing

                }



```

```csharp
2.7.LicenseNFT
doLicenseNFT(drm,auth,data)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
auth- who authenticate the transaction
data - Object conatining parameters
```
```csharp

//Sample Code
               object data = new
                {
                                       owner = “<account_name>”, 
                                       to = [“<account_name>”], //vector of account names of licence receivers (can be a single account, separate names with comma for multiple licensee)
                                       dgood_ids = [1],
                                       period = 204800, //licensing period in seconds
                                       relicense ="relicense" //boolean that determines if licence is extendable
                }


```


```csharp
2.8.ExtendNFT
doExtendNFT(drm,auth,data)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
auth- who authenticate the transaction
data - Object conatining parameters
```
```csharp

//Sample Code
               object data = new
                {
                                       owner = “<account_name>”,
                                       assetidc = 1,
                                       period ="period" //extension period in seconds
                }


```


```csharp
2.9.RevokeNFT
doRevokeNFT(drm,auth,data)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
auth- who authenticate the transaction
data - Object conatining parameters
```
```csharp

//Sample Code
               object data = new
                {
                                       owner = “<account_name>”,
                                       from = [“<account_name>”], //vector of account names of to revoke licence from (after expiration of licensing period only)
                                       dgood_ids =[1]
                }


```


```csharp

#### Filter

```csharp
Filter Actions
doFilterActions(drm,accountName,actionType,action,token_name,currency_name, int limit = 100)
Can be used to change the account loginKey
drm - Drm object with SignProvider (**)
data - Object conatining parameters
accountName - Account name
actionType - eosio.token or nftcontractName
action - issue/create/saecreate/listesalenft/burnnft/closesalenft/transfer
token_name -Name of the token
currency_name -Name of currency
```
```csharp

//Sample Code

JObject response = await drm.doFilterActions(drm,accountName,eosio.token,action,token);

```

```csharp

//(*)Object Creation
                        Drm GetDrm(string privateKey="")
                        {
                            if(privateKey=="")
                            {
                                return new Drm(new DrmConfigurator()
                                {
                                HttpEndpoint = httpEndPoint, //Mainnet
                                ChainId = ChainId
                                });
                            }
                            else
                            {
                                return new Drm(new DrmConfigurator()
                                {
                                HttpEndpoint = httpEndPoint, //Mainnet
                                ChainId = ChainId,
                                SignProvider = new DefaultSignProvider(privateKey)
                                });
                            }
                        }
                        Drm drm = GetDrm();


```
