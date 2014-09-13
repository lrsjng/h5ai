modulejs.define('core/resource', ['_', '$', 'config', 'core/settings'], function (_, $, config, settings) {

    var win = window;
    var appHref = settings.appHref;
    var imagesHref = appHref + 'client/images/';
    var fallbackHref = appHref + 'client/images/fallback/';
    var themesHref = appHref + 'client/themes/';
    var scriptsHref = appHref + 'client/js/';
    var fallbacks = ['file', 'folder', 'folder-page', 'folder-parent', 'ar', 'aud', 'bin', 'img', 'txt', 'vid'];


    function image(id) {

        return imagesHref + id + '.svg';
    }

    function icon(id) {

        var baseId = id.split('-')[0];
        var href = config.theme[id] || config.theme[baseId];

        if (href) {
            return themesHref + href;
        }

        if (_.indexOf(fallbacks, id) >= 0) {
            return fallbackHref + id + '.svg';
        }

        if (_.indexOf(fallbacks, baseId) >= 0) {
            return fallbackHref + baseId + '.svg';
        }

        return fallbackHref + 'file.svg';
    }


    return {
        image: image,
        icon: icon
    };
});
