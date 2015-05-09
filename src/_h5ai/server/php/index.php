<?php

$basepath = preg_replace("#[\\\\/]+#", "/", dirname(__FILE__));

require_once($basepath . "/inc/version-check.php");
require_once($basepath . "/inc/class-bootstrap.php");

(new Bootstrap($basepath))->run();
