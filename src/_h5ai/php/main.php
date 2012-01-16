<?php

require_once(dirname(__FILE__) . '/config.php');
require_once(dirname(__FILE__) . '/inc/H5ai.php');
require_once(dirname(__FILE__) . '/inc/Crumb.php');
require_once(dirname(__FILE__) . '/inc/Customize.php');
require_once(dirname(__FILE__) . '/inc/Extended.php');
require_once(dirname(__FILE__) . '/inc/Tree.php');

$h5ai = new H5ai();
$crumb = new Crumb($h5ai);
$customize = new Customize($h5ai);
$extended = new Extended($h5ai);
$tree = new Tree($h5ai);

?>