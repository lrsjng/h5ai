<?php



function refl($id, $obj) {

	$s = "<pre class='refl'>";
	$s .= $id . "  " . var_export($obj, true);
	$s .= "</pre>\n";
	echo($s);
}


function init() {

	putenv("LANG=en_US.UTF-8");
	date_default_timezone_set("UTC");

	define("MIN_PHP_VERSION", "5.3.0");
	define("IS_PHP_VERSION_SUPPORTED", version_compare(PHP_VERSION, MIN_PHP_VERSION) >= 0);

	define("IS_WIN_OS", strtolower(substr(PHP_OS, 0, 3)) === "win");

	$server_name = null;
	$server_version = null;
	$server_software = getenv("SERVER_SOFTWARE");
	if ($server_software && preg_match("#^(.*?)/(.*?)(?: |$)#", strtolower($server_software), $matches)) {
		$server_name = $matches[1];
		$server_version = $matches[2];
	}
	define("SERVER_NAME", $server_name);
	define("SERVER_VERSION", $server_version);

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

	define("MAGIC_SEQUENCE", "={{pkg.name}}=");
	define("FILE_PREFIX", "_{{pkg.name}}");

	define("INDEX_URL", normalize_path(APP_URL . "server/php/index.php", false));
	define("CACHE_URL", normalize_path(APP_URL . "cache", true));
	define("CACHE_PATH", normalize_path(APP_PATH . "/cache", false));

	// refl('DEFINED', array(
	// 	"PHP_VERSION     " => PHP_VERSION,
	// 	"PHP_OS          " => PHP_OS,
	// 	"MIN_PHP_VERSION " => MIN_PHP_VERSION,
	// 	"IS_PHP_VERSION_SUPPORTED   " => IS_PHP_VERSION_SUPPORTED,
	// 	"IS_WIN_OS       " => IS_WIN_OS,
	// 	"SERVER_NAME     " => SERVER_NAME,
	// 	"SERVER_VERSION  " => SERVER_VERSION,
	// 	"APP_URL         " => APP_URL,
	// 	"APP_PATH        " => APP_PATH,
	// 	"ROOT_URL        " => ROOT_URL,
	// 	"ROOT_PATH       " => ROOT_PATH,
	// 	"CURRENT_URL     " => CURRENT_URL,
	// 	"CURRENT_PATH    " => CURRENT_PATH,
	// 	"MAGIC_SEQUENCE  " => MAGIC_SEQUENCE,
	// 	"FILE_PREFIX     " => FILE_PREFIX,
	// 	"INDEX_URL       " => INDEX_URL,
	// 	"CACHE_URL       " => CACHE_URL,
	// 	"CACHE_PATH      " => CACHE_PATH
	// ));
	// exit();
}

init();

normalized_require_once("util.php");
normalized_require_once("App.php");
normalized_require_once("Item.php");

$app = new App();


if (has_request_param("action")) {

	header("Content-type: application/json;charset=utf-8");

	normalized_require_once("Api.php");
	$api = new Api($app);
	$api->apply();

} else {

	header("Content-type: text/html;charset=utf-8");
	define("FALLBACK", $app->get_fallback());
	normalized_require_once("page.php");
}

?>