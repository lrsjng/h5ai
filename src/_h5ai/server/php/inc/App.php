<?php

class App {

	public static $MAGIC_SEQUENCE = "={{pkg.name}}=";
	public static $FILE_PREFIX = "_{{pkg.name}}";

	private static $RE_DELIMITER = "|";
	private static $CACHE_DIR = "cache";


	private $app_abs_path, $root_abs_path,
			$app_abs_href, $root_abs_href,
			$abs_href, $abs_path,
			$options;


	public function __construct($app_abs_path, $app_abs_href, $abs_href) {

		$this->app_abs_path = normalize_path($app_abs_path);
		$this->root_abs_path = normalize_path(dirname($this->app_abs_path));

		$this->app_abs_href = normalize_path($app_abs_href, true);
		$this->root_abs_href = normalize_path(dirname($this->app_abs_href), true);

		$this->abs_href = normalize_path($abs_href, true);
		$this->abs_path = $this->get_abs_path($this->abs_href);

		$config = array("options" => array(), "types" => array(), "langs" => array());
		$config = merge_config($config, load_commented_json($this->app_abs_path . "/conf/config.json"));
		$config = merge_config($config, load_commented_json($this->abs_path . "/" . App::$FILE_PREFIX . ".config.json"));
		$this->options = $config["options"];
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


	public function get_options() {

		return $this->options;
	}


	public function get_abs_href($abs_path = null, $trailing_slash = true) {

		if ($abs_path === null) {
			return $this->abs_href;
		}

		$abs_path = substr($abs_path, strlen($this->root_abs_path));

		$parts = explode("/", $abs_path);
		$encoded_parts = array();
		foreach ($parts as $part) {
			$encoded_parts[] = rawurlencode($part);
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


	public function get_http_code($abs_href) {

		if (!is_dir($this->get_abs_path($abs_href))) {
			return 500;
		}

		$abs_path = $this->get_abs_path($abs_href);

		foreach ($this->options["view"]["indexFiles"] as $if) {
			if (file_exists($abs_path . "/" . $if)) {
				return 200;
			}
		}
		return "h5ai";
	}


	private function fileExists($file) {

		return is_string($file) && file_exists($file);
	}


	public function get_generic_json() {

		$entries = $this->get_entries($this->abs_href, 1);

		$header = $this->options["custom"]["header"];
		$footer = $this->options["custom"]["footer"];
		$header = $this->fileExists($header ? $this->abs_path . "/" . $header : null) ? $header : null;
		$footer = $this->fileExists($footer ? $this->abs_path . "/" . $footer : null) ? $footer : null;

		$json = array(
			"id" => "php",
			"serverName" => strtolower(preg_replace("/\\/.*$/", "", getenv("SERVER_SOFTWARE"))),
			"serverVersion" => strtolower(preg_replace("/^.*\\//", "", preg_replace("/\\s.*$/", "", getenv("SERVER_SOFTWARE")))),
			"customHeader" => $header,
			"customFooter" => $footer,
			"entries" => $entries
		);

		return json_encode($json) . "\n";
	}


	public function get_custom_config() {

		$config = App::$FILE_PREFIX . ".config.json";
		$config = $this->fileExists($config ? $this->abs_path . "/" . $config : "ignore") ? $config : "ignore";
		return $config;
	}


	public function get_entries($abs_href, $what) {

		$folder = Entry::get($this, $this->get_abs_path($abs_href), $abs_href);

		if ($what > 1 && $folder !== null) {
			foreach ($folder->getContent() as $entry) {
				$entry->getContent();
			}
			$folder = $folder->getParent();
		}

		while ($what > 0 && $folder !== null) {
			$folder->getContent();
			$folder = $folder->getParent();
		}
		Entry::sort();

		$entries = array();
		foreach (Entry::get_cache() as $entry) {
			$entries[] = $entry->toJsonObject(true);
		}

		return $entries;
	}


	public function get_no_js_fallback() {

		date_default_timezone_set("UTC");

		function _cmp_no_js_fallback($entry1, $entry2) {

			if ($entry1->isFolder && !$entry2->isFolder) {
				return -1;
			}
			if (!$entry1->isFolder && $entry2->isFolder) {
				return 1;
			}

			return strcasecmp($entry1->absHref, $entry2->absHref);
		}

		$folder = Entry::get($this, $this->abs_path, $this->abs_href);
		$entries = $folder->getContent();
		uasort($entries, "_cmp_no_js_fallback");

		$html = "<table>";
		$html .= "<tr><th></th><th><span>Name</span></th><th><span>Last modified</span></th><th><span>Size</span></th></tr>";
		if ($folder->parent) {
			$html .= "<tr><td></td><td><a href=\"..\">Parent Directory</a></td><td></td><td></td></tr>";
		}
		foreach ($entries as $entry) {
			$html .= "<tr>";
			$html .= "<td></td>";
			$html .= "<td><a href=\"" . $entry->absHref . "\">" . basename($entry->absPath) . ($entry->isFolder ? "/" : "") . "</a></td>";
			$html .= "<td>" . date("Y-m-d H:i", $entry->date) . "</td>";
			$html .= "<td>" . ($entry->size !== null ? intval($entry->size / 1000) . " KB" : "" ) . "</td>";
			$html .= "</tr>";
		}
		$html .= "</table>";

		return $html;
	}
}

?>