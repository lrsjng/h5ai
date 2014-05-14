<?php

class App {

	public static $MAGIC_SEQUENCE = "={{pkg.name}}=";
	public static $FILE_PREFIX = "_{{pkg.name}}";

	private static $MIN_PHP_VERSION = "5.3.0";
	private static $RE_DELIMITER = "|";
	private static $CACHE_DIR = "cache";


	private $is_win_os, $is_supported_php,
			$server_name, $server_version,
			$app_abs_path, $root_abs_path,
			$app_abs_href, $root_abs_href,
			$abs_href, $abs_path,
			$options;


	public static function from_env() {

		$server_name = null;
		$server_version = null;
		if (preg_match("#^(.*?)/(.*?)(?: |$)#", strtolower(getenv("SERVER_SOFTWARE")), $matches)) {
			$server_name = $matches[1];
			$server_version = $matches[2];
		}

		$app_abs_path = normalize_path(dirname(dirname(dirname(dirname(__FILE__)))));

		$script_name = getenv("SCRIPT_NAME");
		if ($server_name === "lighttpd") {
			$script_name = preg_replace("#^.*//#", "/", $script_name);
		}
		$app_abs_href = dirname(dirname(dirname($script_name)));

		$url_parts = parse_url(getenv("REQUEST_URI"));
		$abs_href = $url_parts["path"];

		return new App($server_name, $server_version, $app_abs_path, $app_abs_href, $abs_href);
	}


	public function __construct($server_name, $server_version, $app_abs_path, $app_abs_href, $abs_href) {

		$this->is_win_os = strtolower(substr(PHP_OS, 0, 3)) === "win";
		$this->is_supported_php = version_compare(PHP_VERSION, App::$MIN_PHP_VERSION) >= 0;

		$this->server_name = strtolower($server_name);
		$this->server_version = strtolower($server_version);

		$this->app_abs_path = normalize_path($app_abs_path);
		$this->root_abs_path = normalize_path(dirname($this->app_abs_path));

		$this->app_abs_href = normalize_path($app_abs_href, true);
		$this->root_abs_href = normalize_path(dirname($this->app_abs_href), true);

		$this->abs_href = normalize_path($abs_href, true);
		$this->abs_path = $this->get_abs_path($this->abs_href);

		// echo("<pre>");
		// var_dump($this);
		// exit();

		$this->options = load_commented_json($this->app_abs_path . "/conf/options.json");
	}


	public function get_root_abs_path() {

		return $this->root_abs_path;
	}


	public function get_root_abs_href() {

		return $this->root_abs_href;
	}


	public function get_app_abs_href() {

		return $this->app_abs_href;
	}


	public function get_cache_abs_path() {

		return $this->app_abs_path . '/' . App::$CACHE_DIR;
	}


	public function get_cache_abs_href() {

		return $this->app_abs_href . App::$CACHE_DIR . '/';
	}


	public function get_abs_href($abs_path = null, $trailing_slash = true) {

		if ($abs_path === null) {
			return $this->abs_href;
		}

		$abs_path = substr($abs_path, strlen($this->root_abs_path));

		$parts = explode("/", $abs_path);
		$encoded_parts = array();
		foreach ($parts as $part) {
			if ($part) {
				$encoded_parts[] = rawurlencode($part);
			}
		}

		return normalize_path($this->root_abs_href . implode("/", $encoded_parts), $trailing_slash);
	}


	public function get_abs_path($abs_href = null) {

		if ($abs_href === null) {
			return $this->abs_path;
		}

		$abs_href = substr($abs_href, strlen($this->root_abs_href));

		return normalize_path($this->root_abs_path . "/" . rawurldecode($abs_href));
	}


	public function is_ignored($name) {

		// always ignore
		if ($name === "." || $name === "..") {
			return true;
		}

		foreach ($this->options["view"]["ignore"] as $re) {
			$re = App::$RE_DELIMITER . str_replace(App::$RE_DELIMITER, '\\' . App::$RE_DELIMITER, $re) . App::$RE_DELIMITER;
			if (preg_match($re, $name)) {
				return true;
			}
		}

		return false;
	}


	public function read_dir($path) {

		$content = array();
		if (is_dir($path)) {
			if ($dir = opendir($path)) {
				while (($file = readdir($dir)) !== false) {
					if (!$this->is_ignored($file) && !$this->is_ignored($this->get_abs_href($path) . $file)) {
						$content[] = $file;
					}
				}
				closedir($dir);
			}
		}
		return $content;
	}


	public function get_options() {

		return $this->options;
	}


	public function get_http_code($abs_href) {

		$abs_path = $this->get_abs_path($abs_href);

		if (!is_dir($abs_path) || strpos($abs_path, '../') || strpos($abs_path, '/..') || $abs_path == '..') {
			return 500;
		}

		foreach ($this->options["view"]["indexFiles"] as $if) {
			if (file_exists($abs_path . "/" . $if)) {
				return 200;
			}
		}

		$p = $abs_path;
		while ($p !== $this->root_abs_path) {
			if (@is_dir($p . "/_h5ai/server")) {
				return 200;
			}
			$pp = normalize_path(dirname($p));
			if ($pp === $p) {
				return 200;
			}
			$p = $pp;
		}
		return App::$MAGIC_SEQUENCE;
	}


	public function get_generic_json() {

		return json_encode(array("items" => $this->get_items($this->abs_href, 1))) . "\n";
	}


	public function get_items($abs_href, $what) {

		$code = $this->get_http_code($abs_href);
		if ($code != App::$MAGIC_SEQUENCE) {
			return array();
		}

		$cache = array();
		$folder = Item::get($this, $this->get_abs_path($abs_href), $cache);

		// add content of subfolders
		if ($what >= 2 && $folder !== null) {
			foreach ($folder->get_content($cache) as $item) {
				$item->get_content($cache);
			}
			$folder = $folder->get_parent($cache);
		}

		// add content of this folder and all parent folders
		while ($what >= 1 && $folder !== null) {
			$folder->get_content($cache);
			$folder = $folder->get_parent($cache);
		}

		uasort($cache, array("Item", "cmp"));
		$result = array();
		foreach ($cache as $p => $item) {
			$result[] = $item->to_json_object();
		}

		return $result;
	}


	public function get_fallback() {

		$cache = array();
		$folder = Item::get($this, $this->abs_path, $cache);
		$items = $folder->get_content($cache);
		uasort($items, array("Item", "cmp"));

		$html = "<table>";

		$html .= "<tr>";
		$html .= "<th></th>";
		$html .= "<th><span>Name</span></th>";
		$html .= "<th><span>Last modified</span></th>";
		$html .= "<th><span>Size</span></th>";
		$html .= "</tr>";

		if ($folder->get_parent($cache)) {
			$html .= "<tr>";
			$html .= "<td><img src='" . $this->app_abs_href . "client/icons/96/folder-parent.png' alt='folder-parent'/></td>";
			$html .= "<td><a href='..'>Parent Directory</a></td>";
			$html .= "<td></td>";
			$html .= "<td></td>";
			$html .= "</tr>";
		}

		foreach ($items as $item) {
			$type = $item->is_folder ? "folder" : "default";

			$html .= "<tr>";
			$html .= "<td><img src='" . $this->app_abs_href . "client/icons/96/" . $type . ".png' alt='" . $type . "'/></td>";
			$html .= "<td><a href='" . $item->abs_href . "'>" . basename($item->abs_path) . "</a></td>";
			$html .= "<td>" . date("Y-m-d H:i", $item->date) . "</td>";
			$html .= "<td>" . ($item->size !== null ? intval($item->size / 1000) . " KB" : "" ) . "</td>";
			$html .= "</tr>";
		}

		$html .= "</table>";

		return $html;
	}


	public function get_types() {

		return load_commented_json($this->app_abs_path . "/conf/types.json");
	}


	public function get_l10n_list() {

		$langs = array();
		$l10nDir = $this->app_abs_path . "/conf/l10n";
		if (is_dir($l10nDir)) {
			if ($dir = opendir($l10nDir)) {
				while (($file = readdir($dir)) !== false) {
					if (ends_with($file, ".json")) {
						$translations = load_commented_json($l10nDir . "/" . $file);
						$langs[basename($file, ".json")] = $translations["lang"];
					}
				}
				closedir($dir);
			}
		}
		ksort($langs);
		return $langs;
	}


	public function get_l10n($iso_codes) {

		if (!is_array($iso_codes)) {
			$iso_codes = func_get_args();
		}

		$result = array();
		foreach ($iso_codes as $iso_code) {
			if ($iso_code !== "") {
				$file = $this->app_abs_path . "/conf/l10n/" . $iso_code . ".json";
				$result[$iso_code] = load_commented_json($file);
				$result[$iso_code]["isoCode"] = $iso_code;
			}
		}

		return $result;
	}


	public function get_server_checks() {

		$results = array();

		$results["path_index"] = $this->app_abs_href . "server/php/index.php";
		$results["path_cache_writable"] = @is_writable($this->get_cache_abs_path());
		$results["php_version"] = PHP_VERSION;
		$results["php_version_supported"] = $this->is_supported_php;
		$results["php_exif"] = function_exists("exif_thumbnail");

		$gd = false;
		if (function_exists("gd_info")) {
			$gdinfo = gd_info();
			$gd = array_key_exists("JPG Support", $gdinfo) && $gdinfo["JPG Support"] || array_key_exists("JPEG Support", $gdinfo) && $gdinfo["JPEG Support"];
		}
		$results["php_jpg"] = $gd;

		$check_cmd = $this->is_win_os ? "which" : "command -v";
		foreach (array("tar", "zip", "convert", "ffmpeg", "avconv", "du") as $c) {
			$results["cmd_" . $c] = @preg_match("#" . $c . "(.exe)?$#i", exec_cmd($check_cmd . " " . $c)) > 0;
		}
		$results["cmd_ffmpeg_or_avconv"] = $results["cmd_ffmpeg"] || $results["cmd_avconv"];

		$results["is_win_os"] = $this->is_win_os;
		$results["is_supported_php"] = $this->is_supported_php;
		$results["server_name"] = $this->server_name;
		$results["server_version"] = $this->server_version;
		$results["app_abs_path"] = $this->app_abs_path;
		$results["root_abs_path"] = $this->root_abs_path;
		$results["app_abs_href"] = $this->app_abs_href;
		$results["root_abs_href"] = $this->root_abs_href;
		$results["abs_href"] = $this->abs_href;
		$results["abs_path"] = $this->abs_path;
		$results["options"] = $this->options;

		return $results;
	}


	public function get_server_details() {

		return array(
			"backend" => "php",
			"api" => true,
			"name" => $this->server_name,
			"version" => $this->server_version
		);
	}


	public function get_customizations($abs_href) {

		if (!$this->options["custom"]["enabled"]) {
			return array(
				"header" => null,
				"footer" => null
			);
		}

		$abs_path = $this->get_abs_path($abs_href);
		$file = $abs_path . "/" . App::$FILE_PREFIX . ".header.html";
		$header = is_readable($file) ? file_get_contents($file) : null;
		$file = $abs_path . "/" . App::$FILE_PREFIX . ".footer.html";
		$footer = is_readable($file) ? file_get_contents($file) : null;

		$p = $abs_path;
		while ($header === null || $footer === null) {

			if ($header === null) {
				$file = $p . "/" . App::$FILE_PREFIX . ".headers.html";
				$header = is_readable($file) ? file_get_contents($file) : null;
			}
			if ($footer === null) {
				$file = $p . "/" . App::$FILE_PREFIX . ".footers.html";
				$footer = is_readable($file) ? file_get_contents($file) : null;
			}

			if ($p === $this->root_abs_path) {
				break;
			}
			$pp = normalize_path(dirname($p));
			if ($pp === $p) {
				break;
			}
			$p = $pp;
		}

		return array(
			"header" => $header,
			"footer" => $footer
		);
	}
}

?>