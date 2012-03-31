
var Module = window.Module = (function ($) {

	var definitions = {},
		modules = {},

		err = function (message) {

			$.error('module: ' + message);
		},

		uniq = function (array) {

			var set = {},
				uniq = [];

			$.each(array, function (idx, element) {

				if (!set[element]) {
					set[element] = true;
					uniq.push(element);
				}
			});
			return uniq;
		},

		deps = function (ids) {

			var self = this;
			var deps = [];

			if (typeof ids === 'string') {

				var def = definitions[ids];
				if (def) {
					$.each(def.deps, function (idx, id) {

						deps = deps.concat(deps(id));
					});
					deps.push(def.id);
				} else {
					deps.push(ids);
				}
			} else if ($.isArray(ids)) {

				$.each(ids, function (idx, id) {

					deps = deps.concat(deps(id));
				});
			}

			return uniq(deps);
		},

		checkedDeps = function (ids) {

			try {
				return deps(ids);
			} catch (e) {
				err('cyclic dependencies for ids "' + ids + '"');
			}
		},

		defs = function () {

			return $.extend({}, definitions);
		},

		mods = function () {

			return $.extend({}, modules);
		},

		define = function (id, deps, fn) {

			if ($.isFunction(deps)) {
				fn = deps;
				deps = [];
			}
			if (typeof id !== 'string') {
				err('id  must be a string "' + id + '"');
			}
			if (!$.isArray(deps)) {
				err('dependencies must be an array "' + deps + '"');
			}
			if (!$.isFunction(fn)) {
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

		require = function (id) {

			if (typeof id !== 'string') {
				return id;
			}

			if (modules[id]) {
				return modules[id];
			}

			var def = definitions[id];
			if (!def) {
				err('id not defined "' + id + '"');
			}

			var deps = $.map(def.deps, function (depId) {

				return require(depId);
			});

			var obj = def.fn.apply(this, deps);
			modules[id] = obj;
			return obj;
		};

	return {
		deps: checkedDeps,
		defs: defs,
		mods: mods,
		define: define,
		require: require
	};

}(jQuery));
