<?php

if (!array_key_exists("hrefs", $_REQUEST)) {
    echo "failed";
    exit;
}

require_once "h5ai.php";
require_once "zipit.php";

$h5ai = new H5ai();
$zipit = new ZipIt($h5ai);

$files = explode(":", trim($_REQUEST["hrefs"]));

$zipFile = $zipit->zip($files);

header("Content-Disposition: attachment; filename=\"h5ai-selection.zip\"");
header("Content-Type: application/force-download");
header("Content-Length: " . filesize($zipFile));
header("Connection: close");
readfile($zipFile);

?>