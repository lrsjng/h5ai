<?php

define('H5AI_VERSION', '{{VERSION}}');
define('MIN_PHP_VERSION', '5.5.0');

if (!function_exists('version_compare') || version_compare(PHP_VERSION, MIN_PHP_VERSION, '<')) {
    header('Content-type: text/plain;charset=utf-8');
    exit('[ERR] h5ai requires PHP ' . MIN_PHP_VERSION . ' or later, but found PHP ' . PHP_VERSION);
}

require_once __DIR__ . '/../private/php/class-bootstrap.php';
Bootstrap::run();
