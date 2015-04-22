(function () {
'use strict';

var htmlClasses;
var $pinnedElements;

function pinHtml() {

    htmlClasses = $('html').attr('class');
    $pinnedElements = $('head,body').children();
}

function restoreHtml() {

    $('html').attr('class', htmlClasses);
    $('head,body').children().not($pinnedElements).remove();
}

window.util = window.util || {};
window.util.pinHtml = pinHtml;
window.util.restoreHtml = restoreHtml;

}());
