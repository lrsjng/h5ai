<?php
/*
 * h5ai {{version}}
 *
 * PHP Configuration
 * filesystem paths and file ignore rules
 */

global $H5AI_CONFIG;

$H5AI_CONFIG = array(

	/*
	 * Files/folders that should not be listed. Specified
	 * by the complete filename or by a regular expression.
	 * http://www.php.net/manual/en/function.preg-match.php
	 */
	"IGNORE" => array(),
	"IGNORE_PATTERNS" => array("/^\\./", "/^_h5ai/"),

	/*
	 * Folders that contain one of these files will be considered
	 * not to be h5ai indexed folders.
	 */
	"INDEX_FILES" => array("index.html", "index.htm", "index.php")
);

?>