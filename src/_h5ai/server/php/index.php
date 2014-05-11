<?php


/* Bootstrap */

function normalize_path($path, $trailing_slash = false) {

	$path = str_replace("\\", "/", $path);
	return preg_match("#^(\w:)?/$#", $path) ? $path : (preg_replace('#/$#', '', $path) . ($trailing_slash ? "/" : ""));
}

define("APP_ABS_PATH", normalize_path(dirname(dirname(dirname(__FILE__)))));

function normalized_require_once($lib) {

	require_once(APP_ABS_PATH . $lib);
}


/* Init */

normalized_require_once("/server/php/inc/util.php");
normalized_require_once("/server/php/inc/App.php");
normalized_require_once("/server/php/inc/Item.php");
$app = App::from_env();


/* Run */

if (array_key_exists("action", $_REQUEST)) {

	header("Content-type: application/json;charset=utf-8");

	normalized_require_once("/server/php/inc/Api.php");
	$api = new Api($app);
	$api->apply();

} else {

	header("Content-type: text/html;charset=utf-8");

	$HREF = $app->get_app_abs_href();
	$FALLBACK = $app->get_fallback();

	normalized_require_once("/server/php/inc/page.php");
}

?>