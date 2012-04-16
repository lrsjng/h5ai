<?php

require_once(str_replace("\\", "/", __DIR__) . "/inc/H5ai.php");


$h5ai = new H5ai();
$options = $h5ai->getOptions();


function fail($code, $msg, $cond = true) {
	if ($cond) {
		echo "$code: $msg";
		exit;
	}
}

function checkKeys($keys) {
	$values = array();
	foreach ($keys as $key) {
		fail(1, "parameter '$key' is missing", !array_key_exists($key, $_REQUEST));
		$values[] = $_REQUEST[$key];
	}
	return $values;
}


list($action) = checkKeys(array("action"));


if ($action === "httpcodes") {

	list($hrefs) = checkKeys(array("hrefs"));

	function getHttpCodes($h5ai, $hrefs) {

		$codes = array();
		foreach ($hrefs as $href) {
			$href = trim($href);
			if (strlen($href) > 0) {
				$codes[$href] = $h5ai->getHttpCode($href);
			}
		}
		return $codes;
	}

	$hrefs = preg_split("/;/", $hrefs);
	$codes = getHttpCodes($h5ai, $hrefs);

	echo count($codes) === 0 ? "{}" : json_encode($codes);
}


else if ($action === "thumb") {

	fail(0, "thumbs are disabled", !$options["thumbnails"]["enabled"]);
	list($srcAbsHref, $width, $height, $mode) = checkKeys(array("href", "width", "height", "mode"));

	H5ai::req_once("/php/inc/Thumbnail.php");
	H5ai::req_once("/php/inc/Image.php");

	$srcAbsPath = $h5ai->getRootAbsPath() . rawurldecode($srcAbsHref);

	if (!Thumbnail::isUsable()) {
		Image::showImage($srcAbsPath);
		exit;
	}

	$thumbnail = new Thumbnail($h5ai, $srcAbsHref, $mode, $width, $height);
	$thumbnail->create(1);
	if (file_exists($thumbnail->getPath())) {
		Image::showImage($thumbnail->getPath());
	} else {
		$image = new Image();
		$image->setSource($srcAbsPath);
		$image->thumb($mode, $width, $height);
		$image->showDest();
	}
}


else if ($action === "thumbsrc") {

	if (!$options["thumbnails"]["enabled"]) {
		echo json_encode(array("code" => 1, "absHref" => null));
		exit;
	}

	list($srcAbsHref, $width, $height, $mode) = checkKeys(array("href", "width", "height", "mode"));

	H5ai::req_once("/php/inc/Thumbnail.php");
	H5ai::req_once("/php/inc/Image.php");

	$srcAbsPath = $h5ai->getRootAbsPath() . rawurldecode($srcAbsHref);

	if (!Thumbnail::isUsable()) {
		echo json_encode(array("code" => 2, "absHref" => null));
		exit;
	}

	$thumbnail = new Thumbnail($h5ai, $srcAbsHref, $mode, $width, $height);
	$thumbnail->create(1);
	if (!file_exists($thumbnail->getPath())) {
		echo json_encode(array("code" => 3, "absHref" => null));
		exit;
	}

	echo json_encode(array("code" => 0, "absHref" => $thumbnail->getHref()));
}


else if ($action === "zip") {

	fail(0, "zipped download is disabled", !$options["zipped-download"]["enabled"]);
	list($hrefs) = checkKeys(array("hrefs"));

	H5ai::req_once("/php/inc/ZipIt.php");

	$zipit = new ZipIt($h5ai);

	$hrefs = explode(":", trim($hrefs));
	$zipFile = $zipit->zip($hrefs);

	if (is_string($zipFile)) {
		$response = array('status' => 'ok', 'id' => basename($zipFile), 'size' => filesize($zipFile));
	} else {
		$response = array('status' => 'failed', 'code' => $zipFile);
	}
	echo json_encode($response);
}


else if ($action === "getzip") {

	list($id) = checkKeys(array("id"));
	fail(1, "zipped file not found: " . $id, !preg_match("/^h5ai-zip-/", $id));

	$zipFile = str_replace("\\", "/", sys_get_temp_dir()) . "/" . $id;
	fail(2, "zipped file not found: " . $id, !file_exists($zipFile));

	header("Content-Disposition: attachment; filename=\"h5ai-selection.zip\"");
	header("Content-Type: application/octet-stream");
	header("Content-Length: " . filesize($zipFile));
	header("Connection: close");
	readfile($zipFile);
}


else if ($action === "checks") {

	$response = array(
		'php' => $h5ai->checks["php"],
		'cache' => $h5ai->checks["php"] && $h5ai->checks["cache"],
		'thumbs' => $h5ai->checks["php"] && $h5ai->checks["cache"] && $h5ai->checks["gd"],
		'temp' => $h5ai->checks["php"] && $h5ai->checks["temp"],
		'zips' => $h5ai->checks["php"] && $h5ai->checks["temp"] && $h5ai->checks["zip"]
	);
	echo json_encode($response);
}


else {
	fail(1, "unsupported 'action' specified");
}


?>