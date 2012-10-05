
modulejs.define('core/entry', ['$', 'core/parser', 'model/entry'], function ($, parser, Entry) {

	var entry = Entry.get();

	parser.parse(entry.absHref, $('body'));
	$('#data-apache-autoindex').remove();

	entry.status = 'h5ai';
	if (entry.parent) {
		entry.parent.isParentFolder = true;
	}

	return entry;
});
