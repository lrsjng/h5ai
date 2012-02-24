<?php

function safe_dirname($path, $endWithSlash = false) {
	
	$path = str_replace("\\", "/", dirname($path));
	return preg_match("#^(\w:)?/$#", $path) ? $path : (preg_replace('#/$#', '', $path) . ($endWithSlash ? "/" : ""));
}

define("H5AI_ABS_PATH", safe_dirname(safe_dirname(__FILE__)));

function require_h5ai($lib) {

	require_once(H5AI_ABS_PATH . $lib);
}

require_h5ai("/php/inc/H5ai.php");
require_h5ai("/php/inc/Crumb.php");
require_h5ai("/php/inc/Customize.php");
require_h5ai("/php/inc/Extended.php");
require_h5ai("/php/inc/Tree.php");

$h5ai = new H5ai();
$crumb = new Crumb($h5ai);
$customize = new Customize($h5ai);
$extended = new Extended($h5ai);
$tree = new Tree($h5ai);

?>