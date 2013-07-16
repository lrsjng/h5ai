<?php

class Archive {

	private static $TAR_PASSTHRU_CMD = "cd [ROOTDIR] && tar --no-recursion -c -- [DIRS] [FILES]";
	private static $ZIP_PASSTHRU_CMD = "cd [ROOTDIR] && zip - -- [FILES]";

	private $app, $dirs, $files;


	public function __construct($app) {

		$this->app = $app;
	}


	public function create($format, $hrefs) {

		$this->dirs = array();
		$this->files = array();

		$this->add_hrefs($hrefs);

		if (count($this->dirs) === 0 && count($this->files) === 0) {
			return 404;
		}

		$target = $this->app->get_cache_abs_path() . "/package-" . sha1(microtime(true) . rand()) .  "." . $format;

		try {
			$archive = new PharData($target);
			foreach ($this->dirs as $archived_dir) {
				$archive->addEmptyDir($archived_dir);
			}
			foreach ($this->files as $real_file => $archived_file) {
				$archive->addFile($real_file, $archived_file); // very, very slow :/
			}
		} catch (Exeption $err) {
			return 500;
		}

		return @filesize($target) ? $target : null;
	}


	public function shell_passthru($format, $hrefs) {

		$this->dirs = array();
		$this->files = array();

		$this->add_hrefs($hrefs);

		if (count($this->dirs) === 0 && count($this->files) === 0) {
			return 500;
		}

		try {

			if ($format === "tar") {
				$cmd = Archive::$TAR_PASSTHRU_CMD;
			} else if ($format === "zip") {
				$cmd = Archive::$ZIP_PASSTHRU_CMD;
			} else {
				return 500;
			}
			$cmd = str_replace("[ROOTDIR]", "\"" . $this->app->get_abs_path() . "\"", $cmd);
			$cmd = str_replace("[DIRS]", count($this->dirs) ? "\"" . implode("\"  \"", array_values($this->dirs)) . "\"" : "", $cmd);
			$cmd = str_replace("[FILES]", count($this->files) ? "\"" . implode("\"  \"", array_values($this->files)) . "\"" : "", $cmd);

			passthru($cmd);

		} catch (Exeption $err) {
			return 500;
		}

		return 0;
	}


	private function add_hrefs($hrefs) {

		foreach ($hrefs as $href) {

			$d = normalize_path(dirname($href), true);
			$n = basename($href);

			$code = $this->app->get_http_code($d);

			if ($code == App::$MAGIC_SEQUENCE && !$this->app->is_ignored($n)) {

				$real_file = $this->app->get_abs_path($href);
				$archived_file = preg_replace("!^" . normalize_path($this->app->get_abs_path(), true) . "!", "", $real_file);

				if (is_dir($real_file)) {
					$this->add_dir($real_file, $archived_file);
				} else {
					$this->add_file($real_file, $archived_file);
				}
			}
		}
	}


	private function add_file($real_file, $archived_file) {

		if (is_readable($real_file)) {
			$this->files[$real_file] = $archived_file;
		}
	}


	private function add_dir($real_dir, $archived_dir) {

		$code = $this->app->get_http_code($this->app->get_abs_href($real_dir));

		if ($code == App::$MAGIC_SEQUENCE) {
			$this->dirs[] = $archived_dir;

			$files = $this->app->read_dir($real_dir);
			foreach ($files as $file) {

				$real_file = $real_dir . "/" . $file;
				$archived_file = $archived_dir . "/" . $file;

				if (is_dir($real_file)) {
					$this->add_dir($real_file, $archived_file);
				} else {
					$this->add_file($real_file, $archived_file);
				}
			}
		}
	}
}

?>