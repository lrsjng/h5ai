<?php

function normalize_path($path, $trailing_slash = false) {

	$path = str_replace("\\", "/", $path);
	return preg_match("#^(\w:)?/$#", $path) ? $path : (rtrim($path, "/") . ($trailing_slash ? "/" : ""));
}

function json_exit($obj = array()) {

	$obj["code"] = 0;
	echo json_encode($obj);
	exit;
}

function json_fail($code, $msg = "", $cond = true) {

	if ($cond) {
		echo json_encode(array("code" => $code, "msg" => $msg));
		exit;
	}
}

function has_request_param($key) {

	return array_key_exists($key, $_REQUEST);
}

function use_request_params($keys) {

	if (!is_array($keys)) {
		$keys = func_get_args();
	}

	$values = array();
	foreach ($keys as $key) {
		json_fail(101, "parameter '$key' is missing", !array_key_exists($key, $_REQUEST));
		$values[] = $_REQUEST[$key];
		unset($_REQUEST[$key]);
	}
	return $values;
}

function use_optional_request_params($keys) {

	if (!is_array($keys)) {
		$keys = func_get_args();
	}

	$values = array();
	foreach ($keys as $key) {
		if (array_key_exists($key, $_REQUEST)) {
			$values[] = $_REQUEST[$key];
			unset($_REQUEST[$key]);
		} else {
			$values[] = null;
		}
	}
	return $values;
}

function starts_with($sequence, $head) {

	return substr($sequence, 0, strlen($head)) === $head;
}

function ends_with($sequence, $tail) {

	return substr($sequence, -strlen($tail)) === $tail;
}

function load_commented_json($file) {

	if (!file_exists($file)) {
		return array();
	}

	$str = file_get_contents($file);

	// remove comments to get pure json
	$str = preg_replace("/\/\*.*?\*\/|\/\/.*?(\n|$)/s", "", $str);

	return json_decode($str, true);
}

function exec_cmd($cmd) {

	$lines = array();
	$rc = null;
	exec($cmd, $lines, $rc);
	return implode("\n", $lines);
}

function passthru_cmd($cmd) {

	$rc = null;
	passthru($cmd, $rc);
	return $rc;
}

?>