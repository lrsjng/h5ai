<?php


define("H5AI_ABS_PATH", H5ai::normalize_path(dirname(dirname(dirname(__FILE__)))));


H5ai::req_once("/config.php");
H5ai::req_once("/php/inc/Entry.php");


class H5ai {


	public static final function normalize_path($path, $endWithSlash = false) {

		$path = str_replace("\\", "/", $path);
		return preg_match("#^(\w:)?/$#", $path) ? $path : (preg_replace('#/$#', '', $path) . ($endWithSlash ? "/" : ""));
	}


	public static final function req_once($lib) {

		require_once(H5AI_ABS_PATH . $lib);
	}


	private static final function load_config($file) {

		$str = file_exists($file) ? file_get_contents($file) : "";

		// remove comments and change expression to pure json
		$str = preg_replace("/\/\*.*?\*\//s", "", $str);
		$str = preg_replace("/^.*H5AI_CONFIG\s*=\s*/s", "", $str);
		$str = preg_replace("/;.*/s", "", $str);
		$config = json_decode($str, true);

		return $config;
	}


	private static $H5AI_CONTENT_TYPE = "Content-Type: text/html;h5ai=";




	private $requested_from,
			$h5aiAbsPath,
			$rootAbsPath, $ignore_names, $ignore_patterns, $index_files,
			$config, $options,
			$rootAbsHref, $h5aiAbsHref,
			$absHref, $absPath;


	public function __construct($requested_from) {

		$this->requested_from = H5ai::normalize_path($requested_from);

		$this->h5aiAbsPath = H5ai::normalize_path(H5AI_ABS_PATH);

		global $H5AI_CONFIG;
		$this->rootAbsPath = H5ai::normalize_path($H5AI_CONFIG["ROOT_ABS_PATH"]);
		$this->ignore_names = $H5AI_CONFIG["IGNORE"];
		$this->ignore_patterns = $H5AI_CONFIG["IGNORE_PATTERNS"];
		$this->index_files = $H5AI_CONFIG["INDEX_FILES"];

		$this->config = H5ai::load_config($this->h5aiAbsPath . "/config.js");
		$this->options = $this->config["options"];

		$this->rootAbsHref = H5ai::normalize_path($this->options["rootAbsHref"], true);
		$this->h5aiAbsHref = H5ai::normalize_path($this->options["h5aiAbsHref"], true);

		$this->absHref = H5ai::normalize_path(preg_replace('/[^\\/]*$/', '', getenv("REQUEST_URI")), true);
		$this->absPath = $this->getAbsPath($this->absHref);
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

		return H5ai::normalize_path($this->rootAbsHref . implode("/", $encodedParts), $endWithSlash);
	}


	public function getAbsPath($absHref = null) {

		if ($absHref === null) {
			return $this->absPath;
		}

		$absHref = substr($absHref, strlen($this->rootAbsHref));

		return H5ai::normalize_path($this->rootAbsPath . "/" . rawurldecode($absHref));
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
					if (!$this->is_ignored($file)) {
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

		if ($this->options["folderstatus"]["enabled"]) {
			$folders = $this->options["folderstatus"]["folders"];
			if (array_key_exists($absHref, $folders)) {
				return $folders[$absHref];
			}
		}

		// return $this->fetchHttpCode($absHref);
		return $this->guessHttpCode($absHref);
	}


	public function guessHttpCode($absHref) {

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


	public function fetchHttpCode($absHref) {

		$host = getenv("HTTP_HOST");
		$port = getenv("SERVER_PORT");
		$msg = "HEAD $absHref HTTP/1.1\r\nHost: $host\r\nConnection: Close\r\n";
		if (isset($_SERVER['PHP_AUTH_USER'])) {
			$msg .= "Authorization: Basic " . base64_encode($_SERVER['PHP_AUTH_USER'] . ":" . $_SERVER['PHP_AUTH_PW']) . "\r\n";
		}
		$msg .= "\r\n";

		$errno = "";
		$errstr = "";
		$socket = fsockopen($host, $port, $errno, $errstr, 30);
		if($socket === 0) {
			return null;
		}

		fwrite($socket, $msg);
		$content = fgets($socket);
		$code = intval(trim(substr($content, 9, 4)));
		if ($code === 200) {
			while ($content !== false && stripos($content, "Content-Type") === false) {
				$content = fgets($socket);
			}
			if (stripos($content, H5ai::$H5AI_CONTENT_TYPE) !== false) {
				$code = "h5ai";
			}
		}
		fclose($socket);

		return $code;
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
			"entries" => $entries,
			"customHeader" => $header,
			"customFooter" => $footer,
			"mode" => $this->requested_from === $this->h5aiAbsPath . "/php/h5ai-index.php" ? "php" : "idx.php",
			"server" => array(
				"name" => strtolower(preg_replace("/\\/.*$/", "", getenv("SERVER_SOFTWARE"))),
				"version" => strtolower(preg_replace("/^.*\\//", "", preg_replace("/\\s.*$/", "", getenv("SERVER_SOFTWARE"))))
			)
		);

		return json_encode($json) . "\n";
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
}

?>