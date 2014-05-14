<?php

putenv("LANG=en_US.UTF-8");
date_default_timezone_set("UTC");

normalized_require_once("util.php");
normalized_require_once("App.php");
normalized_require_once("Item.php");


function create_app() {

	$server_name = null;
	$server_version = null;
	$server_software = getenv("SERVER_SOFTWARE");
	if ($server_software && preg_match("#^(.*?)/(.*?)(?: |$)#", strtolower($server_software), $matches)) {
		$server_name = $matches[1];
		$server_version = $matches[2];
	}

	$app_abs_path = normalize_path(dirname(dirname(dirname(dirname(__FILE__)))));

	$script_name = getenv("SCRIPT_NAME");
	if ($server_name === "lighttpd") {
		$script_name = preg_replace("#^.*//#", "/", $script_name);
	}
	$app_abs_href = dirname(dirname(dirname($script_name)));

	$url_parts = parse_url(getenv("REQUEST_URI"));
	$abs_href = $url_parts["path"];

	return new App($server_name, $server_version, $app_abs_path, $app_abs_href, $abs_href);
}


$app = create_app();


if (has_request_param("action")) {

	header("Content-type: application/json;charset=utf-8");

	normalized_require_once("Api.php");
	$api = new Api($app);
	$api->apply();

} else {

	header("Content-type: text/html;charset=utf-8");

	global $HREF, $FALLBACK;
	$HREF = $app->get_app_abs_href();
	$FALLBACK = $app->get_fallback();
	normalized_require_once("page.php");
}

?>