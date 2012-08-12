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


else if ($action === "upload") {

	list($href) = check_keys(array("href"));

	json_fail(1, "wrong HTTP method", strtolower($_SERVER["REQUEST_METHOD"]) !== "post");
	json_fail(2, "something went wrong", !array_key_exists("userfile", $_FILES));

	$userfile = $_FILES["userfile"];

	json_fail(3, "something went wrong [" . $userfile["error"] . "]", $userfile["error"] !== 0);
	json_fail(4, "folders not supported", file_get_contents($userfile["tmp_name"]) === "null");

	$upload_dir = $h5ai->getAbsPath($href);
	$code = $h5ai->getHttpCode($href);

	json_fail(5, "upload dir no h5ai folder or ignored", $code !== "h5ai" || $h5ai->is_ignored($upload_dir));

	$dest = $upload_dir . "/" . utf8_encode($userfile["name"]);

	json_fail(6, "already exists", file_exists($dest));
	json_fail(7, "can't move uploaded file", !move_uploaded_file($userfile["tmp_name"], $dest));

	json_exit();
}


else if ($action === "delete") {

	json_fail(1, "deletion disabled", !$options["delete"]["enabled"]);

	list($hrefs) = check_keys(array("hrefs"));

	$hrefs = explode(":", trim($hrefs));
	$errors = array();

	foreach ($hrefs as $href) {

		$d = H5ai::normalize_path(dirname($href), true);
		$n = basename($href);

		$code = $h5ai->getHttpCode($d);
		if ($code == 401) {
		}

		if ($code == "h5ai" && !$h5ai->is_ignored($n)) {

			$absPath = $h5ai->getAbsPath($href);

			if (!unlink($absPath)) {
				$errors[] = $href;
			}
		}
	}

	if ($errors->size) {
		json_fail(2, "deletion failed for some");
	} else {
		json_exit();
	}
}


else if ($action === "rename") {

	json_fail(1, "renaming disabled", !$options["rename"]["enabled"]);

	list($href, $name) = check_keys(array("href", "name"));

	$d = H5ai::normalize_path(dirname($href), true);
	$n = basename($href);

	$code = $h5ai->getHttpCode($d);
	if ($code == 401) {
	}

	if ($code == "h5ai" && !$h5ai->is_ignored($n)) {

		$absPath = $h5ai->getAbsPath($href);
		$folder = H5ai::normalize_path(dirname($absPath));

		if (!rename($absPath, $folder . "/" . $name)) {
			json_fail(2, "renaming failed");
		}
	}

	json_exit();
}


else {
	json_fail(100, "unsupported action");
}


?>