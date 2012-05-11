
module.define('core/entry', [jQuery, 'core/parser', 'model/entry'], function ($, parser, Entry) {

	var absHref = document.location.pathname.replace(/[^\/]*$/, '');

	parser.parse(absHref, $('body'));
	$('#data-apache-autoindex').remove();

	var entry = Entry.get(absHref);
	entry.status = 'h5ai';
	if (entry.parent) {
		entry.parent.isParentFolder = true;
	}

	return entry;
});
