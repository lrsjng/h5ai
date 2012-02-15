<?php
/*
 * h5ai %BUILD_VERSION%
 *
 * PHP Configuration
 * filesystem paths and file ignore rules
 */

global $H5AI_CONFIG;
$H5AI_CONFIG = array();

/*
 * This configuration assumes that h5ai is installed
 * in the webroot directory of the Apache server.
 */
$H5AI_CONFIG["ROOT_ABS_PATH"] = safe_dirname(safe_dirname(__FILE__));

/*
 * Files/folders that should not be listed. Specified
 * by the complete filename or by a regular expression.
 * http://www.php.net/manual/en/function.preg-match.php
 */
$H5AI_CONFIG["IGNORE"] = array();
$H5AI_CONFIG["IGNORE_PATTERNS"] = array("/^\\./", "/^_h5ai/");

?>