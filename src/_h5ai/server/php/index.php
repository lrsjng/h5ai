<?php

function normalize_path($path, $trailing_slash = false) {

	$path = preg_replace("#\\+|/+#", "/", $path);
	return preg_match("#^(\w:)?/$#", $path) ? $path : (rtrim($path, "/") . ($trailing_slash ? "/" : ""));
}

function normalized_require_once($lib) {

	require_once(normalize_path(dirname(__FILE__) . "/inc/" . $lib, false));
}

normalized_require_once("main.php");

?>