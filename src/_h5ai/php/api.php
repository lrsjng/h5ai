<?php

function safe_dirname($path, $endWithSlash = false) {

	$path = str_replace("\\", "/", dirname($path));
	return preg_match("#^(\w:)?/$#", $path) ? $path : (preg_replace('#/$#', '', $path) . ($endWithSlash ? "/" : ""));
}

define("H5AI_ABS_PATH", safe_dirname(safe_dirname(__FILE__)));

function require_h5ai($lib) {

	require_once(H5AI_ABS_PATH . $lib);
}


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


require_h5ai("/php/inc/H5ai.php");
$h5ai = new H5ai();
$options = $h5ai->getOptions();


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

	fail(0, "thumbs are disabled", !$options["showThumbs"]);
	list($srcAbsHref, $width, $height, $mode) = checkKeys(array("href", "width", "height", "mode"));

	require_h5ai("/php/inc/Thumbnail.php");
	require_h5ai("/php/inc/Image.php");

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


else if ($action === "tree") {

	list($href) = checkKeys(array("href"));

	require_h5ai("/php/inc/Tree.php");

	$absHref = trim($href);
	$absPath = $h5ai->getAbsPath($absHref);

	$tree = new TreeEntry($h5ai, $absPath, $absHref);
	$tree->loadContent();

	echo $tree->contentToHtml();
}


else if ($action === "zip") {

	fail(0, "zipped download is disabled", !$options["zippedDownload"]);
	list($hrefs) = checkKeys(array("hrefs"));

	require_h5ai("/php/inc/ZipIt.php");

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
		'php' => true,
		'zips' => class_exists("ZipArchive"),
		'thumbs' => GD_VERSION != "GD_VERSION"
	);
	echo json_encode($response);
}


else {
	fail(1, "unsupported 'action' specified");
}


?>