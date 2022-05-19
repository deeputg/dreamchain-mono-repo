using Cryptography.ECDSA;
using DrmSharp;
using DrmSharp.Api.v1;
using DrmSharp.Helpers;
using DrmSharp.Interfaces;
using DrmSharp.Providers;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DrmSharp.UnitTests
{
    [TestClass]
    public class MultisigUnitTests
    {
        DrmUnitTestCases DrmUnitTestCases;
        public MultisigUnitTests()
        {
            var drmConfig = new DrmConfigurator()
            {
                SignProvider = new CombinedSignersProvider(new List<ISignProvider>() {
                    new DefaultSignProvider("5JdhoefdnzVokVJJXiEqzjNDrfVZxavqWNBnQngRmd6Qc6yRTiY"),
                    new DefaultSignProvider("5K57oSZLpfzePvQNpsLS6NfKXLhhRARNU13q6u2ZPQCGHgKLbTA")
                }),

                //HttpEndpoint = "https://nodes.drm42.io", //Mainnet
                //ChainId = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"

                HttpEndpoint = "http://13.232.223.254:8888",
                ChainId = "0e64d141d9b3984271eaf55eda643d3a5a3f05e12ad6ab48837c54bdadbd1dfe"

                //HttpEndpoint = "http://localhost:8888",
                //ChainId = "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
            };
            DrmUnitTestCases = new DrmUnitTestCases(new Drm(drmConfig));
        }

        [TestMethod]
        [TestCategory("Multisig Tests")]
        public async Task CreateTransaction2ProvidersAsync()
        {
            bool success = false;
            try
            {
                await DrmUnitTestCases.CreateTransaction2Providers();
                success = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
            }

            Assert.IsTrue(success);
        }  
    }
}
