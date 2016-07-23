const kjua = require('kjua');
const {isNum, dom} = require('../util');
const event = require('../core/event');
const format = require('../core/format');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const store = require('../core/store');


const settings = Object.assign({
    enabled: false,
    show: false,
    qrcode: true,
    qrColor: '#999'
}, allsettings.info);
const tpl =
        `<div id="info">
            <div class="icon"><img/></div>
            <div class="block">
                <div class="label"></div>
                <div class="time"></div>
                <div class="size"></div>
                <div class="content">
                    <span class="folders"></span> <span class="l10n-folders"></span>,
                    <span class="files"></span> <span class="l10n-files"></span>
                </div>
            </div>
            <div class="qrcode"/>
        </div>`;
const settingsTpl =
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


const updateSettings = () => {
    if (store.get(storekey)) {
        dom('#view-info').addCls('active');
        dom('#info').show();
    } else {
        dom('#view-info').rmCls('active');
        dom('#info').hide();
    }
};

const update = item => {
    let src = item.thumbRational || item.icon;
    const isThumb = !!item.thumbRational;

    if (item.isCurrentFolder() || !src) {
        src = resource.icon('folder');
    }

    $img.attr('src', src);
    if (isThumb) {
        $img.addCls('thumb');
    } else {
        $img.rmCls('thumb');
    }

    $label.text(item.label);
    if (isNum(item.time)) {
        $time.text(format.formatDate(item.time));
    } else {
        $time.text('.');
    }

    if (isNum(item.size)) {
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
        const loc = global.window.location;
        $qrcode.clr().app(kjua({
            render: 'image',
            size: 200,
            fill: settings.qrFill,
            back: settings.qrBack,
            text: loc.protocol + '//' + loc.host + item.absHref,
            crisp: true,
            quiet: 1
        }));
    }
};

const onMouseenter = item => {
    update(item);
};

const onMouseleave = () => {
    update(currentFolder);
};

const onLocationChanged = item => {
    currentFolder = item;
    update(currentFolder);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    const $info = dom(tpl).hide().appTo('#mainrow');
    $img = $info.find('.icon img');
    $label = $info.find('.label');
    $time = $info.find('.time');
    $size = $info.find('.size');
    $content = $info.find('.content');
    $folders = $info.find('.folders');
    $files = $info.find('.files');
    $qrcode = $info.find('.qrcode');

    if (!settings.qrcode) {
        $qrcode.rm();
    }

    dom(settingsTpl)
        .appTo('#sidebar')
        .find('#view-info')
        .on('click', ev => {
            store.put(storekey, !store.get(storekey));
            updateSettings();
            event.pub('resize');
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
};


init();
