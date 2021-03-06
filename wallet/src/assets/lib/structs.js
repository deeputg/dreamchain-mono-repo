'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('eosjs-ecc'),
    Signature = _require.Signature,
    PublicKey = _require.PublicKey;

var Fcbuffer = require('fcbuffer');
var ByteBuffer = require('bytebuffer');
var assert = require('assert');

var schema = require('./schema');

var _require2 = require('./format'),
    isName = _require2.isName,
    encodeName = _require2.encodeName,
    decodeName = _require2.decodeName,
    DecimalPad = _require2.DecimalPad,
    DecimalImply = _require2.DecimalImply,
    DecimalUnimply = _require2.DecimalUnimply,
    printAsset = _require2.printAsset,
    parseAsset = _require2.parseAsset;

/** Configures Fcbuffer for EOS specific structs and types. */


module.exports = function() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var extendedSchema = arguments[1];

    var structLookup = function structLookup(lookupName, account) {
        var cache = config.abiCache.abi(account);

        // Lookup by ABI action "name"
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = cache.abi.actions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var action = _step.value;

                if (action.name === lookupName) {
                    var _struct = cache.structs[action.type];
                    if (_struct != null) {
                        return _struct;
                    }
                }
            }

            // Lookup struct by "type"
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        var struct = cache.structs[lookupName];
        if (struct != null) {
            return struct;
        }

        throw new Error('Missing ABI action: ' + lookupName);
    };

    // If nodeos does not have an ABI setup for a certain action.type, it will throw
    // an error: `Invalid cast from object_type to string` .. forceActionDataHex
    // may be used to until native ABI is added or fixed.
    var forceActionDataHex = config.forceActionDataHex != null ? config.forceActionDataHex : true;

    var override = Object.assign({}, authorityOverride(config), abiOverride(structLookup), wasmCodeOverride(config), actionDataOverride(structLookup, forceActionDataHex), config.override);

    var eosTypes = {
        name: function name() {
            return [Name];
        },
        public_key: function public_key() {
            return [variant(PublicKeyEcc)];
        },

        symbol: function symbol() {
            return [_Symbol];
        },
        symbol_code: function symbol_code() {
            return [SymbolCode];
        },
        extended_symbol: function extended_symbol() {
            return [ExtendedSymbol];
        },

        asset: function asset() {
            return [Asset];
        }, // After Symbol: amount, precision, symbol, contract
        extended_asset: function extended_asset() {
            return [ExtendedAsset];
        }, // After Asset: amount, precision, symbol, contract

        signature: function signature() {
            return [variant(SignatureType)];
        }
    };

    var customTypes = Object.assign({}, eosTypes, config.customTypes);
    config = Object.assign({ override: override }, { customTypes: customTypes }, config);

    // Do not sort transaction actions
    config.sort = Object.assign({}, config.sort);
    config.sort['action.authorization'] = true;
    config.sort['signed_transaction.signature'] = true;
    config.sort['authority.accounts'] = true;
    config.sort['authority.keys'] = true;

    var fullSchema = Object.assign({}, schema, extendedSchema);

    var _Fcbuffer = Fcbuffer(fullSchema, config),
        structs = _Fcbuffer.structs,
        types = _Fcbuffer.types,
        errors = _Fcbuffer.errors,
        fromBuffer = _Fcbuffer.fromBuffer,
        toBuffer = _Fcbuffer.toBuffer;

    if (errors.length !== 0) {
        throw new Error(JSON.stringify(errors, null, 4));
    }

    return { structs: structs, types: types, fromBuffer: fromBuffer, toBuffer: toBuffer };
};

/**
  Name eos::types native.hpp
*/
var Name = function Name(validation) {
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var n = decodeName(b.readUint64(), false); // b is already in littleEndian
            // if(validation.debug) {
            //   console.error(`${n}`, '(Name.fromByteBuffer)')
            // }
            return n;
        },
        appendByteBuffer: function appendByteBuffer(b, value) {
            // if(validation.debug) {
            //   console.error(`${value}`, (Name.appendByteBuffer))
            // }
            b.writeUint64(encodeName(value, false)); // b is already in littleEndian
        },
        fromObject: function fromObject(value) {
            return value;
        },
        toObject: function toObject(value) {
            if (validation.defaults && value == null) {
                return '';
            }
            return value;
        }
    };
};

/**
  A variant is like having a version of an object.  A varint comes
  first and identifies which type of object this is.

  @arg {Array} variantArray array of types
*/
var variant = function variant() {
    for (var _len = arguments.length, variantArray = Array(_len), _key = 0; _key < _len; _key++) {
        variantArray[_key] = arguments[_key];
    }

    return function(validation, baseTypes, customTypes) {
        var variants = variantArray.map(function(Type) {
            return Type(validation, baseTypes, customTypes);
        });
        var staticVariant = baseTypes.static_variant(variants);

        return {
            fromByteBuffer: function fromByteBuffer(b) {
                return staticVariant.fromByteBuffer(b);
            },
            appendByteBuffer: function appendByteBuffer(b, value) {
                if (!Array.isArray(value)) {
                    value = [0, value];
                }
                staticVariant.appendByteBuffer(b, value);
            },
            fromObject: function fromObject(value) {
                if (!Array.isArray(value)) {
                    value = [0, value];
                }
                return staticVariant.fromObject(value)[1];
            },
            toObject: function toObject(value) {
                if (!Array.isArray(value)) {
                    value = [0, value];
                }
                return staticVariant.toObject(value)[1];
            }
        };
    };
};

var PublicKeyEcc = function PublicKeyEcc(validation) {
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var bcopy = b.copy(b.offset, b.offset + 33);
            b.skip(33);
            var pubbuf = Buffer.from(bcopy.toBinary(), 'binary');
            return PublicKey.fromBuffer(pubbuf).toString(validation.keyPrefix);
        },
        appendByteBuffer: function appendByteBuffer(b, value) {
            // if(validation.debug) {
            //   console.error(`${value}`, 'PublicKeyType.appendByteBuffer')
            // }
            var buf = PublicKey.fromStringOrThrow(value, validation.keyPrefix).toBuffer();
            b.append(buf.toString('binary'), 'binary');
        },
        fromObject: function fromObject(value) {
            return value;
        },
        toObject: function toObject(value) {
            if (validation.defaults && value == null) {
                var keyPrefix = validation.keyPrefix ? validation.keyPrefix : 'DRC';
                return keyPrefix + '6MRy..';
            }
            return value;
        }
    };
};

/**
  Internal: precision, symbol
  External: symbol
  @example 'SYS'
*/
var _Symbol = function _Symbol(validation) {
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var bcopy = b.copy(b.offset, b.offset + 8);
            b.skip(8);

            var precision = bcopy.readUint8();
            var bin = bcopy.toBinary();

            var symbol = '';
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = bin[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var code = _step2.value;

                    if (code == '\0') {
                        break;
                    }
                    symbol += code;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return precision + ',' + symbol;
        },
        appendByteBuffer: function appendByteBuffer(b, value) {
            var _parseAsset = parseAsset(value),
                symbol = _parseAsset.symbol,
                precision = _parseAsset.precision;

            assert(precision != null, 'Precision unknown for symbol: ' + value);
            var pad = '\0'.repeat(7 - symbol.length);
            b.append(String.fromCharCode(precision) + symbol + pad);
        },
        fromObject: function fromObject(value) {
            assert(value != null, 'Symbol is required: ' + value);

            var _parseAsset2 = parseAsset(value),
                symbol = _parseAsset2.symbol,
                precision = _parseAsset2.precision;

            if (precision == null) {
                return symbol;
            } else {
                // Internal object, this can have the precision prefix
                return precision + ',' + symbol;
            }
        },
        toObject: function toObject(value) {
            if (validation.defaults && value == null) {
                return 'SYS';
            }
            // symbol only (without precision prefix)
            return parseAsset(value).symbol;
        }
    };
};

/** Symbol type without the precision */
var SymbolCode = function SymbolCode(validation) {
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var bcopy = b.copy(b.offset, b.offset + 8);
            b.skip(8);

            var bin = bcopy.toBinary();

            var symbol = '';
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = bin[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var code = _step3.value;

                    if (code == '\0') {
                        break;
                    }
                    symbol += code;
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

            return '' + symbol;
        },
        appendByteBuffer: function appendByteBuffer(b, value) {
            var _parseAsset3 = parseAsset(value),
                symbol = _parseAsset3.symbol;

            var pad = '\0'.repeat(8 - symbol.length);
            b.append(symbol + pad);
        },
        fromObject: function fromObject(value) {
            assert(value != null, 'Symbol is required: ' + value);

            var _parseAsset4 = parseAsset(value),
                symbol = _parseAsset4.symbol;

            return symbol;
        },
        toObject: function toObject(value) {
            if (validation.defaults && value == null) {
                return 'SYS';
            }
            return parseAsset(value).symbol;
        }
    };
};

/**
  Internal: precision, symbol, contract
  External: symbol, contract
  @example 'SYS@contract'
*/
var ExtendedSymbol = function ExtendedSymbol(validation, baseTypes, customTypes) {
    var symbolType = customTypes.symbol(validation);
    var contractName = customTypes.name(validation);

    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var symbol = symbolType.fromByteBuffer(b);
            var contract = contractName.fromByteBuffer(b);
            return symbol + '@' + contract;
        },
        appendByteBuffer: function appendByteBuffer(b, value) {
            assert.equal(typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value), 'string', 'Invalid extended symbol: ' + value);

            var _value$split = value.split('@'),
                _value$split2 = (0, _slicedToArray3.default)(_value$split, 2),
                symbol = _value$split2[0],
                contract = _value$split2[1];

            assert(contract != null, 'Missing @contract suffix in extended symbol: ' + value);

            symbolType.appendByteBuffer(b, symbol);
            contractName.appendByteBuffer(b, contract);
        },
        fromObject: function fromObject(value) {
            return value;
        },
        toObject: function toObject(value) {
            if (validation.defaults && value == null) {
                return 'SYS@contract';
            }
            return value;
        }
    };
};

/**
  Internal: amount, precision, symbol, contract
  @example '1.0000 SYS'
*/
var Asset = function Asset(validation, baseTypes, customTypes) {
    var amountType = baseTypes.int64(validation);
    var symbolType = customTypes.symbol(validation);

    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var amount = amountType.fromByteBuffer(b);
            assert(amount != null, 'amount');

            var sym = symbolType.fromByteBuffer(b);

            var _parseAsset5 = parseAsset('' + sym),
                precision = _parseAsset5.precision,
                symbol = _parseAsset5.symbol;

            assert(precision != null, 'precision');
            assert(symbol != null, 'symbol');

            return DecimalUnimply(amount, precision) + ' ' + symbol;
        },
        appendByteBuffer: function appendByteBuffer(b, value) {
            var _parseAsset6 = parseAsset(value),
                amount = _parseAsset6.amount,
                precision = _parseAsset6.precision,
                symbol = _parseAsset6.symbol;

            assert(amount != null, 'amount');
            assert(precision != null, 'precision');
            assert(symbol != null, 'symbol');

            amountType.appendByteBuffer(b, DecimalImply(amount, precision));
            symbolType.appendByteBuffer(b, precision + ',' + symbol);
        },
        fromObject: function fromObject(value) {
            var _parseAsset7 = parseAsset(value),
                amount = _parseAsset7.amount,
                precision = _parseAsset7.precision,
                symbol = _parseAsset7.symbol;

            assert(amount != null, 'amount');
            assert(precision != null, 'precision');
            assert(symbol != null, 'symbol');

            return DecimalPad(amount, precision) + ' ' + symbol;
        },
        toObject: function toObject(value) {
            if (validation.defaults && value == null) {
                return '0.0001 SYS';
            }

            var _parseAsset8 = parseAsset(value),
                amount = _parseAsset8.amount,
                precision = _parseAsset8.precision,
                symbol = _parseAsset8.symbol;

            assert(amount != null, 'amount');
            assert(precision != null, 'precision');
            assert(symbol != null, 'symbol');

            return DecimalPad(amount, precision) + ' ' + symbol;
        }
    };
};

/**
  @example '1.0000 SYS@contract'
*/
var ExtendedAsset = function ExtendedAsset(validation, baseTypes, customTypes) {
    var assetType = customTypes.asset(validation);
    var contractName = customTypes.name(validation);

    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var asset = assetType.fromByteBuffer(b);
            var contract = contractName.fromByteBuffer(b);
            return parseAsset(asset + '@' + contract);
        },
        appendByteBuffer: function appendByteBuffer(b, value) {
            assert.equal(typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value), 'object', 'expecting extended_asset object, got ' + (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)));

            var asset = printAsset(value);

            var _asset$split = asset.split('@'),
                _asset$split2 = (0, _slicedToArray3.default)(_asset$split, 2),
                contract = _asset$split2[1];

            assert.equal(typeof contract === 'undefined' ? 'undefined' : (0, _typeof3.default)(contract), 'string', 'Invalid extended asset: ' + value);

            // asset includes contract (assetType needs this)
            assetType.appendByteBuffer(b, asset);
            contractName.appendByteBuffer(b, contract);
        },
        fromObject: function fromObject(value) {
            // like: 1.0000 SYS@contract or 1 SYS@contract
            var asset = {};
            if (typeof value === 'string') {
                Object.assign(asset, parseAsset(value));
            } else if ((typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
                Object.assign(asset, value);
            } else {
                assert(false, 'expecting extended_asset<object|string>, got: ' + (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)));
            }

            var amount = asset.amount,
                precision = asset.precision,
                symbol = asset.symbol,
                contract = asset.contract;

            assert(amount != null, 'missing amount');
            assert(precision != null, 'missing precision');
            assert(symbol != null, 'missing symbol');
            assert(contract != null, 'missing contract');

            return { amount: amount, precision: precision, symbol: symbol, contract: contract };
        },
        toObject: function toObject(value) {
            if (validation.defaults && value == null) {
                return {
                    amount: '1.0000',
                    precision: 4,
                    symbol: 'SYS',
                    contract: 'eosio.token'
                };
            }

            assert.equal(typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value), 'object', 'expecting extended_asset object');
            var amount = value.amount,
                precision = value.precision,
                symbol = value.symbol,
                contract = value.contract;


            return {
                amount: DecimalPad(amount, precision),
                precision: precision,
                symbol: symbol,
                contract: contract
            };
        }
    };
};

var SignatureType = function SignatureType(validation, baseTypes) {
    var signatureType = baseTypes.fixed_bytes65(validation);
    return {
        fromByteBuffer: function fromByteBuffer(b) {
            var signatureBuffer = signatureType.fromByteBuffer(b);
            var signature = Signature.from(signatureBuffer);
            return signature.toString();
        },
        appendByteBuffer: function appendByteBuffer(b, value) {
            var signature = Signature.from(value);
            signatureType.appendByteBuffer(b, signature.toBuffer());
        },
        fromObject: function fromObject(value) {
            var signature = Signature.from(value);
            return signature.toString();
        },
        toObject: function toObject(value) {
            if (validation.defaults && value == null) {
                return 'SIG_K1_bas58signature..';
            }
            var signature = Signature.from(value);
            return signature.toString();
        }
    };
};

var authorityOverride = function authorityOverride(config) {
    return {
        /** shorthand `EOS6MRyAj..` */
        'authority.fromObject': function authorityFromObject(value) {
            if (PublicKey.fromString(value, config.keyPrefix)) {
                return {
                    threshold: 1,
                    keys: [{ key: value, weight: 1 }]
                };
            }
            if (typeof value === 'string') {
                var _value$split3 = value.split('@'),
                    _value$split4 = (0, _slicedToArray3.default)(_value$split3, 2),
                    account = _value$split4[0],
                    _value$split4$ = _value$split4[1],
                    permission = _value$split4$ === undefined ? 'active' : _value$split4$;

                return {
                    threshold: 1,
                    accounts: [{
                        permission: {
                            actor: account,
                            permission: permission
                        },
                        weight: 1
                    }]
                };
            }
        }
    };
};

var abiOverride = function abiOverride(structLookup) {
    return {
        'abi_def.fromObject': function abi_defFromObject(value) {
            if (typeof value === 'string') {
                var json = Buffer.from(value, 'hex').toString();
                if (json.length === 0) {
                    json = Buffer.from(value).toString();
                }
                return JSON.parse(json);
            }
            if (Buffer.isBuffer(value)) {
                return JSON.parse(value.toString());
            }
            return null; // let the default type take care of it
        },

        'setabi.abi.appendByteBuffer': function setabiAbiAppendByteBuffer(_ref) {
            var fields = _ref.fields,
                object = _ref.object,
                b = _ref.b;

            var ser = structLookup('abi_def', 'eosio');
            var b2 = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);

            if (Buffer.isBuffer(object.abi)) {
                b2.append(object.abi);
            } else if ((0, _typeof3.default)(object.abi) == 'object') {
                ser.appendByteBuffer(b2, object.abi);
            }

            b.writeVarint32(b2.offset); // length prefix
            b.append(b2.copy(0, b2.offset), 'binary');
        }
    };
};

var wasmCodeOverride = function wasmCodeOverride(config) {
    return {
        'setcode.code.fromObject': function setcodeCodeFromObject(_ref2) {
            var object = _ref2.object,
                result = _ref2.result;

            try {
                var code = object.code.toString();
                if (/^\s*\(module/.test(code)) {
                    var binaryen = config.binaryen;

                    assert(binaryen != null, 'required: config.binaryen = require("binaryen")');
                    if (config.debug) {
                        console.log('Assembling WASM..');
                    }
                    var wasm = Buffer.from(binaryen.parseText(code).emitBinary());
                    result.code = wasm;
                } else {
                    result.code = object.code;
                }
            } catch (error) {
                console.error(error, object.code);
                throw error;
            }
        }
    };
};

/**
  Nested serialized structure.  Nested struct may be in HEX or object format.
*/
var actionDataOverride = function actionDataOverride(structLookup, forceActionDataHex) {
    return {
        'action.data.fromByteBuffer': function actionDataFromByteBuffer(_ref3) {
            var fields = _ref3.fields,
                object = _ref3.object,
                b = _ref3.b,
                config = _ref3.config;

            var ser = (object.name || '') == '' ? fields.data : structLookup(object.name, object.account);
            if (ser) {
                b.readVarint32(); // length prefix (usefull if object.name is unknown)
                object.data = ser.fromByteBuffer(b, config);
            } else {
                var lenPrefix = b.readVarint32();
                var bCopy = b.copy(b.offset, b.offset + lenPrefix);
                b.skip(lenPrefix);
                object.data = Buffer.from(bCopy.toBinary(), 'binary');
            }
        },

        'action.data.appendByteBuffer': function actionDataAppendByteBuffer(_ref4) {
            var fields = _ref4.fields,
                object = _ref4.object,
                b = _ref4.b;

            var ser = (object.name || '') == '' ? fields.data : structLookup(object.name, object.account);
            if (ser) {
                var b2 = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);
                ser.appendByteBuffer(b2, object.data);
                b.writeVarint32(b2.offset);
                b.append(b2.copy(0, b2.offset), 'binary');
            } else {
                // console.log(`Unknown Action.name ${object.name}`)
                var data = typeof object.data === 'string' ? new Buffer(object.data, 'hex') : object.data;
                if (!Buffer.isBuffer(data)) {
                    throw new TypeError('Unknown struct \'' + object.name + '\' for contract \'' + object.account + '\', locate this struct or provide serialized action.data');
                }
                b.writeVarint32(data.length);
                b.append(data.toString('binary'), 'binary');
            }
        },

        'action.data.fromObject': function actionDataFromObject(_ref5) {
            var fields = _ref5.fields,
                object = _ref5.object,
                result = _ref5.result;
            var data = object.data,
                name = object.name;

            var ser = (name || '') == '' ? fields.data : structLookup(name, object.account);
            if (ser) {
                if ((typeof data === 'undefined' ? 'undefined' : (0, _typeof3.default)(data)) === 'object') {
                    result.data = ser.fromObject(data); // resolve shorthand
                } else if (typeof data === 'string') {
                    var buf = new Buffer(data, 'hex');
                    result.data = Fcbuffer.fromBuffer(ser, buf);
                } else {
                    throw new TypeError('Expecting hex string or object in action.data');
                }
            } else {
                // console.log(`Unknown Action.name ${object.name}`)
                result.data = data;
            }
        },

        'action.data.toObject': function actionDataToObject(_ref6) {
            var fields = _ref6.fields,
                object = _ref6.object,
                result = _ref6.result,
                config = _ref6.config;

            var _ref7 = object || {},
                data = _ref7.data,
                name = _ref7.name;

            var ser = (name || '') == '' ? fields.data : structLookup(name, object.account);
            if (!ser) {
                // Types without an ABI will accept hex
                result.data = Buffer.isBuffer(data) ? data.toString('hex') : data;
                return;
            }

            if (forceActionDataHex) {
                var b2 = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);
                if (data) {
                    ser.appendByteBuffer(b2, data);
                }
                result.data = b2.copy(0, b2.offset).toString('hex');
                // console.log('result.data', result.data)
                return;
            }

            // Serializable JSON
            result.data = ser.toObject(data, config);
        }
    };
};