require('../view/viewmode');

require('../ext/autorefresh');
require('../ext/contextmenu');
require('../ext/crumb');
require('../ext/custom');
require('../ext/download');
require('../ext/filter');
require('../ext/google-analytics');
require('../ext/info');
require('../ext/l10n');
require('../ext/piwik-analytics');
require('../ext/preview');
require('../ext/search');
require('../ext/select');
require('../ext/sort');
require('../ext/thumbnails');
require('../ext/title');
require('../ext/tree');

const href = global.window.document.location.href;
require('../core/location').setLocation(href, true);
