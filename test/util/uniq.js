(function () {
'use strict';

var PREFIX = 'UNIQ-';
var SUFFIX = '-ID';
var LENGTH = 4;
var RE = new RegExp('^' + PREFIX + '\\d{' + LENGTH + '}' + SUFFIX + '$');

var counter = 0;

function uniqId() {

    counter += 1;
    return PREFIX + ('00000000' + counter).substr(-LENGTH) + SUFFIX;
}

function isUniqId(uid) {

    return RE.test(uid);
}

function uniqObj() {

    return {uniqId: uniqId()};
}

function uniqPath(suffix) {

    return '/some/path/' + uniqId() + (suffix ? suffix : '');
}


window.util = window.util || {};
window.util.uniqId = uniqId;
window.util.isUniqId = isUniqId;
window.util.uniqObj = uniqObj;
window.util.uniqPath = uniqPath;

}());
