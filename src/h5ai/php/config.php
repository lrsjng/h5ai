<?php

global $H5AI_CONFIG;
$H5AI_CONFIG = array();

$H5AI_CONFIG["DOCUMENT_ROOT"] = getenv("DOCUMENT_ROOT");
$H5AI_CONFIG["H5AI_ROOT"] = getenv("DOCUMENT_ROOT") . "/h5ai";

# Files/folders that should never be listed. Specified
# by the complete filename or by a regular expression.
# http://www.php.net/manual/en/function.preg-match.php
$H5AI_CONFIG["IGNORE"] = array("h5ai", "h5ai.header.html", "h5ai.footer.html");
$H5AI_CONFIG["IGNORE_PATTERNS"] = array("/^\\./");

?>