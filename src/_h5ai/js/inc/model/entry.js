
modulejs.define('model/entry', ['_', 'core/types', 'core/ajax', 'core/event', 'core/settings'], function (_, types, ajax, event, settings) {

	var doc = document,
		domain = doc.domain,

		forceEncoding = function (href) {

			return href
					.replace(/\/+/g, '/')
					.replace(/ /g, '%20')
					.replace(/'/g, '%27')
					.replace(/\[/g, '%5B')
					.replace(/\]/g, '%5D')
					.replace(/\(/g, '%28')
					.replace(/\)/g, '%29')
					.replace(/\+/g, '%2B')
					.replace(/\=/g, '%3D');
		},


		location = (function () {

			var rePrePathname = /.*:\/\/[^\/]*/,
				rePostPathname = /[^\/]*$/,

				uriToPathname = function (uri) {

					return uri.replace(rePrePathname, '').replace(rePostPathname, '');
				},

				testpathname = '/a b',
				a = doc.createElement('a'),
				isDecoded, location;

			a.href = testpathname;
			isDecoded = uriToPathname(a.href) === testpathname;

			a.href = doc.location.href;
			location = uriToPathname(a.href);

			if (isDecoded) {
				location = encodeURIComponent(location).replace(/%2F/ig, '/');
			}

			return forceEncoding(location);
		}()),

		folderstatus = (function () {

			try { return modulejs.require('ext/folderstatus'); } catch (e) {}
			return {};
		}()),



		// utils

		reEndsWithSlash = /\/$/,


		startsWith = function (sequence, part) {

			return sequence.length >= part.length && sequence.slice(0, part.length) === part;
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


		ajaxRequest = function (self, parser, callback) {

			ajax.getStatus(self.absHref, parser, function (response) {

				self.status = response.status;
				if (parser && response.status === 'h5ai') {
					parser.parse(self.absHref, response.content);
				}
				callback(self);
			});
		},



		// Cache

		cache = {},

		getEntry = function (absHref, time, size, status, isContentFetched) {

			absHref = forceEncoding(absHref || location);

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

			absHref = forceEncoding(absHref || location);

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

		fetchStatus = function (absHref, callback) {

			var self = getEntry(absHref);

			if (self.status || !self.isFolder()) {
				callback(self);
			} else if (folderstatus[absHref]) {
				self.status = folderstatus[absHref];
				callback(self);
			} else {
				ajaxRequest(self, null, callback);
			}
		},

		fetchContent = function (absHref, parser, callback) {

			var self = getEntry(absHref);

			if (self.isContentFetched) {
				callback(self);
			} else {
				fetchStatus(absHref, function (self) {

					self.isContentFetched = true;
					if (self.status === 'h5ai') {
						ajaxRequest(self, parser, callback);
					} else {
						callback(self);
					}
				});
			}
		};



	// Entry

	var Entry = function (absHref) {

		var split = splitPath(absHref);

		cache[absHref] = this;

		this.absHref = absHref;
		this.type = types.getType(absHref);
		this.label = createLabel(absHref === '/' ? domain : split.name);
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

			return this.absHref === location;
		},

		isInCurrentFolder: function () {

			return !!this.parent && this.parent.isCurrentFolder();
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

		fetchStatus: function (callback) {

			return fetchStatus(this.absHref, callback);
		},

		fetchContent: function (parser, callback) {

			return fetchContent(this.absHref, parser, callback);
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

	return {
		get: getEntry,
		remove: removeEntry
	};
});
