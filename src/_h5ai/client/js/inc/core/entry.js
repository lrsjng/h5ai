
modulejs.define('core/entry', ['$', 'core/parser', 'model/entry'], function ($, parser, Entry) {

	var entry = Entry.get();

	parser.parse(entry.absHref, $('body'));
	entry.status = '=h5ai=';

	return entry;
});
