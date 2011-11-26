<?php

require_once "config.php";
require_once "inc/H5ai.php";
require_once "inc/Crumb.php";
require_once "inc/Customize.php";
require_once "inc/Extended.php";
require_once "inc/Tree.php";

$h5ai = new H5ai();
$crumb = new Crumb($h5ai);
$customize = new Customize($h5ai);
$extended = new Extended($h5ai);
$tree = new Tree($h5ai);

?>