const jq = window.jQuery;
let title;
let htmlId;
let htmlClasses;
let bodyId;
let bodyClasses;
let $pinnedElements;

function pinHtml() {
    title = document.title;
    htmlId = jq('html').attr('id');
    htmlClasses = jq('html').attr('class');
    bodyId = jq('body').attr('id');
    bodyClasses = jq('body').attr('class');
    $pinnedElements = jq('head,body').children();
}

function restoreHtml() {
    document.title = title;
    jq('html').attr('id', htmlId);
    jq('html').attr('class', htmlClasses);
    jq('body').attr('id', bodyId);
    jq('body').attr('class', bodyClasses);
    jq('head,body').children().not($pinnedElements).remove();
    if (window.localStorage && window.localStorage.clear) {
        window.localStorage.clear();
    }
}

module.exports = {
    pinHtml,
    restoreHtml
};
