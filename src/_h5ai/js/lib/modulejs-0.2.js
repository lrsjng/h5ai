/*! modulejs 0.2 - //larsjung.de/modulejs - MIT License */

(function (global, name) {
	'use strict';


	var objProto = Object.prototype,
		arrayForEach = Array.prototype.forEach,
		isType = function (arg, type) {

			return objProto.toString.call(arg) === '[object ' + type + ']';
		},
		isString = function (arg) {

			return isType(arg, 'String');
		},
		isFunction = function (arg) {

			return isType(arg, 'Function');
		},
		isArray = Array.isArray || function (arg) {

			return isType(arg, 'Array');
		},
		isObject = function (arg) {

			return arg === new Object(arg);
		},
		has = function (arg, id) {

			return objProto.hasOwnProperty.call(arg, id);
		},
		each = function (obj, iterator, context) {

			if (arrayForEach && obj.forEach === arrayForEach) {
				obj.forEach(iterator, context);
			} else if (obj.length === +obj.length) {
				for (var i = 0, l = obj.length; i < l; i += 1) {
					iterator.call(context, obj[i], i, obj);
				}
			} else {
				for (var key in obj) {
					if (has(obj, key)) {
						iterator.call(context, obj[key], key, obj);
					}
				}
			}
		},
		contains = function (array, item) {

			for (var i = 0, l = array.length; i < l; i += 1) {
				if (array[i] === item) {
					return true;
				}
			}
			return false;
		},
		uniq = function (array) {

			var elements = {},
				result = [];

			each(array, function (el) {

				if (!has(elements, el)) {
					result.push(el);
					elements[el] = 1;
				}
			});

			return result;
		},
		err = function (condition, code, message) {

			if (condition) {
				throw {
					code: code,
					msg: message,
					toString: function () {
						return name + ' error ' + code + ': ' + message;
					}
				};
			}
		},

		// Module definitions.
		definitions = {},

		// Module instances.
		instances = {},

		resolve = function (id, cold, stack) {

			err(!isString(id), 31, 'id must be a string "' + id + '"');

			if (!cold && has(instances, id)) {
				return instances[id];
			}

			var def = definitions[id];
			err(!def, 32, 'id not defined "' + id + '"');

			stack = (stack || []).slice(0);
			stack.push(id);

			var deps = [];

			each(def.deps, function (depId, idx) {

				err(contains(stack, depId), 33, 'cyclic dependencies: ' + stack + ' & ' + depId);

				if (cold) {
					deps = deps.concat(resolve(depId, cold, stack));
					deps.push(depId);
				} else {
					deps[idx] = resolve(depId, cold, stack);
				}
			});

			if (cold) {
				return uniq(deps);
			}

			var obj = def.fn.apply(global, deps);
			instances[id] = obj;
			return obj;
		},



		// Public methods
		// --------------

		// ### define
		// Defines a module for `id: String`, optional `deps: Array[String]`,
		// `arg: Object/function`.
		define = function (id, deps, arg) {

			// sort arguments
			if (arg === undefined) {
				arg = deps;
				deps = [];
			}
			// check arguments
			err(!isString(id), 11, 'id must be a string "' + id + '"');
			err(definitions[id], 12, 'id already defined "' + id + '"');
			err(!isArray(deps), 13, 'dependencies for "' + id + '" must be an array "' + deps + '"');
			err(!isObject(arg) && !isFunction(arg), 14, 'arg for "' + id + '" must be object or function "' + arg + '"');

			// accept definition
			definitions[id] = {
				id: id,
				deps: deps,
				fn: isFunction(arg) ? arg : function () { return arg; }
			};
		},

		// ### require
		// Returns an instance for `id`.
		require = function (id) {

			return resolve(id);
		},

		// ### state
		// Returns an object that holds infos about the current definitions and dependencies.
		state = function () {

			var res = {};

			each(definitions, function (def, id) {

				res[id] = {

					// direct dependencies
					deps: def.deps.slice(0),

					// transitive dependencies
					reqs: resolve(id, true),

					// already initiated/required
					init: has(instances, id)
				};
			});

			each(definitions, function (def, id) {

				var inv = [];
				each(definitions, function (def2, id2) {

					if (contains(res[id2].reqs, id)) {
						inv.push(id2);
					}
				});

				// all inverse dependencies
				res[id].reqd = inv;
			});

			return res;
		},

		// ### log
		// Returns a string that displays module dependencies.
		log = function (inv) {

			var out = '\n';

			each(state(), function (st, id) {

				var list = inv ? st.reqd : st.reqs;
				out += (st.init ? '* ' : '  ') + id + ' -> [ ' + list.join(', ') + ' ]\n';
			});

			return out;
		};


	// Register Public API
	// -------------------
	global[name] = {
		define: define,
		require: require,
		state: state,
		log: log
	};

	// Uncomment to run internal tests.
	/*
	if (global[name.toUpperCase()] === true) {
		global[name.toUpperCase()] = {
			isString: isString,
			isFunction: isFunction,
			isArray: isArray,
			isObject: isObject,
			has: has,
			each: each,
			contains: contains,
			uniq: uniq,
			err: err,
			definitions: definitions,
			instances: instances,
			resolve: resolve
		};
	} // */

}(this, 'modulejs'));
