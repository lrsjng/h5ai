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
normalized_require_once("class-image");

setup();
$app = new App();
$options = $app->get_options();
if ($options["security"]["enabled"] && (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])
	|| ($_SERVER['PHP_AUTH_USER'] !== $options["security"]["login"] )
	|| ($_SERVER['PHP_AUTH_PW'] !== $options["security"]["pass"])) ) {

	header('WWW-Authenticate: Basic realm='.$options["security"]["message"]);
	header('HTTP/1.0 401 Unauthorized');
	echo 'Acces non autorisé';
	exit;
}
else if (has_request_param("action")) {

	header("Content-type: application/json;charset=utf-8");
	$api = new Api($app);
	$api->apply();

} else {

	header("Content-type: text/html;charset=utf-8");
	define("FALLBACK", $app->get_fallback());
	normalized_require_once("page");
}
