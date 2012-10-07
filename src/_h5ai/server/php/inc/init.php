<?php

function normalize_path($path, $trailing_slash = false) {

	$path = str_replace("\\", "/", $path);
	return preg_match("#^(\w:)?/$#", $path) ? $path : (preg_replace('#/$#', '', $path) . ($trailing_slash ? "/" : ""));
}

define("APP_ABS_PATH", normalize_path(dirname(dirname(dirname(dirname(__FILE__))))));
define("APP_ABS_HREF", normalize_path(dirname(dirname(dirname(getenv("SCRIPT_NAME")))), true));
define("ABS_HREF", normalize_path(preg_replace('/[^\\/]*$/', '', getenv("REQUEST_URI")), true));

function normalized_require_once($lib) {

	require_once(APP_ABS_PATH . $lib);
}

normalized_require_once("/server/php/inc/util.php");
normalized_require_once("/server/php/inc/App.php");
normalized_require_once("/server/php/inc/Entry.php");

$APP = new App(APP_ABS_PATH, APP_ABS_HREF, ABS_HREF);

if (array_key_exists("api", $_REQUEST)) {

	use_request_params("api");
	normalized_require_once("/server/php/inc/Api.php");
	$api = new Api($APP);
	$api->apply();
}

?>