/*! modulejs 0.1 - //larsjung.de/qrcode - MIT License */

(function (global, _, name) {
	'use strict';


	// throws error
	var	err = function (condition, code, message) {

		if (condition) {
			if (console && console.error) {
				console.error(name + ' error: [' + code + '] ' + message);
			}
			throw {
				code: code,
				msg: name + ' error: ' + message
			};
		}
	};

	// make sure underscore is loaded
	err(!_, 1, name + ' requires underscore');


	// ModuleJs
	// ========
	var ModuleJs = function () {

		var self = this;

		// module definitions
		self.definitions = {};

		// module instances
		self.instances = {};

		// define
		// ------
		// Defines a module.
		self.define = function (id, deps, fn) {

			// sort arguments
			if (_.isFunction(deps)) {
				fn = deps;
				deps = [];
			}
			// check arguments
			err(!_.isString(id), 11, 'id must be a string "' + id + '"');
			err(self.definitions[id], 12, 'id already defined "' + id + '"');
			err(!_.isFunction(fn), 13, 'constructor for "' + id + '" must be a function "' + fn + '"');
			err(!_.isArray(deps), 14, 'dependencies for "' + id + '" must be an array "' + deps + '"');

			// map definition
			self.definitions[id] = {
				id: id,
				deps: deps,
				fn: fn
			};
		};

		// predefined
		// ----------
		// Registers a predefined object.
		self.predefined = function (id, instance, check) {

			if (_.isFunction(check)) {
				check = !!check();
			}
			if (!_.isBoolean(check)) {
				check = instance !== undefined;
			}
			err(!check, 21, 'check for predefined "' + id + '" failed');

			self.define(id, [], function () {

				return instance;
			});
		};

		// Returns an instance for `id`, checked against require-`stack` for
		// cyclic dependencies.
		self._require = function (id, stack) {

			err(!_.isString(id), 31, 'id must be a string "' + id + '"');

			if (_.has(self.instances, id)) {
				return self.instances[id];
			}

			var def = self.definitions[id];
			err(!def, 32, 'id not defined "' + id + '"');

			stack = (stack || []).slice(0);
			stack.push(id);
			var deps = _.map(def.deps, function (depId) {

				err(_.indexOf(stack, depId) >= 0, 33, 'cyclic dependencies: ' + stack + ' & ' + depId);

				return self._require(depId, stack);
			});

			var obj = def.fn.apply(global, deps);
			self.instances[id] = obj;
			return obj;
		};

		// require
		// -------
		// Returns an instance for `id`.
		self.require = function (arg) {

			if (_.isArray(arg)) {

				return _.map(arg, function (id) {

					return self._require(id);
				});
			}

			if (_.isRegExp(arg)) {

				var res = {};
				_.each(_.keys(self.definitions), function (id) {

					if (arg.test(id)) {
						res[id] = self._require(id);
					}
				});
				return res;
			}

			return self._require(arg);
		};

		// Registers public API on the global object.
		self.register = function (name) {

			var	previous = global[name],
				api = {
					define: self.define,
					predefined: self.predefined,
					require: self.require,
					noConflict: function () {

						if (global[name] === api) {
							global[name] = previous;
						}
						return api;
					}
				};

			global[name] = api;
		};
	};


	var modulejs = new ModuleJs();
	modulejs.register(name);


	// debugger
	// --------
	var debugName = name.toUpperCase();
	if (_.isFunction(global[debugName])) {
		global[debugName] = new global[debugName](modulejs);
	}

}(this, _, 'modulejs'));
