<?php

define('MIN_PHP_VERSION', '5.4.0');

if (version_compare(PHP_VERSION, MIN_PHP_VERSION, '<')) {
    header('Content-type: application/json;charset=utf-8');
    echo '{"err":"ERR_PHP","msg":"PHP ' . MIN_PHP_VERSION . '+ required","ver":"' . PHP_VERSION . '"}';
    exit;
}

require_once __DIR__ . '/../backend/php/class-bootstrap.php';
Bootstrap::main();
