using DrmSharp;
using DrmSharp.Api.v1;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DrmSharp.UnitTests
{
    public class DrmUnitTestCases
    {
        DrmBase Drm { get; set; }
        public DrmUnitTestCases(DrmBase drm)
        {
            Drm = drm;
        }

        public Task GetBlock()
        {
            return Drm.GetBlock("500744");
        }

        public Task GetTableRows()
        {
            return Drm.GetTableRows(new GetTableRowsRequest()
            {
                json = false,
                code = "eosio.token",
                scope = "eosio",
                table = "stat"
            });
        }

        [Serializable]
        class Stat
        {
            public string issuer { get; set; }
            public string max_supply { get; set; }
            public string supply { get; set; }
        }

        public Task GetTableRowsGeneric()
        {
            return Drm.GetTableRows<Stat>(new GetTableRowsRequest()
            {
                json = true,
                code = "eosio.token",
                scope = "eosio",
                table = "stat"
            });
        }

        public Task GetProducers()
        {
            return Drm.GetProducers(new GetProducersRequest()
            {
                json = true
            });
        }

        public Task GetScheduledTransactions()
        {
            return Drm.GetScheduledTransactions(new GetScheduledTransactionsRequest()
            {
                json = false
            });
        }

        public Task CreateTransactionArrayData()
        {
            return Drm.CreateTransaction(new Transaction()
            {
                actions = new List<Api.v1.Action>()
                {
                    new Api.v1.Action()
                    {
                        account = "eosio.token",
                        authorization = new List<PermissionLevel>()
                        {
                            new PermissionLevel() {actor = "testers12345", permission = "active" }
                        },
                        name = "testarr",
                        data = new { user = "testers12345", array = new List<UInt64>() { 1, 6, 3} }
                        //data = new { user = "testers12345", array = new UInt64[] { 1, 6, 3} }
                        //data = new { user = "testers12345", array = new Queue<UInt64>(new UInt64[] { 1, 6, 3}) }
                        //data = new { user = "testers12345", array = new Stack<UInt64>(new UInt64[] { 1, 6, 3}) }
                        //data = new { user = "testers12345", array = new ArrayList() { 1, 6, 3} }
                    }
                }
            });
        }

        public Task CreateTransactionActionArrayStructData()
        {
            var args = new List<object>()
            { 
                {
                    new Dictionary<string, object>()
                    {
                        { "air_id", Convert.ToUInt64("8") },
                        { "air_place", Convert.ToString("监测点8888") },
                        { "air_pm2_5", Convert.ToString("pm2.5数值") },
                        { "air_voc", Convert.ToString("voc数值") },
                        { "air_carbon", Convert.ToString("碳数值") },
                        { "air_nitrogen", Convert.ToString("氮数值") },
                        { "air_sulfur", Convert.ToString("硫数值") },
                        { "air_longitude", Convert.ToString("经度") },
                        { "air_latitude", Convert.ToString("纬度") }
                    }
                }
            };

            return Drm.CreateTransaction(new Transaction()
            {
                actions = new List<Api.v1.Action>()
                {
                    new Api.v1.Action()
                    {
                        account = "eosio.token",
                        authorization = new List<PermissionLevel>()
                        {
                            new PermissionLevel() {actor = "testers12345", permission = "active" }
                        },
                        name = "tester112345",
                        data = new {
                            aql = args,
                            a = args,
                            b = args
                        }
                    }
                }
            });
        }

        public Task CreateTransactionAnonymousObjectData()
        {
            return Drm.CreateTransaction(new Transaction()
            {
                actions = new List<Api.v1.Action>()
                {
                    new Api.v1.Action()
                    {
                        account = "eosio.token",
                        authorization = new List<PermissionLevel>()
                        {
                            new PermissionLevel() {actor = "testers12345", permission = "active" }
                        },
                        name = "transfer",
                        data = new { from = "testers12345", to = "tester212345", quantity = "0.0001 drm", memo = "hello crypto world!" }
                    }
                }
            });
        }

        public Task CreateTransaction()
        {
            return Drm.CreateTransaction(new Transaction()
            {
                actions = new List<Api.v1.Action>()
                {
                    new Api.v1.Action()
                    {
                        account = "eosio.token",
                        authorization = new List<PermissionLevel>()
                        {
                            new PermissionLevel() {actor = "testers12345", permission = "active" }
                        },
                        name = "transfer",
                        data = new Dictionary<string, string>()
                        {
                            { "from", "testers12345" },
                            { "to", "tester112345" },
                            { "quantity", "0.0001 DRMC" },
                            { "memo", "hello crypto world!" }
                        }
                    }
                }
            });
        }

        public Task CreateNewAccount()
        {
            return Drm.CreateTransaction(new Transaction()
            {
                actions = new List<Api.v1.Action>()
                {
                    new Api.v1.Action()
                    {
                        account = "eosio",
                        authorization = new List<PermissionLevel>()
                        {
                            new PermissionLevel() {actor = "testers12345", permission = "active"}
                        },
                        name = "newaccount",
                        data = new Dictionary<string, object>() {
                            { "creator", "testers12345" },
                            { "name", "newaccount13" },
                            { "owner", new Dictionary<string, object>() {
                                { "threshold", 1 },
                                { "keys", new List<object>() {
                                    new Dictionary<string, object>() {
                                        { "key", "DRM8Q8CJqwnSsV4A6HDBEqmQCqpQcBnhGME1RUvydDRnswNngpqfr" },
                                        { "weight", 1}
                                    }
                                }},
                                { "accounts", new List<object>() },
                                { "waits", new List<object>() }
                            }},
                            { "active", new Dictionary<string, object>() {
                                { "threshold", 1 },
                                { "keys", new List<object>() {
                                    new Dictionary<string, object>() {
                                        { "key", "DRM8Q8CJqwnSsV4A6HDBEqmQCqpQcBnhGME1RUvydDRnswNngpqfr" },
                                        { "weight", 1}
                                    }
                                }},
                                { "accounts",  new List<object>() },
                                { "waits", new List<object>() }
                            }}
                        }
                    },
                    new Api.v1.Action()
                    {
                        account = "eosio",
                        authorization = new List<PermissionLevel>()
                        {
                            new PermissionLevel() { actor = "testers12345", permission = "active"}
                        },
                        name = "buyrambytes",
                        data = new Dictionary<string, object>() {
                            { "payer", "testers12345" },
                            { "receiver", "newaccount13" },
                            { "bytes", 8192 },
                        }
                    },
                    new Api.v1.Action()
                    {
                        account = "eosio",
                        authorization = new List<PermissionLevel>()
                        {
                            new PermissionLevel() { actor = "testers12345", permission = "active"}
                        },
                        name = "delegatebw",
                        data = new Dictionary<string, object>() {
                            { "from", "testers12345" },
                            { "receiver", "mynewaccount" },
                            { "stake_net_quantity", "1.0000 DRMC" },
                            { "stake_cpu_quantity", "1.0000 DRMC" },
                            { "transfer", false },
                        }
                    }
                }
            });
        }

        public Task CreateTransaction2Providers()
        {
            return Drm.CreateTransaction(new Transaction()
            {
                actions = new List<Api.v1.Action>()
                {
                    new Api.v1.Action()
                    {
                        account = "eosio.token",
                        authorization = new List<PermissionLevel>()
                        {
                            new PermissionLevel() {actor = "tester112345", permission = "active" },
                            new PermissionLevel() {actor = "tester212345", permission = "active" }
                        },
                        name = "transfer",
                        data = new Dictionary<string, string>()
                        {
                            { "from", "tester112345" },
                            { "to", "tester212345" },
                            { "quantity", "0.0001 DRMC" },
                            { "memo", "hello crypto world! lt1 to lt2" }
                        }
                    }
                }
            });
        }
    }
}
