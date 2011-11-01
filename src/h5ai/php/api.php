<?php


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


require_once "config.php";
require_once "inc/H5ai.php";
$h5ai = new H5ai();
$options = $h5ai->getOptions();


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

    require_once "inc/Thumbnail.php";
    require_once "inc/Image.php";

    $srcAbsPath = $h5ai->getDocRoot() . rawurldecode($srcAbsHref);

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

    require_once "inc/Tree.php";

    $absHref = trim($href);
    $absPath = $h5ai->getAbsPath($absHref);

    $tree = new TreeEntry($h5ai, $absPath, $absHref);
    $tree->loadContent();

    echo $tree->contentToHtml();
}


else if ($action === "zip") {

    fail(0, "zipped download is disabled", !$options["zippedDownload"]);
    list($hrefs) = checkKeys(array("hrefs"));

    require_once "inc/ZipIt.php";

    $zipit = new ZipIt($h5ai);

    $hrefs = explode(":", trim($hrefs));
    $zipFile = $zipit->zip($hrefs);

    if ($zipFile === false) {
        fail(2, "something went wrong while building the zip");
    }

    header("Content-Disposition: attachment; filename=\"h5ai-selection.zip\"");
    header("Content-Type: application/force-download");
    header("Content-Length: " . filesize($zipFile));
    header("Connection: close");
    readfile($zipFile);
}


else {
    fail(1, "unsupported 'action' specified");
}


?>