/*!
 * module.js
 * author: Lars Jung
 * license: MIT
 */

(function (global, name) {
	'use strict';

	var	err = function (message) {

			throw name + ' exception: ' + message;
		};

	if (!_) {
		err(name + ' depends on underscore');
	}

	var self = {},
		previous = global[name],

		noConflict = function () {

			if (global[name] === self) {
				global[name] = previous;
			}
			return self;
		},

		definitions = {},
		modules = {},

		findDepsUnsafe = function (ids) {

			var self = this;
			var deps = [];

			if (_.isString(ids)) {

				var def = definitions[ids];
				if (def) {
					_.each(def.deps, function (id) {

						deps = deps.concat(findDepsUnsafe(id));
					});
					deps.push(def.id);
				} else {
					deps.push(ids);
				}
			} else if (_.isArray(ids)) {

				_.each(ids, function (id) {

					deps = deps.concat(findDepsUnsafe(id));
				});
			}

			return _.uniq(deps);
		},

		findDeps = function (ids) {

			if (ids) {
				try {
					return findDepsUnsafe(ids);
				} catch (e) {
					err('cyclic dependencies for ids "' + ids + '"');
				}
			} else {
				var res = {};
				_.each(definitions, function (def, id) {

					res[id] = findDeps(id);
				});
				return res;
			}
		},

		log = function (showInvDeps) {

			var allDeps = findDeps(),
				allInvDeps = {},
				out = '';

			if (!showInvDeps) {
				_.each(allDeps, function (deps, id) {

					deps.pop();
					out += (_.has(modules, id) ? '* ' : '  ') + id + ' -> [ ' + deps.join(', ') + ' ]\n';
				});
			} else {
				_.each(definitions, function (def) {

					var invDeps = [];
					_.each(allDeps, function (depIds, id) {

						if (_.indexOf(depIds, def.id) >= 0) {
							invDeps.push(id);
						}
					});
					allInvDeps[def.id] = invDeps;
				});

				_.each(allInvDeps, function (invDeps, id) {

					invDeps.shift();
					out += (_.has(modules, id) ? '* ' : '  ') + id + ' <- [ ' + invDeps.join(', ') + ' ]\n';
				});
			}

			return out;
		},

		define = function (id, deps, fn) {

			if (_.isFunction(deps)) {
				fn = deps;
				deps = [];
			}
			if (!_.isString(id)) {
				err('id must be a string "' + id + '"');
			}
			if (!_.isArray(deps)) {
				err('dependencies must be an array "' + deps + '"');
			}
			if (!_.isFunction(fn)) {
				err('constructor must be a function "' + fn + '"');
			}
			if (definitions[id]) {
				err('id already defined "' + id + '"');
			}

			definitions[id] = {
				id: id,
				deps: deps,
				fn: fn
			};
		},

		getIds = function (regexp) {

			var ids = _.map(definitions, function (def) {

					return def.id;
				});

			if (!_.isRegExp(regexp)) {
				return ids;
			}

			return _.filter(ids, function (id) {

				return regexp.test(id);
			});
		},

		isDefined = function (id) {

			return _.isString(id) ? !!definitions[id] : !!id;
		},

		require = function (id) {

			if (!_.isString(id)) {
				return id;
			}

			if (_.has(modules, id)) {
				return modules[id];
			}

			var def = definitions[id];
			if (!def) {
				err('id not defined "' + id + '"');
			}

			var deps = _.map(def.deps, function (depId) {

				return require(depId);
			});

			var obj = def.fn.apply(this, deps);
			modules[id] = obj;
			return obj;
		};

	_.extend(self, {
		noConflict: noConflict,
		log: log,
		define: define,
		require: require,
		getIds: getIds,
		isDefined: isDefined
	});

	global[name] = self;

}(this, 'module'));
