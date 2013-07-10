<?php


// bootstrap

function normalize_path($path, $trailing_slash = false) {

	$path = str_replace("\\", "/", $path);
	return preg_match("#^(\w:)?/$#", $path) ? $path : (preg_replace('#/$#', '', $path) . ($trailing_slash ? "/" : ""));
}

define("APP_ABS_PATH", normalize_path(dirname(dirname(dirname(__FILE__)))));
// define("APP_ABS_HREF", normalize_path(dirname(dirname(dirname(getenv("SCRIPT_NAME")))), true));
define("APP_ABS_HREF", normalize_path(dirname(dirname(dirname(preg_replace('#^.*//#', '/', getenv("SCRIPT_NAME"))))), true)); // fixes lighttpd issues
define("ABS_HREF", normalize_path(preg_replace('/[^\\/]*$/', '', getenv("REQUEST_URI")), true));

function normalized_require_once($lib) {

	require_once(APP_ABS_PATH . $lib);
}


// load libs

normalized_require_once("/server/php/inc/util.php");
normalized_require_once("/server/php/inc/App.php");
normalized_require_once("/server/php/inc/Item.php");


// init

$app = new App(APP_ABS_PATH, APP_ABS_HREF, ABS_HREF);


// run

if (array_key_exists("action", $_REQUEST)) {

	header("Content-type: application/json;charset=utf-8");

	normalized_require_once("/server/php/inc/Api.php");
	$api = new Api($app);
	$api->apply();

	json_fail(100, "unsupported request");

} else {

	header("Content-type: text/html;charset=utf-8");

	$HREF = $app->get_app_abs_href();
	$FALLBACK = $app->get_no_js_fallback();

	normalized_require_once("/server/php/inc/page.php");
}

?>