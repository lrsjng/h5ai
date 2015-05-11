<?php

define('MIN_PHP_VERSION', '5.4.0');

if (version_compare(PHP_VERSION, MIN_PHP_VERSION) < 0) {
    header('Content-type: application/json;charset=utf-8');
    echo '{"err":"ERR_PHP","msg":"PHP ' . MIN_PHP_VERSION . '+ required","ver":"' . PHP_VERSION . '"}';
    exit;
}

$basepath = preg_replace('#[\\\\/]+#', '/', dirname(__FILE__));
require_once $basepath . '/inc/class-bootstrap.php';

$bootstrap = new Bootstrap($basepath);
$bootstrap->run();
