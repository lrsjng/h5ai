
modulejs.define('model/entry', ['$', '_', 'config', 'core/types', 'core/event', 'core/settings', 'core/server', 'core/location'], function ($, _, config, types, event, settings, server, location) {


	var reEndsWithSlash = /\/$/,

		startsWith = function (sequence, part) {

			return sequence.slice && part.length && sequence.slice(0, part.length) === part;
		},


		createLabel = function (sequence) {

			sequence = sequence.replace(reEndsWithSlash, '');
			try { sequence = decodeURIComponent(sequence); } catch (e) {}
			return sequence;
		},


		reSplitPath = /^(.*\/)([^\/]+\/?)$/,

		splitPath = function (sequence) {

			if (sequence === '/') {
				return { parent: null, name: '/' };
			}

			var match = reSplitPath.exec(sequence);
			if (match) {
				var split = { parent: match[1], name: match[2] };

				if (split.parent && !startsWith(split.parent, settings.rootAbsHref)) {
					split.parent = null;
				}
				return split;
			}
		},



		// Cache

		cache = {},

		getEntry = function (absHref, time, size, status, isContentFetched) {

			absHref = location.forceEncoding(absHref);

			if (!startsWith(absHref, settings.rootAbsHref)) {
				return null;
			}

			var created = !cache[absHref],
				changed = false;

			var self = cache[absHref] || new Entry(absHref);

			if (_.isNumber(time)) {
				if (self.time !== time) {
					changed = true;
				}
				self.time = time;
			}
			if (_.isNumber(size)) {
				if (self.size !== size) {
					changed = true;
				}
				self.size = size;
			}
			if (status) {
				if (self.status !== status) {
					changed = true;
				}
				self.status = status;
			}
			if (isContentFetched) {
				self.isContentFetched = true;
			}

			if (created) {
				event.pub('entry.created', self);
			} else if (changed) {
				event.pub('entry.changed', self);
			}

			return self;
		},

		removeEntry = function (absHref) {

			absHref = location.forceEncoding(absHref);

			var self = cache[absHref];

			if (self) {
				delete cache[absHref];
				if (self.parent) {
					delete self.parent.content[self.absHref];
				}
				_.each(self.content, function (entry) {

					removeEntry(entry.absHref);
				});

				event.pub('entry.removed', self);
			}
		},

		fetchContent = function (absHref, callback) {

			var self = getEntry(absHref);

			if (!_.isFunction(callback)) {
				callback = function () {};
			}

			if (self.isContentFetched) {
				callback(self);
			} else {
				server.request({action: 'get', entries: true, entriesHref: self.absHref, entriesWhat: 1}, function (response) {

					if (response.entries) {
						_.each(response.entries, function (entry) {
							getEntry(entry.absHref, entry.time, entry.size, entry.status, entry.content);
						});
					}

					callback(self);
				});
			}
		},

		init = function () {

			_.each(config.entries || [], function (entry) {

				getEntry(entry.absHref, entry.time, entry.size, entry.status, entry.content);
			});
		};



	// Entry

	var Entry = function (absHref) {

		var split = splitPath(absHref);

		cache[absHref] = this;

		this.absHref = absHref;
		this.type = types.getType(absHref);
		this.label = createLabel(absHref === '/' ? location.getDomain() : split.name);
		this.time = null;
		this.size = null;
		this.parent = null;
		this.status = null;
		this.content = {};

		if (split.parent) {
			this.parent = getEntry(split.parent);
			this.parent.content[this.absHref] = this;
			if (_.keys(this.parent.content).length > 1) {
				this.parent.isContentFetched = true;
			}
		}
	};

	_.extend(Entry.prototype, {

		isFolder: function () {

			return reEndsWithSlash.test(this.absHref);
		},

		isCurrentFolder: function () {

			return this.absHref === location.getAbsHref();
		},

		isInCurrentFolder: function () {

			return !!this.parent && this.parent.isCurrentFolder();
		},

		isCurrentParentFolder: function () {

			return this === getEntry(location.getAbsHref()).parent;
		},

		isDomain: function () {

			return this.absHref === '/';
		},

		isRoot: function () {

			return this.absHref === settings.rootAbsHref;
		},

		isH5ai: function () {

			return this.absHref === settings.h5aiAbsHref;
		},

		isEmpty: function () {

			return _.keys(this.content).length === 0;
		},

		fetchContent: function (callback) {

			return fetchContent(this.absHref, callback);
		},

		getCrumb: function () {

			var entry = this,
				crumb = [entry];

			while (entry.parent) {
				entry = entry.parent;
				crumb.unshift(entry);
			}

			return crumb;
		},

		getSubfolders: function () {

			return _.sortBy(_.filter(this.content, function (entry) {

				return entry.isFolder();
			}), function (entry) {

				return entry.label.toLowerCase();
			});
		},

		getStats: function () {

			var folders = 0,
				files = 0;

			_.each(this.content, function (entry) {

				if (entry.isFolder()) {
					folders += 1;
				} else {
					files += 1;
				}
			});

			var depth = 0,
				entry = this;

			while (entry.parent) {
				depth += 1;
				entry = entry.parent;
			}

			return {
				folders: folders,
				files: files,
				depth: depth
			};
		}
	});


	init();

	return {
		get: getEntry,
		remove: removeEntry
	};
});
