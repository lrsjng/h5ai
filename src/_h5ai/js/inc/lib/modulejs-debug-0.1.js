/*! modulejs-debug 0.1 - //larsjung.de/qrcode - MIT License */

(function (global, _, name) {
	'use strict';


	var Debugger = function (modulejs) {


		var self = this;


		self.modulejs = modulejs;


		self.clear = function () {

			modulejs.definitions = {};
			modulejs.instances = {};
		};


		self.isDefined = function (id) {

			return _.isString(id) && !!modulejs.definitions[id];
		};


		self.ids = function (regexp) {

			var ids = _.map(modulejs.definitions, function (def) {

					return def.id;
				});

			if (!_.isRegExp(regexp)) {
				return ids;
			}

			return _.filter(ids, function (id) {

				return regexp.test(id);
			});
		};


		var _deps = function (id, stack) {

			var deps = [];

			var def = modulejs.definitions[id];
			if (def) {
				stack = (stack || []).slice(0);
				stack.push(id);
				_.each(def.deps, function (depId) {

					if (_.indexOf(stack, depId) >= 0) {
						deps = deps.concat([false, def.id]);
						return deps;
					}

					deps = deps.concat(_deps(depId, stack));
					deps.push(depId);
				});
			}

			return _.uniq(deps);
		};


		self.deps = function (ids) {

			if (_.isString(ids)) {

				return _deps(ids);
			} else if (_.isArray(ids)) {

				var deps = [];
				_.each(ids, function (id) {

					deps = deps.concat(_deps(id));
				});
				return _.uniq(deps);
			}

			var res = {};
			_.each(modulejs.definitions, function (def, id) {

				res[id] = _deps(id);
			});
			return res;
		};


		self.log = function (showInvDeps) {

			var allDeps = self.deps(),
				allInvDeps = {},
				out = '\n';

			if (!showInvDeps) {
				_.each(allDeps, function (deps, id) {

					out += (_.has(modulejs.instances, id) ? '* ' : '  ') + id + ' -> [ ' + deps.join(', ') + ' ]\n';
				});
			} else {
				_.each(modulejs.definitions, function (def) {

					var invDeps = [];
					_.each(allDeps, function (depIds, id) {

						if (_.indexOf(depIds, def.id) >= 0) {
							invDeps.push(id);
						}
					});
					allInvDeps[def.id] = invDeps;
				});

				_.each(allInvDeps, function (invDeps, id) {

					out += (_.has(modulejs.instances, id) ? '* ' : '  ') + id + ' <- [ ' + invDeps.join(', ') + ' ]\n';
				});
			}

			return out;
		};
	};


	global[name.toUpperCase()] = Debugger;


}(this, _, 'modulejs'));
