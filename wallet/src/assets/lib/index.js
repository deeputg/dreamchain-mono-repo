'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ecc = require('./ecc');
var Fcbuffer = require('fcbuffer');
var EosApi = require('eosjs-api');
var assert = require('assert');

var Structs = require('./structs');
var AbiCache = require('./abi-cache');
var writeApiGen = require('./write-api');
var format = require('./format');
var schema = require('./schema');

var env =('../../environment.ts')

var token = require('./schema/eosio.token.abi.json');
var system = require('./schema/eosio.system.abi.json');
var eosio_null = require('./schema/eosio.null.abi.json');

var Eos = function Eos() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var configDefaults = {
    httpEndpoint: 'http://127.0.0.1:8888',
    debug: false,
    verbose: false,
    broadcast: true,
    logger: {
      log: function log() {
        var _console;

        return config.verbose ? (_console = console).log.apply(_console, arguments) : null;
      },
      error: function error() {
        var _console2;

        return config.verbose ? (_console2 = console).error.apply(_console2, arguments) : null;
      }
    },
    sign: true
  };

  function applyDefaults(target, defaults) {
    Object.keys(defaults).forEach(function (key) {
      if (target[key] === undefined) {
        target[key] = defaults[key];
      }
    });
  }

  applyDefaults(config, configDefaults);
  applyDefaults(config.logger, configDefaults.logger);
  return createEos(config);
};

module.exports = Eos;

Object.assign(Eos, {
  version: '16.0.0',
  modules: {
    format: format,
    api: EosApi,
    ecc: ecc,
    json: {
      api: EosApi.api,
      schema: schema
    },
    Fcbuffer: Fcbuffer
  },

  /** @deprecated */
  Testnet: function Testnet(config) {
    console.error('deprecated, change Eos.Testnet(..) to just Eos(..)');
    return Eos(config);
  },

  /** @deprecated */
  Localnet: function Localnet(config) {
    console.error('deprecated, change Eos.Localnet(..) to just Eos(..)');
    return Eos(config);
  }
});

function createEos(config) {
  var network = config.httpEndpoint != null ? EosApi(config) : null;
  config.network = network;

  var abis = [];
  var abiCache = AbiCache(network, config);
  abis.push(abiCache.abi('eosio.null', eosio_null));
  abis.push(abiCache.abi('eosio.token', token));
  abis.push(abiCache.abi('eosio', system));

  if (!config.chainId) {
    config.chainId = envConfig.chainId;
  }

  if (network) {
    checkChainId(network, config.chainId, config.logger);
  }

  if (config.mockTransactions != null) {
    if (typeof config.mockTransactions === 'string') {
      var mock = config.mockTransactions;
      config.mockTransactions = function () {
        return mock;
      };
    }
    assert.equal((0, _typeof3.default)(config.mockTransactions), 'function', 'config.mockTransactions');
  }

  var _Structs = Structs(config),
      structs = _Structs.structs,
      types = _Structs.types,
      fromBuffer = _Structs.fromBuffer,
      toBuffer = _Structs.toBuffer;

  var eos = mergeWriteFunctions(config, EosApi, structs, abis);

  Object.assign(eos, {
    config: safeConfig(config),
    fc: {
      structs: structs,
      types: types,
      fromBuffer: fromBuffer,
      toBuffer: toBuffer,
      abiCache: abiCache
    },
    // Repeat of static Eos.modules, help apps that use dependency injection
    modules: {
      format: format
    }
  });

  if (!config.signProvider) {
    config.signProvider = defaultSignProvider(eos, config);
  }

  return eos;
}

/**
  Set each property as read-only, read-write, no-access.  This is shallow
  in that it applies only to the root object and does not limit access
  to properties under a given object.
*/
function safeConfig(config) {
  // access control is shallow references only
  var readOnly = new Set(['httpEndpoint', 'abiCache']);
  var readWrite = new Set(['verbose', 'debug', 'broadcast', 'logger', 'sign']);
  var protectedConfig = {};

  Object.keys(config).forEach(function (key) {
    Object.defineProperty(protectedConfig, key, {
      set: function set(value) {
        if (readWrite.has(key)) {
          config[key] = value;
          return;
        }
        throw new Error('Access denied');
      },

      get: function get() {
        if (readOnly.has(key) || readWrite.has(key)) {
          return config[key];
        }
        throw new Error('Access denied');
      }
    });
  });
  return protectedConfig;
}

/**
  Merge in write functions (operations).  Tested against existing methods for
  name conflicts.

  @arg {object} config.network - read-only api calls
  @arg {object} EosApi - api[EosApi] read-only api calls
  @return {object} - read and write method calls (create and sign transactions)
  @throw {TypeError} if a funciton name conflicts
*/
function mergeWriteFunctions(config, EosApi, structs, abis) {
  var network = config.network;


  var merge = Object.assign({}, network);

  var writeApi = writeApiGen(EosApi, network, structs, config, abis);
  throwOnDuplicate(merge, writeApi, 'Conflicting methods in EosApi and Transaction Api');
  Object.assign(merge, writeApi);

  return merge;
}

function throwOnDuplicate(o1, o2, msg) {
  for (var key in o1) {
    if (o2[key]) {
      throw new TypeError(msg + ': ' + key);
    }
  }
}

/**
  The default sign provider is designed to interact with the available public
  keys (maybe just one), the transaction, and the blockchain to figure out
  the minimum set of signing keys.

  If only one key is available, the blockchain API calls are skipped and that
  key is used to sign the transaction.
*/
var defaultSignProvider = function defaultSignProvider(eos, config) {
  return function _callee(_ref) {
    var sign = _ref.sign,
        buf = _ref.buf,
        transaction = _ref.transaction,
        optionsKeyProvider = _ref.optionsKeyProvider;

    var keyProvider, keys, pvt, sigs, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key, keyMap, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _key, isPrivate, isPublic, pubkeys;

    return _regenerator2.default.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // optionsKeyProvider is a per-action key: await eos.someAction('user2' .., {keyProvider: privateKey2})
            keyProvider = optionsKeyProvider ? optionsKeyProvider : config.keyProvider;

            if (keyProvider) {
              _context.next = 3;
              break;
            }

            throw new TypeError('This transaction requires a keyProvider for signing');

          case 3:
            keys = keyProvider;

            if (typeof keyProvider === 'function') {
              keys = keyProvider({ transaction: transaction });
            }

            // keyProvider may return keys or Promise<keys>
            _context.next = 7;
            return _regenerator2.default.awrap(Promise.resolve(keys));

          case 7:
            keys = _context.sent;


            if (!Array.isArray(keys)) {
              keys = [keys];
            }

            keys = keys.map(function (key) {
              try {
                // normalize format (WIF => PVT_K1_base58privateKey)
                return { private: ecc.PrivateKey(key).toString() };
              } catch (e) {
                // normalize format (EOSKey => PUB_K1_base58publicKey)
                return { public: ecc.PublicKey(key).toString() };
              }
              assert(false, 'expecting public or private keys from keyProvider');
            });

            if (keys.length) {
              _context.next = 12;
              break;
            }

            throw new Error('missing key, check your keyProvider');

          case 12:
            if (!(keys.length === 1 && keys[0].private)) {
              _context.next = 15;
              break;
            }

            pvt = keys[0].private;
            return _context.abrupt('return', sign(buf, pvt));

          case 15:
            if (!(config.httpEndpoint == null)) {
              _context.next = 37;
              break;
            }

            sigs = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 20;

            for (_iterator = keys[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              key = _step.value;

              sigs.push(sign(buf, key.private));
            }
            _context.next = 28;
            break;

          case 24:
            _context.prev = 24;
            _context.t0 = _context['catch'](20);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 28:
            _context.prev = 28;
            _context.prev = 29;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 31:
            _context.prev = 31;

            if (!_didIteratorError) {
              _context.next = 34;
              break;
            }

            throw _iteratorError;

          case 34:
            return _context.finish(31);

          case 35:
            return _context.finish(28);

          case 36:
            return _context.abrupt('return', sigs);

          case 37:
            keyMap = new Map();

            // keys are either public or private keys

            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 41;
            for (_iterator2 = keys[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              _key = _step2.value;
              isPrivate = _key.private != null;
              isPublic = _key.public != null;


              if (isPrivate) {
                keyMap.set(ecc.privateToPublic(_key.private), _key.private);
              } else {
                keyMap.set(_key.public, null);
              }
            }

            _context.next = 49;
            break;

          case 45:
            _context.prev = 45;
            _context.t1 = _context['catch'](41);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t1;

          case 49:
            _context.prev = 49;
            _context.prev = 50;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 52:
            _context.prev = 52;

            if (!_didIteratorError2) {
              _context.next = 55;
              break;
            }

            throw _iteratorError2;

          case 55:
            return _context.finish(52);

          case 56:
            return _context.finish(49);

          case 57:
            pubkeys = Array.from(keyMap.keys());
            return _context.abrupt('return', eos.getRequiredKeys(transaction, pubkeys).then(function (_ref2) {
              var required_keys = _ref2.required_keys;

              if (!required_keys.length) {
                throw new Error('missing required keys for ' + JSON.stringify(transaction));
              }

              var pvts = [],
                  missingKeys = [];

              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = required_keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var requiredKey = _step3.value;

                  // normalize (EOSKey.. => PUB_K1_Key..)
                  requiredKey = ecc.PublicKey(requiredKey).toString();

                  var wif = keyMap.get(requiredKey);
                  if (wif) {
                    pvts.push(wif);
                  } else {
                    missingKeys.push(requiredKey);
                  }
                }
              } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                  }
                } finally {
                  if (_didIteratorError3) {
                    throw _iteratorError3;
                  }
                }
              }

              if (missingKeys.length !== 0) {
                assert(typeof keyProvider === 'function', 'keyProvider function is needed for private key lookup');

                // const pubkeys = missingKeys.map(key => ecc.PublicKey(key).toStringLegacy())
                keyProvider({ pubkeys: missingKeys }).forEach(function (pvt) {
                  pvts.push(pvt);
                });
              }

              var sigs = [];
              var _iteratorNormalCompletion4 = true;
              var _didIteratorError4 = false;
              var _iteratorError4 = undefined;

              try {
                for (var _iterator4 = pvts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                  var _pvt = _step4.value;

                  sigs.push(sign(buf, _pvt));
                }
              } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                  }
                } finally {
                  if (_didIteratorError4) {
                    throw _iteratorError4;
                  }
                }
              }

              return sigs;
            }));

          case 59:
          case 'end':
            return _context.stop();
        }
      }
    }, null, this, [[20, 24, 28, 36], [29,, 31, 35], [41, 45, 49, 57], [50,, 52, 56]]);
  };
};

function checkChainId(network, chainId, logger) {
  network.getInfo({}).then(function (info) {
    if (info.chain_id !== chainId) {
      if (logger.log) {
        logger.log('chainId mismatch, signatures will not match transaction authority. ' + ('expected ' + chainId + ' !== actual ' + info.chain_id));
      }
    }
  }).catch(function (error) {
    if (logger.error) {
      logger.error('Warning, unable to validate chainId: ' + error.message);
    }
  });
}
