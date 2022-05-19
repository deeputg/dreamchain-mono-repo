using DrmSharp;
using DrmSharp.Exceptions;
using DrmSharp.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.IO;
using System;
using System.Text;
using DrmSharp.Api.v1;
using System.Collections.Generic;
using DrmSharp.Providers;
using System.Runtime.InteropServices;

namespace DrmSharp
{

    public class account
    {
        public string accountName { get; set; }
        public string ownerKey { get; set; }
        public string activeKey { get; set; }
    }

    public class keyPair
    {
        public string recoveryPrivateKey { get; set; }
        public string recoveryPublicKey { get; set; }
        public string logiPrivatenKey { get; set; }
        public string loginPublicKey { get; set; }
    }

    public class Faucet
    {
        public string accountName;
        public string amount;
    }

    public class Key
    {
        public string key;
        public int weight;
    }
    public class Account
    {
        public PermissionLevel permission;
        public int weight;
    }
    public class Auth
    {
        public object[] accounts;
        public object[] waits;
        public int threshold;
        public Key[] keys;
    }

    public class CreateAccountResponse
    {
        public bool status;
        public string txId;
        public string error;
    }
 
     public class DrmcFaucetResponse
    {
        public bool status;
        public string txId;
    }
 
     public class DrmiFaucetResponse
    {
        public bool status;
        public string txId;
    }   
    public class ErrorResponse
    {
        public bool status;
        public string message;
    }

    public class Keystore
    {
        public string version = "1.0";
        //public string publicAddress;
        //public string accountName;
        public Crypto Crypto;
        public string mac;
    }
    public class Crypto
    {
        public string ciphertext;
        public string iv;
        public string cipher;
        public string kdf;
        public string kdfSalt;
        public int iterationCount;
    }

    public class GenerateKeystoreResponse
    {
        public bool status;
        public string path;
        public string error;
    }
    public class ReadKeystoreResponse
    {
        public bool status;
        public string path;
        public string[] existingKestores;
        public string error;
    }

    /// <summary>
    /// DrmIO client wrapper using general purpose HttpHandler
    /// </summary>
    public class Drm : DrmBase
    {
        /// <summary>
        /// DrmIO Client wrapper constructor.
        /// </summary>
        /// <param name="config">Configures client parameters</param>
        public Drm(DrmConfigurator config) :
            base(config, new HttpHandler())
        {
        }


        //KeyPair Genrator
        public async Task<JObject> doKeyGeneration()
        {
            HttpHandler http = new HttpHandler();
            try
            {

                JObject ownerKey = JObject.FromObject(CryptoHelper.GenerateKeyPair());
                JObject activeKey = JObject.FromObject(CryptoHelper.GenerateKeyPair());
                keyPair keyPair = new keyPair()
                {
                    recoveryPublicKey = ownerKey["PublicKey"].ToString(),
                    recoveryPrivateKey = ownerKey["PrivateKey"].ToString(),
                    loginPublicKey = activeKey["PublicKey"].ToString(),
                    logiPrivatenKey = activeKey["PrivateKey"].ToString(),

                };

                return JObject.FromObject(keyPair);
                
            }
            catch(ApiErrorException e)
            {
                var response = new ErrorResponse()
                {
                    status = false,
                    message = "Failed to generate keypair"+e
                };
                JObject err = JObject.FromObject(response);
                return err;
            }
        }

        //Signup
        public async Task<JObject> doSignup(string walletUrl,string accountName, string loginkey, string recoveryKey)
        {
            HttpHandler http = new HttpHandler();
            try
            {
               
                account accountData = new account()
                {
                    accountName = accountName,
                    ownerKey =recoveryKey,
                    activeKey = loginkey
                };

                account recoveryKeyData = new account()
                {
                    accountName = accountName,
                    ownerKey = recoveryKey,
                    activeKey = loginkey
                };
                JObject response=JObject.FromObject(await http.PostJsonAsync<CreateAccountResponse>(
                walletUrl+"/createAccount", accountData));
                if (response["status"].ToString() == "true")
                {
                return JObject.FromObject(recoveryKeyData);
                } 
                else 
                {
                return JObject.FromObject(response);
                }
                
            }
            catch(ApiErrorException e)
            {
                var response = new ErrorResponse()
                {
                    status = false,
                    message = "Failed to signup"+e
                };
                JObject err = JObject.FromObject(response);
                return err;
            }
        }

        //Login 
        public async Task<string> doLogin(Drm drm,string pv)
        {
            try
            {
                // Extract public key from the private key
                var pubKey = CryptoHelper.PrivKeyToPubKey(pv);
                // Fetch the account names linked with respective public key
                var account = await drm.GetKeyAccounts(pubKey);
                var publicKey = pubKey;
                var accountName = account[0];
                return accountName;

            }
            catch (ApiErrorException e)
            {
                return "false";
            }
        }

         // Fetch account deatails
        public async Task<JObject> doGetAccountInfo(Drm drm,string accountName)
        {
            try
            {
                var accountInfo = await drm.GetAccount(accountName);

                JObject o = JObject.FromObject(accountInfo);
                return JObject.FromObject(o);
                
            }
            catch (ApiErrorException e)
            {
                var response = new ErrorResponse()
                {
                    status = false,
                    message = "Account Not Fount" +e
                };
                JObject err = JObject.FromObject(response);
                return err;
            }
        }

         // Fetch the balance
        public async Task<string> doGetBalance(Drm drm, string accountName, string currency)
        {
            try
            {

                //Drm drm = new Drm(new DrmConfigurator()
                //{
                //    HttpEndpoint = httpEndPoint, //Mainnet
                //    ChainId = chainId,
                //});
                var tx = await drm.GetCurrencyBalance("eosio.token", accountName, currency);

                JArray o = JArray.Parse(JsonConvert.SerializeObject(tx));
                if (o.Count > 0)
                {
                    var balance = o[0].ToString();
                    return balance;
                }
                else
                {
                    return "0 " + currency;
                }
            }
            catch (ApiErrorException e)
            {
                return "0 " + currency;
            }
        }

        //Drmc Faucet
       public async Task<JObject> doGetDrmc(string walletUrl, string accountName)
        {
            HttpHandler http = new HttpHandler();
            try
            {
                Faucet drmcFaucet = new Faucet()
                {
                    accountName = accountName,
                    amount = "10.0000 DRMC"
                };
                JObject response=JObject.FromObject(await http.PostJsonAsync<DrmcFaucetResponse>(
                walletUrl+"/drmcFaucet", drmcFaucet));
                return JObject.FromObject(response);

            }
            catch(ApiErrorException e)
            {
                var response = new ErrorResponse()
                {
                    status = false,
                    message = "Failed to add drmc to the account"+e
                };
                JObject err = JObject.FromObject(response);
                return err;
            }
        }

        //Drmi Faucet
       public async Task<JObject> doGetDrmi(string walletUrl,string accountName)
        {
            HttpHandler http = new HttpHandler();
            try
            {

                Faucet drmiFaucet = new Faucet()
                {
                    accountName = accountName,
                    amount = "10.0000 DRMI"
                };

                JObject response=JObject.FromObject(await http.PostJsonAsync<DrmiFaucetResponse>(
                walletUrl+"/drmiFaucet", drmiFaucet));
                return JObject.FromObject(response);
            }
            catch(ApiErrorException e)
            {
                var response = new ErrorResponse()
                {
                    status = false,
                    message = "Failed to add drmi to the account"+e
                };
                JObject err = JObject.FromObject(response);
                return err;
            }
        }

        // Keystore Generation
        public async Task<string> doKeyStoreGeneration(string activePublicKey, string activePrivateKey, string password)
        {
            try
            {
                string original = activePrivateKey;
                string path = ".keystore";
                bool isWindows = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
                bool isLinux = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.Linux);
                bool isOSX = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.OSX);
                if (isWindows)
                    path = Path.Combine("C:\\", "AppData", "Drm", "keystore");
                if (isLinux)
                    path = ".Drm/keystore/";
                if (isOSX)
                    path = ".Drm/keystore/";

                // Create a new instance of the RijndaelManaged class
                using (RijndaelManaged myRijndael = new RijndaelManaged())
                {
                    // converting password to byte array 
                    byte[] passBytes = Encoding.UTF8.GetBytes(password);
                    // Create a byte array to hold the random value.
                    byte[] salt = new byte[8];
                    using (RNGCryptoServiceProvider rngCsp = new RNGCryptoServiceProvider())
                    {
                        // Fill the array with a random value.
                        rngCsp.GetBytes(salt);
                    }

                    //randome itaration value
                    Random random = new Random();
                    int myIterations = random.Next(1000, 9999);

                    // Key derivation function
                    Rfc2898DeriveBytes encKey = new Rfc2898DeriveBytes(passBytes, salt, myIterations);




                    //set the padding mode used in the algorithm.   
                    myRijndael.Padding = PaddingMode.PKCS7;


                    // considering Encryption key and init vector is same 
                    myRijndael.Key = encKey.GetBytes(16);
                    myRijndael.GenerateIV();


                    // Encrypt the string to an array of bytes. 
                    byte[] encrypted = EncryptStringToBytes(original, myRijndael.Key, myRijndael.IV);

                    string encryptedStr = System.BitConverter.ToString(encrypted);

                    string toMacStr = encryptedStr +"-"+ System.BitConverter.ToString(myRijndael.Key);
                    //return System.BitConverter.ToString(myRijndael.Key);
                    byte[] toMacBytes = getByteArrayFromString(toMacStr);
                    //byte[] toMacBytes =new byte[] { 0x00};

                    SHA256 mySHA256 = SHA256.Create();
                    byte[] hashValue = mySHA256.ComputeHash(toMacBytes);

                        // Creating the keystore
                    Keystore keyStore = new Keystore();
                    Crypto crypto = new Crypto();

                    crypto.ciphertext = encryptedStr;
                    crypto.cipher = "RijndaelManaged";
                    crypto.iv = System.BitConverter.ToString(myRijndael.IV);
                    crypto.kdf = "Rfc2898DeriveBytes";
                    crypto.kdfSalt = System.BitConverter.ToString(salt);
                    crypto.iterationCount = myIterations;

                    keyStore.version = "1.0";
                    keyStore.Crypto = crypto;
                    keyStore.mac = System.BitConverter.ToString(hashValue);


                    string stringifiedJsonKeystore = JsonConvert.SerializeObject(keyStore);

                    DirectoryInfo di = Directory.CreateDirectory(path);
                    path = path + "/" + System.BitConverter.ToString(mySHA256.ComputeHash(Encoding.UTF8.GetBytes(activePublicKey))) + ".keystore";
                    using (StreamWriter sw = new StreamWriter(path))
                    {
                        sw.WriteLine(stringifiedJsonKeystore);
                    }
                    return path;
                }
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }

        // key retrieval from keystore
        public async Task<string> doKeyStoreDecryption(string password)
        {
            try
            {

                string path = ".keystore";
                bool isWindows = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
                bool isLinux = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.Linux);
                bool isOSX = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.OSX);
                if (isWindows)
                    path = Path.Combine("C:\\", "AppData", "Drm", "keystore");
                if (isLinux)
                    path = ".Drm/keystore/";
                if (isOSX)
                    path = ".Drm/keystore/";

                // Create a new instance of the RijndaelManaged class
                using (RijndaelManaged myRijndael = new RijndaelManaged())
                {

                    //set the padding mode used in the algorithm.   
                    myRijndael.Padding = PaddingMode.PKCS7;

                    // converting password to byte array 
                    byte[] passBytes = Encoding.UTF8.GetBytes(password);

                    // Reading the keystore
                    string decryptedStr = "";
                    bool isMacMatch = false;
                    foreach (string file in Directory.EnumerateFiles(path, "*.keystore"))
                    {
                        string contents = File.ReadAllText(file).Trim().Replace("\n", "").Replace("\r", "").Replace("\t", "");
                        JObject json = JObject.Parse(contents);
                        //Keystore keyStore = new Keystore();
                        //Crypto crypto = new Crypto()
                        //return contents;
                        Keystore keystore = JsonConvert.DeserializeObject<Keystore>(contents);
                        Crypto crypto = keystore.Crypto;

                        
                        byte[] salt = getByteArrayFromString(crypto.kdfSalt);
                        int iterationCount = crypto.iterationCount;
                        

                        // Key derivation function
                        Rfc2898DeriveBytes decKey = new Rfc2898DeriveBytes(passBytes, salt, iterationCount);
                        myRijndael.Key = decKey.GetBytes(16);
                        myRijndael.IV = getByteArrayFromString(crypto.iv);
                        byte[] encryptedByte = getByteArrayFromString(crypto.ciphertext);
                        
                        string toMacStr = crypto.ciphertext + "-" + System.BitConverter.ToString(myRijndael.Key);
                        //return System.BitConverter.ToString(myRijndael.Key);
                        byte[] toMacBytes = getByteArrayFromString(toMacStr);

                        SHA256 mySHA256 = SHA256.Create();
                        byte[] hashValue = mySHA256.ComputeHash(toMacBytes);
                        if (System.BitConverter.ToString(hashValue) ==keystore.mac)
                        {
                            isMacMatch = true;
                            decryptedStr = DecryptStringFromBytes(encryptedByte, myRijndael.Key, myRijndael.IV);
                            break;
                        }


                    }

                    if (isMacMatch)
                    {
                        return decryptedStr;
                    }
                    else
                    {
                        return "";
                    }

                }
            }
            catch (Exception e)
            {
                return e.Message;
            }
        }
       
        static byte[] getByteArrayFromString(string str)
        {
            string[] strArray = str.Split('-');
            byte[] byteArray = new byte[strArray.Length];
            for (int i = 0; i < strArray.Length; i++)
            {
                byteArray[i] = Convert.ToByte(strArray[i], 16);
            }
            return byteArray;
        }
        static byte[] EncryptStringToBytes(string plainText, byte[] Key, byte[] IV)
        {
            // Check arguments. 
            if (plainText == null || plainText.Length <= 0)
                throw new ArgumentNullException("plainText");
            if (Key == null || Key.Length <= 0)
                throw new ArgumentNullException("Key");
            if (IV == null || IV.Length <= 0)
                throw new ArgumentNullException("IV");
            byte[] encrypted;
            // Create an RijndaelManaged object 
            // with the specified key and IV. 
            using (RijndaelManaged rijAlg = new RijndaelManaged())
            {
                rijAlg.Key = Key;
                rijAlg.IV = IV;

                // Create a decryptor to perform the stream transform.
                ICryptoTransform encryptor = rijAlg.CreateEncryptor(rijAlg.Key, rijAlg.IV);

                // Create the streams used for encryption. 
                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {

                            //Write all data to the stream.
                            swEncrypt.Write(plainText);
                        }
                        encrypted = msEncrypt.ToArray();
                    }
                }
            }


            // Return the encrypted bytes from the memory stream. 
            return encrypted;

        }

        static string DecryptStringFromBytes(byte[] cipherText, byte[] Key, byte[] IV)
        {
            // Check arguments. 
            if (cipherText == null || cipherText.Length <= 0)
                throw new ArgumentNullException("cipherText");
            if (Key == null || Key.Length <= 0)
                throw new ArgumentNullException("Key");
            if (IV == null || IV.Length <= 0)
                throw new ArgumentNullException("IV");

            // Declare the string used to hold 
            // the decrypted text. 
            string plaintext = null;

            // Create an RijndaelManaged object 
            // with the specified key and IV. 
            using (RijndaelManaged rijAlg = new RijndaelManaged())
            {
                rijAlg.Key = Key;
                rijAlg.IV = IV;

                // Create a decrytor to perform the stream transform.
                ICryptoTransform decryptor = rijAlg.CreateDecryptor(rijAlg.Key, rijAlg.IV);

                // Create the streams used for decryption. 
                using (MemoryStream msDecrypt = new MemoryStream(cipherText))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                        {

                            // Read the decrypted bytes from the decrypting stream 
                            // and place them in a string.
                            plaintext = srDecrypt.ReadToEnd();
                        }
                    }
                }

            }

            return plaintext;

        }

        //Changing the active(login) key
        public async Task<string> doChangeLoginKey(Drm drm, string accountName, string newLoginPublicKey)
        {


            try
            {
                // Initialize new transaction

                Key newKey = new Key()
                {
                    key = newLoginPublicKey,
                    weight = 1

                };

                Auth newAuth = new Auth()
                {
                    threshold = 1,
                    keys = new Key[] { newKey },
                    accounts = new Account[] {
                    new Account(){
                        permission =  new PermissionLevel() {actor = accountName, permission = "active" },
                        weight = 1
                    }
                    },
                    waits = new object[] { }
                };

                var result = await drm.CreateTransaction(new DrmSharp.Api.v1.Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {

                new DrmSharp.Api.v1.Action()
                        {
                            account = "eosio",
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = accountName, permission = "owner" }
                            },
                            name = "updateauth",
                            data = new {account= accountName, permission= "active",parent="owner", auth = newAuth}
                        }
                    }
                });
                return result.ToString();


            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }

        //Actions

        //getActions
        public async Task<JObject> doGetActions(Drm drm, string accountName, int limit = 100)
        {
            try
            {
                var actions = await drm.GetActions(accountName, 0, limit);
                JObject o = JObject.FromObject(actions);
                return o;
            }
            catch (ApiErrorException e)
            {
                var response = new ErrorResponse()
                {
                    status = false,
                    message = "No actions found " + e
                };
                JObject err = JObject.FromObject(response);
                return err;
            }
        }

        // Filter the transactions
        public async Task<JObject> doFilterActions(Drm drm, string accountName, string actionType = "", string action = "", string token_name = "", string currency_name = "", int limit = 100)
        {
            try
            {
                JObject actions = await doGetActions(drm, accountName, limit);
                JArray filterAppliedActions = new JArray();
                var arr = (JArray)actions["actions"];
                //Hashtable ht = new Hashtable();
                if (actionType == "")
                {
                    filterAppliedActions = (JArray)arr.DeepClone();
                }
                else
                {
                    for (int i = 0; i < arr.Count; i++)
                    {
                        ////Hashing May be use later
                        //JArray tabContent = new JArray(arr[i]);
                        //if (!ht.ContainsKey(arr[i]["action_trace"]["trx_id"].ToString()))
                        //{
                        //    ht.Add(arr[i]["action_trace"]["trx_id"].ToString(), tabContent);
                        //}
                        //else
                        //{
                        //    tabContent = (JArray)ht[arr[i]["action_trace"]["trx_id"].ToString()];
                        //    tabContent.Add(arr[i]);
                        //    ht.Remove(arr[i]["action_trace"]["trx_id"].ToString());
                        //    ht.Add(arr[i]["action_trace"]["trx_id"].ToString(), tabContent);
                        //}
                        if (arr[i]["action_trace"]["act"]["account"].ToString() == actionType)
                        {
                            filterAppliedActions.Add(arr[i]);
                        }
                    }
                }
                // FIltering actions like create,issue etc
                arr = (JArray)filterAppliedActions.DeepClone();
                filterAppliedActions.Clear();
                if (action == "")
                {
                    filterAppliedActions = (JArray)arr.DeepClone();
                }
                else
                {
                    for (int i = 0; i < arr.Count; i++)
                    {
                        if (arr[i]["action_trace"]["act"]["name"].ToString() == action)
                        {
                            filterAppliedActions.Add(arr[i]);
                        }
                    }
                }
                // FIletering with token_name
                arr = (JArray)filterAppliedActions.DeepClone();
                filterAppliedActions.Clear();
                if (token_name == "")
                {
                    filterAppliedActions = (JArray)arr.DeepClone();
                }
                else
                {
                    for (int i = 0; i < arr.Count; i++)
                    {
                        if (arr[i]["action_trace"]["act"]["data"]["net_sale_amount"].HasValues)
                        {
                            if (arr[i]["action_trace"]["act"]["data"]["net_sale_amount"].ToString().Contains(token_name))
                            {
                                filterAppliedActions.Add(arr[i]);
                            }
                        }
                    }
                }
                // Filetering with currency
                arr = (JArray)filterAppliedActions.DeepClone();
                filterAppliedActions.Clear();
                if (currency_name == "")
                {
                    filterAppliedActions = arr;
                }
                else if (actionType == "eosio.token")
                {
                    //for (int i = 0; i < arr.Count; i++)
                    //{
                    //    //if (arr[i]["action_trace"]["act"]["data"]["net_sale_amount"]!=null)
                    //    //{
                    //        if (arr[i]["action_trace"]["act"]["data"]["net_sale_amount"].ToString().Contains(token_name))
                    //        //if(Regex.Match(arr[i]["action_trace"]["act"]["data"]["net_sale_amount"].ToString(), @".*?"+ token_name+ "$").Success)
                    //        {
                    //            filterAppliedActions.Add(arr[i]);
                    //        }
                    //    //}
                    //}
                }
                //if (arr[i]["action_trace"]["act"]["account"].ToString() == actionType)
                //    {
                //        if (arr[i]["action_trace"]["act"]["name"].ToString() == action)
                //        {
                //            if (token_name != "")
                //            {
                //                if (arr[i]["action_trace"]["act"]["data"]["token_name"].ToString() == token_name)
                //                {
                //                    filterAppliedActions.Add(arr[i]);
                //                }
                //            }
                //            else
                //            {
                //                filterAppliedActions.Add(arr[i]);
                //            }
                //        }
                //    }
                //JObject o = new JObject();
                //filterAppliedActions = (JArray)ht["af1ed2d04d42866df8909445d020945d862437b435966d68e7a65c9e13f0d306"];
                JObject obj = new JObject(new JProperty("actions", filterAppliedActions));
                return JObject.FromObject(obj);
            }
            catch (ApiErrorException e)
            {
                var response = new ErrorResponse()
                {
                    status = false,
                    message = "No actions found " + e
                };
                JObject err = JObject.FromObject(response);
                return err;
            }
        }
       




        //NFT Functionalities
        //Create NFT
        public async Task<string> doCreateToken(Drm drm, string creator, object data)
        {

            try
            {

                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = creator, permission = "active" }
                            },
                            name = "create",
                            data = data
                        }
                    }
                });
                return result.ToString();


            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }

        //Issue NFT
        public async Task<string> doIssueToken(Drm drm, string creator, object data )
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = creator, permission = "active" }
                            },
                            name = "issue",
                            data = data
                        }
                    }
                }) ;
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }


        //Burn NFT
        public async Task<string> doBurnToken(Drm drm,string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "burnnft",
                            data =data
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }

        //Transfer NFT
        public async Task<string> doTransferToken(Drm drm,string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "transfernft",
                            data = data       
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }


        //List Sale NFT
        public async Task<string> doListSaleNFT(Drm drm,string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "nftokensale",
                            data = data
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }


        //Close Sale NFT
        public async Task<string> doCloseSaleNFT(Drm drm,string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "endnftsale",
                            data = data
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }

        //License NFT
        public async Task<string> doLicenseNFT(Drm drm,string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "license",
                            data = data
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }

        //Extend NFT
        public async Task<string> doExtendNFT(Drm drm, string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "extend",
                            data = data
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }

        //Revoke NFT
        public async Task<string> doRevokeNFT(Drm drm,string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "revoke",
                            data = data
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }


        //NFT License Sale
        public async Task<string> doLicenceSale(Drm drm, string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "licencesale",
                            data = data
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }

        //Stop NFT License Sale
        public async Task<string> doEndLicenceSale(Drm drm, string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = creator,
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "endlcncsale",
                            data = data
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }

        //Buy Sale NFT
        public async Task<string> doBuyNFT(Drm drm, string creator, string auth, object data)
        {

            try
            {
                // Initialize new transaction
                var result = await drm.CreateTransaction(new Transaction()
                {
                    actions = new List<DrmSharp.Api.v1.Action>()
                    {
                        new DrmSharp.Api.v1.Action()
                        {
                            account = "eosio.token",
                            authorization = new List<PermissionLevel>()
                            {
                                new PermissionLevel() {actor = auth, permission = "active" }
                            },
                            name = "transfer",
                            data = data
                        }
                    }
                });
                return result.ToString();

            }
            catch (ApiException e)
            {
                string err = "Some error has occured";
                return err;
            }
        }

    }
}
