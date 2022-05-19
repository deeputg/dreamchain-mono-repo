﻿using Cryptography.ECDSA;
using DrmSharp;
using DrmSharp.Api.v1;
using DrmSharp.Helpers;
using DrmSharp.Providers;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DrmSharp.UnitTests
{
    [TestClass]
    public class SignUnitTests
    {
        readonly DrmConfigurator DrmConfig = null;
        DrmApi DefaultApi { get; set; }
        public SignUnitTests()
        {
            DrmConfig = new DrmConfigurator()
            {
                SignProvider = new DefaultSignProvider("5K57oSZLpfzePvQNpsLS6NfKXLhhRARNU13q6u2ZPQCGHgKLbTA"),

                //HttpEndpoint = "https://nodes.drm42.io", //Mainnet
                //ChainId = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"

                HttpEndpoint = "http://13.232.223.254:8888",
                ChainId = "0e64d141d9b3984271eaf55eda643d3a5a3f05e12ad6ab48837c54bdadbd1dfe"
            };
            DefaultApi = new DrmApi(DrmConfig, new HttpHandler());
        }

        [TestMethod]
        [TestCategory("Signature Tests")]
        public void GenerateKeyPair()
        {
            Console.WriteLine(JsonConvert.SerializeObject(CryptoHelper.GenerateKeyPair()));
        }

        [TestMethod]
        [TestCategory("Signature Tests")]
        public void VerifyKeyTypes()
        {
            var key = CryptoHelper.GenerateKeyPair();

            CryptoHelper.PrivKeyStringToBytes(key.PrivateKey);
            CryptoHelper.PubKeyStringToBytes(key.PublicKey);

            var helloBytes = Encoding.UTF8.GetBytes("Hello world!");

            var hash = Sha256Manager.GetHash(helloBytes);

            var sign = Secp256K1Manager.SignCompressedCompact(hash, CryptoHelper.GetPrivateKeyBytesWithoutCheckSum(key.PrivateKey));
            var check = new List<byte[]>() { sign, Encoding.UTF8.GetBytes("K1") };
            var checksum = Ripemd160Manager.GetHash(SerializationHelper.Combine(check)).Take(4).ToArray();
            var signAndChecksum = new List<byte[]>() { sign, checksum };

            CryptoHelper.SignStringToBytes("SIG_K1_" + Base58.Encode(SerializationHelper.Combine(signAndChecksum)));
        }

        [TestMethod]
        [TestCategory("Signature Tests")]
        public void Base64ToByteArray()
        {
            string base64EncodedData = "DmVvc2lvOjphYmkvMS4wAQxhY2NvdW50X25hbWUEbmFtZQcIdHJhbnNmZXIABARmcm9tDGFjY291bnRfbmFtZQJ0bwxhY2NvdW50X25hbWUIcXVhbnRpdHkFYXNzZXQEbWVtbwZzdHJpbmcGY3JlYXRlAAIGaXNzdWVyDGFjY291bnRfbmFtZQ5tYXhpbXVtX3N1cHBseQVhc3NldAVpc3N1ZQADAnRvDGFjY291bnRfbmFtZQhxdWFudGl0eQVhc3NldARtZW1vBnN0cmluZwZyZXRpcmUAAghxdWFudGl0eQVhc3NldARtZW1vBnN0cmluZwVjbG9zZQACBW93bmVyDGFjY291bnRfbmFtZQZzeW1ib2wGc3ltYm9sB2FjY291bnQAAQdiYWxhbmNlBWFzc2V0DmN1cnJlbmN5X3N0YXRzAAMGc3VwcGx5BWFzc2V0Cm1heF9zdXBwbHkFYXNzZXQGaXNzdWVyDGFjY291bnRfbmFtZQUAAABXLTzNzQh0cmFuc2ZlcucFIyMgVHJhbnNmZXIgVGVybXMgJiBDb25kaXRpb25zCgpJLCB7e2Zyb219fSwgY2VydGlmeSB0aGUgZm9sbG93aW5nIHRvIGJlIHRydWUgdG8gdGhlIGJlc3Qgb2YgbXkga25vd2xlZGdlOgoKMS4gSSBjZXJ0aWZ5IHRoYXQge3txdWFudGl0eX19IGlzIG5vdCB0aGUgcHJvY2VlZHMgb2YgZnJhdWR1bGVudCBvciB2aW9sZW50IGFjdGl2aXRpZXMuCjIuIEkgY2VydGlmeSB0aGF0LCB0byB0aGUgYmVzdCBvZiBteSBrbm93bGVkZ2UsIHt7dG99fSBpcyBub3Qgc3VwcG9ydGluZyBpbml0aWF0aW9uIG9mIHZpb2xlbmNlIGFnYWluc3Qgb3RoZXJzLgozLiBJIGhhdmUgZGlzY2xvc2VkIGFueSBjb250cmFjdHVhbCB0ZXJtcyAmIGNvbmRpdGlvbnMgd2l0aCByZXNwZWN0IHRvIHt7cXVhbnRpdHl9fSB0byB7e3RvfX0uCgpJIHVuZGVyc3RhbmQgdGhhdCBmdW5kcyB0cmFuc2ZlcnMgYXJlIG5vdCByZXZlcnNpYmxlIGFmdGVyIHRoZSB7e3RyYW5zYWN0aW9uLmRlbGF5fX0gc2Vjb25kcyBvciBvdGhlciBkZWxheSBhcyBjb25maWd1cmVkIGJ5IHt7ZnJvbX19J3MgcGVybWlzc2lvbnMuCgpJZiB0aGlzIGFjdGlvbiBmYWlscyB0byBiZSBpcnJldmVyc2libHkgY29uZmlybWVkIGFmdGVyIHJlY2VpdmluZyBnb29kcyBvciBzZXJ2aWNlcyBmcm9tICd7e3RvfX0nLCBJIGFncmVlIHRvIGVpdGhlciByZXR1cm4gdGhlIGdvb2RzIG9yIHNlcnZpY2VzIG9yIHJlc2VuZCB7e3F1YW50aXR5fX0gaW4gYSB0aW1lbHkgbWFubmVyLgoAAAAAAKUxdgVpc3N1ZQAAAAAAqGzURQZjcmVhdGUAAAAAAKjrsroGcmV0aXJlAAAAAAAAhWlEBWNsb3NlAAIAAAA4T00RMgNpNjQBCGN1cnJlbmN5AQZ1aW50NjQHYWNjb3VudAAAAAAAkE3GA2k2NAEIY3VycmVuY3kBBnVpbnQ2NA5jdXJyZW5jeV9zdGF0cwAAAA===";
            var base64EncodedBytes = SerializationHelper.Base64FcStringToByteArray(base64EncodedData);
        }

        [TestMethod]
        [TestCategory("Signature Tests")]
        public async Task SignProvider()
        {
            var signProvider = new DefaultSignProvider("5K57oSZLpfzePvQNpsLS6NfKXLhhRARNU13q6u2ZPQCGHgKLbTA");
            var requiredKeys = new List<string>() { "DRM8Q8CJqwnSsV4A6HDBEqmQCqpQcBnhGME1RUvydDRnswNngpqfr" };
            Assert.IsTrue((await signProvider.GetAvailableKeys()).All(ak => requiredKeys.Contains(ak)));
        }

        [TestMethod]
        [TestCategory("Signature Tests")]
        public void SignParse()
        {
            var signature = "SIG_K1_KZoEShDrNxiAQq8rYafahdudAESBAfHQxU7ihavonMDMND4jNSHhk9q4UVbs7tTLK6RidFmFmSruipEM1chyxFgN46meSF";
            var keyBytes = CryptoHelper.SignStringToBytes(signature);
        }

        [TestMethod]
        [TestCategory("Signature Tests")]
        public async Task SignHelloWorld()
        {
            var requiredKeys = new List<string>() { "DRM8Q8CJqwnSsV4A6HDBEqmQCqpQcBnhGME1RUvydDRnswNngpqfr" };
            var helloBytes = Encoding.UTF8.GetBytes("Hello world!");
            var signatures = await DrmConfig.SignProvider.Sign(DefaultApi.Config.ChainId, requiredKeys, helloBytes);
            Console.WriteLine(signatures);
            Assert.IsTrue(signatures.First() == "SIG_K1_KfANtA9vBFp3TmoDwmSNcyaJC3GBezgYNY5RTcMRPNHCoGy7hCgoikjt2xtoiw2Ezg9G9wMsVCPA1R6SqxVNTeugC3pW2H");
        }

        [TestMethod]
        [TestCategory("Signature Tests")]
        public async Task SignTransaction()
        {
            var trx = new Transaction()
            {
                // trx info
                max_net_usage_words = 0,
                max_cpu_usage_ms = 0,
                delay_sec = 0,
                context_free_actions = new List<Api.v1.Action>(),
                transaction_extensions = new List<Extension>(),
                actions = new List<Api.v1.Action>()
                {
                    new Api.v1.Action()
                    {
                        account = "eosio.token",
                        authorization = new List<PermissionLevel>()
                        {
                            new PermissionLevel() {actor = "mynewaccount", permission = "active" }
                        },
                        name = "transfer",
                        data = new { from = "mynewaccount", to = "tester112345", quantity = "1.0000 DRMC", memo = "hello crypto world!" }
                    }
                }
            };

            var abiSerializer = new AbiSerializationProvider(DefaultApi);
            var packedTrx = await abiSerializer.SerializePackedTransaction(trx);
            var requiredKeys = new List<string>() { "DRM8Q8CJqwnSsV4A6HDBEqmQCqpQcBnhGME1RUvydDRnswNngpqfr" };
            var signatures = await DrmConfig.SignProvider.Sign(DefaultApi.Config.ChainId, requiredKeys, packedTrx);
            Console.WriteLine(signatures.First().ToString());
            Assert.IsTrue(signatures.First() == "SIG_K1_Kf1igbUyig4GReYgcFbkG73bmJZPu8TTViFKujGPLHx9sBwcVUoWUSXXZAVkmyBidvsfLVJMkDoNvRYFkcaCUKDyZVCosv");
        }

        //[TestMethod]
        //[TestCategory("Signature Tests")]
        //public async Task DeserializePackedTransaction()
        //{
        //    var packed_trx = "";
        //    var abiSerializer = new AbiSerializationProvider(DefaultApi);
        //    var trx = await abiSerializer.DeserializePackedTransaction(packed_trx);
        //    Console.WriteLine(JsonConvert.SerializeObject(trx));
        //}  
    }
}
