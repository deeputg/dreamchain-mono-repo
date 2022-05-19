using DrmSharp;
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
    public class StressUnitTests
    {
        Drm Drm { get; set; }
        public StressUnitTests()
        {
            Drm = new Drm(new DrmConfigurator()
            {
                SignProvider = new DefaultSignProvider("5K57oSZLpfzePvQNpsLS6NfKXLhhRARNU13q6u2ZPQCGHgKLbTA"),

                HttpEndpoint = "https://api.drmsweden.se", //Mainnet
                ChainId = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"

                //HttpEndpoint = "https://noddrm01.btuga.io",
                //ChainId = "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f"
            });
        }

        [TestMethod]
        [TestCategory("Stress Tests")]
        public async Task GetBlockTaskLoop()
        {
            bool success = false;
            int nrTasks = 50;
            int nrBlocks = 1000;
            int blockStartPos = 100;
            int taskBlocks = nrBlocks / nrTasks;

            try
            {
                List<Task> tasks = new List<Task>();

                for (int i = 0; i < nrTasks; i++)
                {
                    tasks.Add(Task.Factory.StartNew(async (taskIdObj) =>
                    {
                        int taskId = taskIdObj as int? ?? 0;
                        for (int j = 1; j <= taskBlocks; j++)
                        {
                            try
                            {
                                await Drm.GetBlock((taskId * taskBlocks + blockStartPos + j).ToString());
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(JsonConvert.SerializeObject(ex));
                            }
                        }
                    }, i).Unwrap());
                }

                await Task.WhenAll(tasks.ToArray());

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
