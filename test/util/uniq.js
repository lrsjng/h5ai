(function () {
'use strict';

var PREFIX = 'UQ';
var SUFFIX = 'ID';
var LENGTH = 4;
var RE = new RegExp('^' + PREFIX + '\\d{' + LENGTH + '}' + SUFFIX + '$');

var counter = 0;

function uniqId() {

    counter += 1;
    return PREFIX + ('00000000' + counter).substr(-LENGTH) + SUFFIX;
}

function uniqObj() {

    return {uniqId: uniqId()};
}

function isUniqId(uid) {

    return RE.test(uid);
}

window.util = window.util || {};
window.util.uniqId = uniqId;
window.util.uniqObj = uniqObj;
window.util.isUniqId = isUniqId;

}());
