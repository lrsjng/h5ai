modulejs.define('core/resource', ['_', 'config', 'core/settings'], function (_, config, settings) {

    var imagesHref = settings.appHref + 'client/images/';
    var uiHref = imagesHref + 'ui/';
    var themesHref = imagesHref + 'themes/';
    var defaultThemeHref = themesHref + 'default/';
    var defaultIcons = ['file', 'folder', 'folder-page', 'folder-parent', 'ar', 'aud', 'bin', 'img', 'txt', 'vid'];


    function image(id) {

        return uiHref + id + '.svg';
    }

    function icon(id) {

        var baseId = id.split('-')[0];
        var href = config.theme[id] || config.theme[baseId];

        if (href) {
            return themesHref + href;
        }

        if (_.indexOf(defaultIcons, id) >= 0) {
            return defaultThemeHref + id + '.svg';
        }

        if (_.indexOf(defaultIcons, baseId) >= 0) {
            return defaultThemeHref + baseId + '.svg';
        }

        return defaultThemeHref + 'file.svg';
    }


    return {
        image: image,
        icon: icon
    };
});
