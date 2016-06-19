const {win, jq, lo, kjua} = require('../globals');
const event = require('../core/event');
const format = require('../core/format');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const store = require('../core/store');


const settings = lo.extend({
    enabled: false,
    show: false,
    qrcode: true,
    qrColor: '#999'
}, allsettings.info);
const template =
        `<div id="info">
            <div class="icon"><img/></div>
            <div class="block">
                <div class="label"/>
                <div class="time"/>
                <div class="size"/>
                <div class="content">
                    <span class="folders"/> <span class="l10n-folders"/>,
                    <span class="files"/> <span class="l10n-files"/>
                </div>
            </div>
            <div class="qrcode"/>
        </div>`;
const settingsTemplate =
        `<div class="block">
            <h1 class="l10n-info">Info</h1>
            <div id="view-info" class="button view">
                <img src="${resource.image('info-toggle')}" alt="view-info"/>
            </div>
        </div>`;
const storekey = 'ext/info';
let $img;
let $label;
let $time;
let $size;
let $content;
let $folders;
let $files;
let $qrcode;
let currentFolder;


function updateSettings() {
    if (store.get(storekey)) {
        jq('#view-info').addClass('active');
        jq('#info').show();
    } else {
        jq('#view-info').removeClass('active');
        jq('#info').hide();
    }
}

function update(item) {
    let src = item.thumbRational || item.icon;
    const isThumb = Boolean(item.thumbRational);

    if (item.isCurrentFolder() || !src) {
        src = resource.icon('folder');
    }

    $img.attr('src', src);
    if (isThumb) {
        $img.addClass('thumb');
    } else {
        $img.removeClass('thumb');
    }

    $label.text(item.label);
    if (lo.isNumber(item.time)) {
        $time.text(format.formatDate(item.time));
    } else {
        $time.text('.');
    }

    if (lo.isNumber(item.size)) {
        $size.text(format.formatSize(item.size));
        $size.show();
    } else {
        $size.hide();
    }

    if (item.isContentFetched) {
        const stats = item.getStats();
        $folders.text(stats.folders);
        $files.text(stats.files);
        $content.show();
    } else {
        $content.hide();
    }

    if (settings.qrcode) {
        const loc = win.location;
        $qrcode.empty().append(kjua({
            render: 'image',
            size: 200,
            fill: settings.qrFill,
            back: settings.qrBack,
            text: loc.protocol + '//' + loc.host + item.absHref,
            crisp: true,
            quiet: 1
        }));
    }
}

function onMouseenter(item) {
    update(item);
}

function onMouseleave() {
    update(currentFolder);
}

function onLocationChanged(item) {
    currentFolder = item;
    update(currentFolder);
}

function init() {
    if (!settings.enabled) {
        return;
    }

    const $info = jq(template).appendTo('#mainrow');
    $img = $info.find('.icon img');
    $label = $info.find('.label');
    $time = $info.find('.time');
    $size = $info.find('.size');
    $content = $info.find('.content');
    $folders = $info.find('.folders');
    $files = $info.find('.files');
    $qrcode = $info.find('.qrcode');

    if (!settings.qrcode) {
        $qrcode.remove();
    }

    jq(settingsTemplate)
        .appendTo('#sidebar')
        .find('#view-info')
        .on('click', ev => {
            store.put(storekey, !store.get(storekey));
            updateSettings();
            ev.preventDefault();
        });

    // ensure stored value is boolean, otherwise set default
    if (typeof store.get(storekey) !== 'boolean') {
        store.put(storekey, settings.show);
    }
    updateSettings();

    event.sub('location.changed', onLocationChanged);
    event.sub('item.mouseenter', onMouseenter);
    event.sub('item.mouseleave', onMouseleave);
}


init();
