<?php


function setup() {


	// MISC
	putenv("LANG=en_US.UTF-8");
	setlocale(LC_CTYPE, "en_US.UTF-8");
	date_default_timezone_set("UTC");

	define("BACKEND", "PHP");
	define("API", true);
	define("MAGIC_SEQUENCE", "={{pkg.name}}=");
	define("FILE_PREFIX", "_{{pkg.name}}");


	// PHP
	define("MIN_PHP_VERSION", "5.3.0");
	define("HAS_PHP_VERSION", version_compare(PHP_VERSION, MIN_PHP_VERSION) >= 0);
	define("HAS_PHP_EXIF", function_exists("exif_thumbnail"));
	$has_php_jpg = false;
	if (function_exists("gd_info")) {
		$infos = gd_info();
		$has_php_jpg = array_key_exists("JPG Support", $infos) && $infos["JPG Support"] || array_key_exists("JPEG Support", $infos) && $infos["JPEG Support"];
	}
	define("HAS_PHP_JPG", $has_php_jpg);


	// SERVER
	$server_name = null;
	$server_version = null;
	$server_software = getenv("SERVER_SOFTWARE");
	if ($server_software && preg_match("#^(.*?)/(.*?)(?: |$)#", strtolower($server_software), $matches)) {
		$server_name = $matches[1];
		$server_version = $matches[2];
	}
	define("SERVER_NAME", $server_name);
	define("SERVER_VERSION", $server_version);
	define("HAS_WIN_OS", strtolower(substr(PHP_OS, 0, 3)) === "win");


	// PATHS
	$script_name = getenv("SCRIPT_NAME");
	if (SERVER_NAME === "lighttpd") {
		$script_name = preg_replace("#^.*//#", "/", $script_name);
	}
	define("APP_URL", normalize_path(dirname(dirname(dirname($script_name))), true));
	define("APP_PATH", normalize_path(dirname(dirname(dirname(dirname(__FILE__)))), false));

	define("ROOT_URL", normalize_path(dirname(APP_URL), true));
	define("ROOT_PATH", normalize_path(dirname(APP_PATH), false));

	$url_parts = parse_url(getenv("REQUEST_URI"));
	$cur_url = normalize_path($url_parts["path"], true);
	$rel_url = substr($cur_url, strlen(ROOT_URL));
	$cur_path = normalize_path(ROOT_PATH . "/" . rawurldecode($rel_url));
	if (!is_dir($cur_path)) {
		$cur_url = normalize_path(dirname($cur_url), true);
		$cur_path = normalize_path(dirname($cur_path), false);
	}
	define("CURRENT_URL", $cur_url);
	define("CURRENT_PATH", $cur_path);

	define("INDEX_URL", normalize_path(APP_URL . "server/php/index.php", false));

	define("CACHE_URL", normalize_path(APP_URL . "cache", true));
	define("CACHE_PATH", normalize_path(APP_PATH . "/cache", false));
	define("HAS_WRITABLE_CACHE", @is_writable(CACHE_PATH));


	// EXTERNAL COMMANDS
	foreach (array("tar", "zip", "convert", "ffmpeg", "avconv", "du") as $cmd) {
		$cmdv = HAS_WIN_OS ? array("which", $cmd) : array("command", "-v", $cmd);
		define("HAS_CMD_" . strtoupper($cmd), @preg_match("#" . $cmd . "(.exe)?$#i", exec_cmdv($cmdv)) > 0);
	}
}

?>