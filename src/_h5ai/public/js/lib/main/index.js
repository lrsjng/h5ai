const {win} = require('../globals');
const location = require('../core/location');

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
require('../ext/peer5');
require('../ext/piwik-analytics');
require('../ext/preview');
require('../ext/preview-aud');
require('../ext/preview-img');
require('../ext/preview-txt');
require('../ext/preview-vid');
require('../ext/search');
require('../ext/select');
require('../ext/sort');
require('../ext/thumbnails');
require('../ext/title');
require('../ext/tree');

location.setLocation(win.document.location.href, true);
