<?php

function normalize_path($path, $trailing_slash = false) {

	$path = preg_replace("#\\+|/+#", "/", $path);
	return preg_match("#^(\w:)?/$#", $path) ? $path : (rtrim($path, "/") . ($trailing_slash ? "/" : ""));
}

function normalized_require_once($lib) {

	require_once(normalize_path(dirname(__FILE__) . "/inc/${lib}.php", false));
}

normalized_require_once("util");
normalized_require_once("setup");
normalized_require_once("class-api");
normalized_require_once("class-app");
normalized_require_once("class-archive");
normalized_require_once("class-item");
normalized_require_once("class-thumb");

setup();
$app = new App();

if (has_request_param("action")) {

	header("Content-type: application/json;charset=utf-8");
	$api = new Api($app);
	$api->apply();

} else {

	header("Content-type: text/html;charset=utf-8");
	define("FALLBACK", $app->get_fallback());
	normalized_require_once("page");
}
