<?php

function normalize_path($path, $trailing_slash = false) {

	$path = str_replace("\\", "/", $path);
	return preg_match("#^(\w:)?/$#", $path) ? $path : (preg_replace('#/$#', '', $path) . ($trailing_slash ? "/" : ""));
}

define("APP_ABS_PATH", normalize_path(dirname(dirname(dirname(dirname(__FILE__))))));
define("APP_ABS_HREF", normalize_path(dirname(dirname(dirname(getenv("SCRIPT_NAME")))), true));

function normalized_require_once($lib) {

	require_once(APP_ABS_PATH . $lib);
}

normalized_require_once("/server/php/inc/util.php");
normalized_require_once("/server/php/inc/App.php");
normalized_require_once("/server/php/inc/Entry.php");
normalized_require_once("/conf/config.php");

$APP = new H5ai(APP_ABS_PATH, APP_ABS_HREF);

?>