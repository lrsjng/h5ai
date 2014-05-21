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


function use_request_param($key, $default = null) {

	if (!array_key_exists($key, $_REQUEST)) {
		json_fail(101, "parameter '$key' is missing", $default === null);
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


function load_commented_json($path) {

	if (!file_exists($path)) {
		return array();
	}

	$content = file_get_contents($path);

	// remove comments to get pure json
	$content = preg_replace("/\/\*.*?\*\/|\/\/.*?(\n|$)/s", "", $content);

	return json_decode($content, true);
}


function passthru_cmd($cmd) {

	$rc = null;
	passthru($cmd, $rc);
	return $rc;
}


function exec_cmdv($cmdv) {

	if (!is_array($cmdv)) {
		$cmdv = func_get_args();
	}
	$cmd = implode(" ", array_map("escapeshellarg", $cmdv));

	$lines = array();
	$rc = null;
	exec($cmd, $lines, $rc);
	return implode("\n", $lines);
}


// debug tools

function err_log($message, $obj = null) {

	error_log($message . ": " . var_export($obj, true));
}


function scr_log($message, $obj = null) {

	echo("<pre>" . $message . ": " . var_export($obj, true) . "</pre>\n");
}


global $__TIMER_START, $__TIMER_PREV;
$__TIMER_START = microtime(true);
$__TIMER_PREV = $__TIMER_START;

function time_log($message) {

	global $__TIMER_START, $__TIMER_PREV;

	$now = microtime(true);

	if ($__TIMER_START === $__TIMER_PREV) {
		error_log("------------------------------");
		register_shutdown_function(function () { time_log('ex'); });
	}

	error_log($message . "    DT " . number_format($now - $__TIMER_PREV, 5) . "    TT " . number_format($now - $__TIMER_START, 5));

	$__TIMER_PREV = $now;
}
