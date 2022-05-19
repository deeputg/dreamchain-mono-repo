




// Auto Generated, do not edit.
using DrmSharp;
using DrmSharp.Api.v1;
using DrmSharp.Interfaces;
using DrmSharp.Providers;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace DrmSharp.UnitTests
{
    [TestClass]
    public class DrmUnitTests
    {
        DrmUnitTestCases DrmUnitTestCases;
        public DrmUnitTests()
        {
            var drmConfig = new DrmConfigurator()
            {
                SignProvider = new CombinedSignersProvider(new System.Collections.Generic.List<ISignProvider>() {
                    new DefaultSignProvider("5JdhoefdnzVokVJJXiEqzjNDrfVZxavqWNBnQngRmd6Qc6yRTiY"),
                    new DefaultSignProvider("5KNDEe2EJsFKfav33sBTQ21t4WFd8iTZqSt9dRymWeffCMuG2kR")
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
        [TestCategory("Drm Tests")]
        public async Task GetBlock()
        {
            bool success = false;
            try
            {
                await DrmUnitTestCases.GetBlock();
                success = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
            }

            Assert.IsTrue(success);
        }

		[TestMethod]
        [TestCategory("Drm Tests")]
        public async Task GetTableRows()
        {
            bool success = false;
            try
            {
                await DrmUnitTestCases.GetTableRows();
                success = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
            }

            Assert.IsTrue(success);
        }

		[TestMethod]
        [TestCategory("Drm Tests")]
        public async Task GetTableRowsGeneric()
        {
            bool success = false;
            try
            {
                await DrmUnitTestCases.GetTableRowsGeneric();
                success = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
            }

            Assert.IsTrue(success);
        }

		[TestMethod]
        [TestCategory("Drm Tests")]
        public async Task GetProducers()
        {
            bool success = false;
            try
            {
                await DrmUnitTestCases.GetProducers();
                success = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
            }

            Assert.IsTrue(success);
        }

		[TestMethod]
        [TestCategory("Drm Tests")]
        public async Task GetScheduledTransactions()
        {
            bool success = false;
            try
            {
                await DrmUnitTestCases.GetScheduledTransactions();
                success = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
            }

            Assert.IsTrue(success);
        }

		//[TestMethod]
  //      [TestCategory("Drm Tests")]
  //      public async Task CreateTransactionArrayData()
  //      {
  //          bool success = false;
  //          try
  //          {
  //              await DrmUnitTestCases.CreateTransactionArrayData();
  //              success = true;
  //          }
  //          catch (Exception ex)
  //          {
  //              Console.WriteLine(JsonConvert.SerializeObject(ex));
  //          }

  //          Assert.IsTrue(success);
  //      }

		//[TestMethod]
  //      [TestCategory("Drm Tests")]
  //      public async Task CreateTransactionActionArrayStructData()
  //      {
  //          bool success = false;
  //          try
  //          {
  //              await DrmUnitTestCases.CreateTransactionActionArrayStructData();
  //              success = true;
  //          }
  //          catch (Exception ex)
  //          {
  //              Console.WriteLine(JsonConvert.SerializeObject(ex));
  //          }

  //          Assert.IsTrue(success);
  //      }

		//[TestMethod]
  //      [TestCategory("Drm Tests")]
  //      public async Task CreateTransactionAnonymousObjectData()
  //      {
  //          bool success = false;
  //          try
  //          {
  //              await DrmUnitTestCases.CreateTransactionAnonymousObjectData();
  //              success = true;
  //          }
  //          catch (Exception ex)
  //          {
  //              Console.WriteLine(JsonConvert.SerializeObject(ex));
  //          }

  //          Assert.IsTrue(success);
  //      }

		[TestMethod]
        [TestCategory("Drm Tests")]
        public async Task CreateTransaction()
        {
            bool success = false;
            try
            {
                await DrmUnitTestCases.CreateTransaction();
                success = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(JsonConvert.SerializeObject(ex));
            }

            Assert.IsTrue(success);
        }

		[TestMethod]
        [TestCategory("Drm Tests")]
        public async Task CreateNewAccount()
        {
            bool success = false;
            try
            {
                await DrmUnitTestCases.CreateNewAccount();
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