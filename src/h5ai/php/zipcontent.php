<?php

if (!array_key_exists("hrefs", $_REQUEST)) {
    echo "failed";
    exit;
}

require_once "h5ai.php";
require_once "zipit.php";

$h5ai = new H5ai();
$zipit = new ZipIt($h5ai);

$hrefs = explode(":", trim($_REQUEST["hrefs"]));

$zipFile = $zipit->zip($hrefs);

if ($zipFile !== false) {
    header("Content-Disposition: attachment; filename=\"h5ai-selection.zip\"");
    header("Content-Type: application/force-download");
    header("Content-Length: " . filesize($zipFile));
    header("Connection: close");
    readfile($zipFile);
} else {
    echo "sorry, something went wrong while building the zip.";
}

?>