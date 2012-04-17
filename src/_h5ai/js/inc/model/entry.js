
module.define('model/entry', [jQuery, 'core/types'], function ($, types) {

	var domain = document.domain,
		location = document.location.pathname,


		// utils

		reEndsWithSlash = /\/$/,


		createLabel = function (sequence) {

			if (sequence.length > 1 && reEndsWithSlash.test(sequence)) {
				sequence = sequence.slice(0, -1);
			}
			try {
				sequence = decodeURI(sequence);
			} catch (err) {}
			return sequence;
		},


		reSplitPath = /^\/([^\/]+\/?)$/,
		reSplitPath2 = /^(\/(?:.*\/)*?([^\/]+)\/)([^\/]+\/?)$/,

		splitPath = function (sequence) {

			var match;

			sequence = sequence.replace(/\/+/g, '/');
			if (sequence === '/') {
				return {
					parent: null,
					parentname: null,
					name: '/'
				};
			}
			match = reSplitPath2.exec(sequence);
			if (match) {
				return {
					parent: match[1],
					parentname: match[2],
					name: match[3]
				};
			}
			match = reSplitPath.exec(sequence);
			if (match) {
				return {
					parent: '/',
					parentname: '/',
					name: match[1]
				};
			}
		},


		reContentType = /^text\/html;h5ai=/,

		ajaxRequest = function (self, parser, callback) {

			$.ajax({
				url: self.absHref,
				type: parser ? 'GET' : 'HEAD',
				complete: function (xhr) {

					if (xhr.status === 200 && reContentType.test(xhr.getResponseHeader('Content-Type'))) {
						self.status = 'h5ai';
						if (parser) {
							parser.parse(self.absHref, xhr.responseText);
						}
					} else {
						self.status = xhr.status;
					}

					callback(self);
				}
			});
		},




		// Entry

		cache = {},

		Entry = function (absHref) {

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
				this.parent = cache[split.parent] || new Entry(split.parent);
				this.parent.content[this.absHref] = this;
			}
		},

		get = function (absHref, time, size, status) {

			absHref = absHref || location;

			var self = cache[absHref] || new Entry(absHref);

			if (_.isNumber(time)) {
				self.time = time;
			}
			if (_.isNumber(size)) {
				self.size = size;
			}
			if (status) {
				self.status = status;
			}

			return self;
		},

		folderstatus = module.isDefined('ext/folderstatus') ? module.require('ext/folderstatus') : {},

		fetchStatus = function (absHref, callback) {

			var self = cache[absHref] || new Entry(absHref);

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

			var self = cache[absHref] || new Entry(absHref);

			if (self.isContentFetched || _.keys(self.content).length > 1) {
				self.isContentFetched = true;
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


	_.extend(Entry.prototype, {

		isFolder: function () {

			return reEndsWithSlash.test(this.absHref);
		},

		isCurrentFolder: function () {

			return this.absHref === location;
		},

		isDomain: function () {

			return this.absHref === '/';
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

				return entry.absHref;
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
		get: get
	};
});
