<?php

define('MIN_PHP_VERSION', '5.4.0');

if (version_compare(PHP_VERSION, MIN_PHP_VERSION, '<')) {
    header('Content-type: text/plain;charset=utf-8');
    echo '[{{pkg.name}} {{pkg.version}}]  PHP ' . MIN_PHP_VERSION . '+ required, only found PHP ' . PHP_VERSION;
    exit;
}

require_once __DIR__ . '/../backend/php/class-bootstrap.php';
Bootstrap::main();
