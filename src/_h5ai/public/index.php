<?php

define('H5AI_VERSION', '{{VERSION}}');
define('MIN_PHP_VERSION', '7.0.0');

if (!function_exists('version_compare') || version_compare(PHP_VERSION, MIN_PHP_VERSION, '<')) {
    header('Content-type: text/plain;charset=utf-8');
    exit('[ERR] h5ai requires PHP ' . MIN_PHP_VERSION . ' or later, but found PHP ' . PHP_VERSION);
}

if (substr(H5AI_VERSION, 0, 1) === '{') {
    header('Content-type: text/plain;charset=utf-8');
    exit('[ERR] h5ai sources must be preprocessed to work correctly');
}

require_once __DIR__ . '/../private/php/class-bootstrap.php';
Bootstrap::run();
