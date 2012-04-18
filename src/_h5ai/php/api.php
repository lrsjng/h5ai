<?php

require_once(str_replace("\\", "/", __DIR__) . "/inc/H5ai.php");


$h5ai = new H5ai();
$options = $h5ai->getOptions();


function json_exit($obj) {

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

function check_keys($keys) {
	$values = array();
	foreach ($keys as $key) {
		json_fail(101, "parameter '$key' is missing", !array_key_exists($key, $_REQUEST));
		$values[] = $_REQUEST[$key];
	}
	return $values;
}


list($action) = check_keys(array("action"));


if ($action === "getthumbsrc") {

	if (!$options["thumbnails"]["enabled"]) {
		json_fail(1, "thumbnails disabled");
	}

	list($srcAbsHref, $width, $height, $mode) = check_keys(array("href", "width", "height", "mode"));

	H5ai::req_once("/php/inc/Thumbnail.php");
	H5ai::req_once("/php/inc/Image.php");

	$srcAbsPath = $h5ai->getRootAbsPath() . rawurldecode($srcAbsHref);

	if (!Thumbnail::isUsable()) {
		json_fail(2, "thumbnails not supported");
	}

	$thumbnail = new Thumbnail($h5ai, $srcAbsHref, $mode, $width, $height);
	$thumbnail->create(1);
	if (!file_exists($thumbnail->getPath())) {
		json_fail(3, "thumbnail creation failed");
	}

	json_exit(array("absHref" => $thumbnail->getHref()));
}


else if ($action === "archive") {

	json_fail(1, "downloads disabled", !$options["download"]["enabled"]);

	list($execution, $format, $hrefs) = check_keys(array("execution", "format", "hrefs"));

	H5ai::req_once("/php/inc/Archive.php");
	$archive = new Archive($h5ai);

	$hrefs = explode(":", trim($hrefs));
	$target = $archive->create($execution, $format, $hrefs);

	if (!is_string($target)) {
		json_fail($target, "package creation failed");
	}

	json_exit(array("id" => basename($target), "size" => filesize($target)));
}


else if ($action === "getarchive") {

	json_fail(1, "downloads disabled", !$options["download"]["enabled"]);

	list($id, $as) = check_keys(array("id", "as"));
	json_fail(2, "file not found", !preg_match("/^h5ai-selection-/", $id));

	$target = H5ai::normalize_path(sys_get_temp_dir(), true) . $id;
	json_fail(3, "file not found", !file_exists($target));

	header("Content-Type: application/octet-stream");
	header("Content-Length: " . filesize($target));
	header("Content-Disposition: attachment; filename=\"$as\"");
	header("Connection: close");
	readfile($target);
}


else if ($action === "getchecks") {

	$php = $h5ai->checks["php"];
	$cache = $php && $h5ai->checks["cache"];
	$temp = $php && $h5ai->checks["temp"];

	json_exit(array(
		"php" => $php,
		"cache" => $cache,
		"thumbs" => $cache && $h5ai->checks["gd"],
		"temp" => $temp,
		"archive" => $temp && $h5ai->checks["archive"],
		"tar" => $temp && $h5ai->checks["tar"],
		"zip" => $temp && $h5ai->checks["zip"]
	));
}


else {
	json_fail(100, "unsupported action");
}


?>