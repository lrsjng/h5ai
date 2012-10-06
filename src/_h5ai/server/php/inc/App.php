<?php

class H5ai {

	private static $H5AI_CONTENT_TYPE = "Content-Type: text/html;h5ai=";


	private $h5aiAbsPath, $rootAbsPath,
			$h5aiAbsHref, $rootAbsHref,
			$absHref, $absPath,
			$ignore_names, $ignore_patterns, $index_files,
			$config, $options;


	public function __construct($app_abs_path, $app_abs_href) {

		$this->h5aiAbsPath = normalize_path($app_abs_path);
		$this->rootAbsPath = normalize_path(dirname($app_abs_path));

		$this->h5aiAbsHref = normalize_path($app_abs_href, true);
		$this->rootAbsHref = normalize_path(dirname($app_abs_href), true);

		$this->absHref = normalize_path(preg_replace('/[^\\/]*$/', '', getenv("REQUEST_URI")), true);
		$this->absPath = $this->getAbsPath($this->absHref);

		global $H5AI_CONFIG;
		$this->ignore_names = $H5AI_CONFIG["IGNORE"];
		$this->ignore_patterns = $H5AI_CONFIG["IGNORE_PATTERNS"];
		$this->index_files = $H5AI_CONFIG["INDEX_FILES"];

		$this->config = array("options" => array(), "types" => array(), "langs" => array());
		$this->config = merge_config($this->config, load_commented_json($this->h5aiAbsPath . "/conf/config.json"));
		$this->options = $this->config["options"];

		$this->config = merge_config($this->config, load_commented_json($this->absPath . "/_h5ai.config.json"));
		$this->options = $this->config["options"];
	}


	public function getRootAbsPath() {

		return $this->rootAbsPath;
	}


	public function getH5aiAbsPath() {

		return $this->h5aiAbsPath;
	}


	public function getRootAbsHref() {

		return $this->rootAbsHref;
	}


	public function getH5aiAbsHref() {

		return $this->h5aiAbsHref;
	}


	public function getCacheAbsPath() {

		return $this->h5aiAbsPath . '/cache';
	}


	public function getCacheAbsHref() {

		return $this->h5aiAbsHref . 'cache/';
	}


	public function getOptions() {

		return $this->options;
	}


	public function getAbsHref($absPath = null, $endWithSlash = true) {

		if ($absPath === null) {
			return $this->absHref;
		}

		$absPath = substr($absPath, strlen($this->rootAbsPath));

		$parts = explode("/", $absPath);
		$encodedParts = array();
		foreach ($parts as $part) {
			$encodedParts[] = rawurlencode($part);
		}

		return normalize_path($this->rootAbsHref . implode("/", $encodedParts), $endWithSlash);
	}


	public function getAbsPath($absHref = null) {

		if ($absHref === null) {
			return $this->absPath;
		}

		$absHref = substr($absHref, strlen($this->rootAbsHref));

		return normalize_path($this->rootAbsPath . "/" . rawurldecode($absHref));
	}


	public function is_ignored($name) {

		// always ignore
		if ($name === "." || $name === "..") {
			return true;
		}

		if (in_array($name, $this->ignore_names)) {
			return true;
		}
		foreach ($this->ignore_patterns as $re) {
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
					if (!$this->is_ignored($file) && !$this->is_ignored($this->getAbsHref($path) . $file)) {
						$content[] = $file;
					}
				}
				closedir($dir);
			}
		}
		return $content;
	}


	public function getHttpCode($absHref) {

		if (!is_dir($this->getAbsPath($absHref))) {
			return null;
		}

		$absPath = $this->getAbsPath($absHref);

		foreach ($this->index_files as $if) {
			if (file_exists($absPath . "/" . $if)) {
				if ($if === "index.php") {
					$fileheader = file_get_contents($absPath . "/" . $if, false, null, -1, 50);
					return stripos($fileheader, H5ai::$H5AI_CONTENT_TYPE) === false ? 200 : "h5ai";
				}
				return 200;
			}
		}
		return "h5ai";
	}


	private function fileExists($file) {

		return is_string($file) && file_exists($file);
	}


	public function getGenericJson() {

		$entries = $this->getEntries($this->absHref, 1);

		$header = $this->options["custom"]["header"];
		$footer = $this->options["custom"]["footer"];
		$header = $this->fileExists($header ? $this->absPath . "/" . $header : null) ? $header : null;
		$footer = $this->fileExists($footer ? $this->absPath . "/" . $footer : null) ? $footer : null;

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


	public function getCustomConfig() {

		$config = "_h5ai.config.json";
		$config = $this->fileExists($config ? $this->absPath . "/" . $config : "ignore") ? $config : "ignore";
		return $config;
	}


	public function getEntries($absHref, $content) {

		$folder = Entry::get($this, $this->getAbsPath($absHref), $absHref);
		if ($content > 1 && $folder !== null) {
			foreach ($folder->getContent() as $entry) {
				$entry->getContent();
			}
			$folder = $folder->getParent();
		}
		while ($content > 0 && $folder !== null) {
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


	public function getNoJsFallback() {

		date_default_timezone_set ("UTC");

		function _cmp($entry1, $entry2) {

			if ($entry1->isFolder && !$entry2->isFolder) {
				return -1;
			}
			if (!$entry1->isFolder && $entry2->isFolder) {
				return 1;
			}

			return strcasecmp($entry1->absHref, $entry2->absHref);
		}

		$folder = Entry::get($this, $this->absPath, $this->absHref);
		$entries = $folder->getContent();
		uasort($entries, "_cmp");

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