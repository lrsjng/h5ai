<?php

require_once(str_replace("\\", "/", dirname(__FILE__)) . "/inc/H5ai.php");


$h5ai = new H5ai(__FILE__);
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

	H5ai::req_once("/php/inc/Thumb.php");
	if (!Thumb::is_supported()) {
		json_fail(2, "thumbnails not supported");
	}

	list($type, $srcAbsHref, $mode, $width, $height) = check_keys(array("type", "href", "mode", "width", "height"));

	$thumb = new Thumb($h5ai);
	$thumbHref = $thumb->thumb($type, $srcAbsHref, $mode, $width, $height);
	if ($thumbHref === null) {
		json_fail(3, "thumbnail creation failed");
	}

	json_exit(array("absHref" => $thumbHref));
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

	$php = version_compare(PHP_VERSION, "5.2.1") >= 0;
	$archive = class_exists("PharData");
	$gd = false;
	if (function_exists("gd_info")) {
		$gdinfo = gd_info();
		$gd = array_key_exists("JPG Support", $gdinfo) && $gdinfo["JPG Support"] || array_key_exists("JPEG Support", $gdinfo) && $gdinfo["JPEG Support"];
	}
	$cache = is_writable($h5ai->getH5aiAbsPath() . "/cache");
	$temp = is_writable(sys_get_temp_dir());
	$tar = preg_match("/tar$/", `which tar`) > 0;
	$zip = preg_match("/zip$/", `which zip`) > 0;
	$convert = preg_match("/convert$/", `which convert`) > 0;
	$ffmpeg = preg_match("/ffmpeg$/", `which ffmpeg`) > 0;
	$du = preg_match("/du$/", `which du`) > 0;

	json_exit(array(
		"php" => $php,
		"cache" => $cache,
		"thumbs" => $gd,
		"temp" => $temp,
		"archive" => $archive,
		"tar" => $tar,
		"zip" => $zip,
		"convert" => $convert,
		"ffmpeg" => $ffmpeg,
		"du" => $du
	));
}


else if ($action === "getentries") {

	list($href, $content) = check_keys(array("href", "content"));

	$content = intval($content, 10);

	json_exit(array("entries" => $h5ai->getEntries($href, $content)));
}


else {
	json_fail(100, "unsupported action");
}


?>