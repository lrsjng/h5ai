<?php

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

define("NO_DEFAULT", "__NO_DEFAULT_VALUE__");
function use_request_param($key, $default = NO_DEFAULT) {

	if (!array_key_exists($key, $_REQUEST)) {
		json_fail(101, "parameter '$key' is missing", $default === NO_DEFAULT);
		return $default;
	}

	$value = $_REQUEST[$key];
	unset($_REQUEST[$key]);
	return $value;
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