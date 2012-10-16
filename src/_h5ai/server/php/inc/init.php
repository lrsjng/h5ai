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

$app = new App(APP_ABS_PATH, APP_ABS_HREF, ABS_HREF);

// if (count($_REQUEST)) {
if (array_key_exists("action", $_REQUEST)) {

	header("Content-type: application/json");

	normalized_require_once("/server/php/inc/Api.php");
	$api = new Api($app);
	$api->apply();

	json_fail(100, "unsupported request");

} else {

	$HREF = $app->get_app_abs_href();
	$JSON = $app->get_generic_json();
	$FALLBACK = $app->get_no_js_fallback();
}

?>