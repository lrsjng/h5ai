
modulejs.define('core/entry', ['_', 'config', 'model/entry'], function (_, config, Entry) {

	_.each(config.entries || [], function (entry) {

		Entry.get(entry.absHref, entry.time, entry.size, entry.status, entry.content);
	});

	var entry = Entry.get();
	entry.status = '=h5ai=';

	return entry;
});
