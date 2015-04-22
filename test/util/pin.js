(function () {
'use strict';

var title;
var htmlClasses;
var $pinnedElements;

function pinHtml() {

    title = document.title;
    htmlClasses = $('html').attr('class');
    $pinnedElements = $('head,body').children();
}

function restoreHtml() {

    document.title = title;
    $('html').attr('class', htmlClasses);
    $('head,body').children().not($pinnedElements).remove();
}

window.util = window.util || {};
window.util.pinHtml = pinHtml;
window.util.restoreHtml = restoreHtml;

}());
