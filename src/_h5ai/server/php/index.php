<?php

define("BASE_PATH", preg_replace("#[\\\\/]+#", "/", dirname(__FILE__)));

require_once(BASE_PATH . "/inc/version-check.php");
require_once(BASE_PATH . "/inc/class-bootstrap.php");

(new Bootstrap(BASE_PATH))->run();
