<?php

require_once "h5ai.php";
require_once "crumb.php";
require_once "customize.php";
require_once "extended.php";
require_once "tree.php";

$h5ai = new H5ai();
$crumb = new Crumb( $h5ai );
$customize = new Customize( $h5ai );
$extended = new Extended( $h5ai );
$tree = new Tree( $h5ai );

?>