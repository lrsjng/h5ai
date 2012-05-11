<?php
/*
 * h5ai %BUILD_VERSION%
 *
 * PHP Configuration
 * filesystem paths and file ignore rules
 */

global $H5AI_CONFIG;

$H5AI_CONFIG = array(

	/*
	 * This configuration assumes that h5ai is installed
	 * in the webroot directory of the Apache server.
	 */
	"ROOT_ABS_PATH" => dirname(dirname(__FILE__)),

	/*
	 * Files/folders that should not be listed. Specified
	 * by the complete filename or by a regular expression.
	 * http://www.php.net/manual/en/function.preg-match.php
	 */
	"IGNORE" => array(),
	"IGNORE_PATTERNS" => array("/^\\./", "/^_h5ai/"),

	/*
	 * Folders that contain one of these files will be considered
	 * as none h5ai folders.
	 */
	"INDEX_FILES" => array("index.html", "index.htm", "index.php")
);

?>