<?php


define("H5AI_ABS_PATH", H5ai::normalize_path(dirname(dirname(dirname(__FILE__)))));


H5ai::req_once("/config.php");
H5ai::req_once("/php/inc/Cache.php");
H5ai::req_once("/php/inc/Entry.php");


class H5ai {


	public static final function normalize_path($path, $endWithSlash = false) {

		$path = str_replace("\\", "/", $path);
		return preg_match("#^(\w:)?/$#", $path) ? $path : (preg_replace('#/$#', '', $path) . ($endWithSlash ? "/" : ""));
	}


	public static final function req_once($lib) {

		require_once(H5AI_ABS_PATH . $lib);
	}


	public static final function starts_with($sequence, $start) {

		return strcasecmp(substr($sequence, 0, strlen($start)), $start) === 0;
	}


	public static final function ends_with($sequence, $end) {

		return strcasecmp(substr($sequence, -strlen($end)), $end) === 0;
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




	private $h5aiAbsPath,
			$rootAbsPath, $ignore, $ignoreRE,
			$config, $options,
			$rootAbsHref, $h5aiAbsHref,
			$absHref, $absPath,
			$cache;

	public $checks;


	public function __construct() {

		$this->h5aiAbsPath = H5ai::normalize_path(H5AI_ABS_PATH);

		global $H5AI_CONFIG;
		$this->rootAbsPath = H5ai::normalize_path($H5AI_CONFIG["ROOT_ABS_PATH"]);
		$this->ignore = $H5AI_CONFIG["IGNORE"];
		$this->ignoreRE = $H5AI_CONFIG["IGNORE_PATTERNS"];

		$this->config = H5ai::load_config($this->h5aiAbsPath . "/config.js");
		$this->options = $this->config["options"];

		$this->rootAbsHref = H5ai::normalize_path($this->options["rootAbsHref"], true);
		$this->h5aiAbsHref = H5ai::normalize_path($this->options["h5aiAbsHref"], true);

		$this->absHref = H5ai::normalize_path(preg_replace('/\\?.*/', '', getenv("REQUEST_URI")), true);
		$this->absPath = $this->getAbsPath($this->absHref);

		$this->cache = new Cache($this->h5aiAbsPath . "/cache");

		$this->checks = array(
			"php" => version_compare(PHP_VERSION, "5.2.0") >= 0,
			"archive" => class_exists("PharData"),
			"gd" => GD_VERSION != "GD_VERSION",
			"cache" => is_writable($this->h5aiAbsPath . "/cache"),
			"temp" => is_writable(sys_get_temp_dir()),
			"tar" => preg_match("/tar$/", `which tar`) > 0,
			"zip" => preg_match("/zip$/", `which zip`) > 0
		);
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


	public function api() {

		return $this->h5aiAbsHref . "php/api.php";
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


	public function ignoreThisFile($file) {

		// always ignore
		if ($file === "." || $file === ".." || H5ai::starts_with($file, '.ht')) {
			return true;
		}

		if (in_array($file, $this->ignore)) {
			return true;
		}
		foreach ($this->ignoreRE as $re) {
			if (preg_match($re, $file)) {
				return true;
			}
		}

		return false;
	}


	public function readDir($path) {

		$content = array();
		if (is_dir($path)) {
			if ($dir = opendir($path)) {
				while (($file = readdir($dir)) !== false) {
					if (!$this->ignoreThisFile($file)) {
						$content[] = $file;
					}
				}
				closedir($dir);
			}
		}
		return $content;
	}


	public function getHttpCode($absHref) {

		//return $this->cachedHttpCode($absHref);
		return $this->fetchHttpCode($absHref);
	}


	public function cachedHttpCode($absHref) {

		$cached = $this->cache->get($absHref);
		if ($cached === false) {
			$code = $this->fetchHttpCode($absHref);
			$cached = array("href" => $absHref, "code" => $code);
			$this->cache->set($absHref, $cached);
		}
		return $cached["code"];
	}


	public function fetchHttpCode($absHref) {

		if (!is_dir($this->getAbsPath($absHref))) {
			return null;
		}

		if ($this->options["folderstatus"]["enabled"]) {
			$folders = $this->options["folderstatus"]["folders"];
			if (array_key_exists($absHref, $folders)) {
				return $folders[$absHref];
			}
		}

		$contentType = "Content-Type:";
		$h5aiContentType = "Content-Type: text/html;h5ai=";
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
			while (! H5ai::starts_with($content, $contentType)) {
				$content = fgets($socket);
			}
			if (H5ai::starts_with($content, $h5aiContentType)) {
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

		$header = $this->options["custom"]["header"];
		$footer = $this->options["custom"]["footer"];
		$header = $this->fileExists($header ? $this->absPath . "/" . $header : null) ? $header : null;
		$footer = $this->fileExists($footer ? $this->absPath . "/" . $footer : null) ? $footer : null;

		// collect and sort entries
		$folder = Entry::get($this, $this->absPath, $this->absHref);
		while ($folder !== null) {
			$folder->getContent();
			$folder = $folder->getParent();
		}
		Entry::sort();

		$entries = array();
		foreach(Entry::getCache() as $entry) {
			$entries[] = $entry->toJsonObject(true);
		}

		$json = array(
			"entries" => $entries,
			"customHeader" => $header,
			"customFooter" => $footer
		);

		return json_encode($json) . "\n";
	}
}

?>