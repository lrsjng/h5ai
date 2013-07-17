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
				return $this->create_tar();
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


	private function create_tar() {

		// POSIX.1-1988 UStar implementation, by @TvdW

		$root_path = $this->app->get_root_abs_path();

		foreach (array_values($this->files) as $file) {

			// TAR supports filenames up to 253 chars, but the name should be split ubti a 154-byte prefix and 99-byte name
			assert(substr($file, 0, strlen($root_path)) == $root_path);
			$local_filename = normalize_path(substr($file, strlen($root_path) + 1));
			$filename_parts = array('', substr($local_filename, -99));
			if (strlen($local_filename) > 99) $filename_parts[0] = substr($local_filename, 0, -99);
			if (strlen($filename_parts[0]) > 154) $filename_parts[0] = substr($filename_parts[0], -154);

			$size = filesize($file);

			$file_header = 
				 str_pad($filename_parts[1], 100, "\0") // first filename part
				."0000755\0"."0000000\0"."0000000\0" // File mode and uid/gid
				.str_pad(decoct($size), 11, "0", STR_PAD_LEFT)."\0" // File size
				.str_pad(decoct(time()), 11, "0", STR_PAD_LEFT)."\0" // Modification time
				."        " // checksum (filled in later)
				."0" // file type
				.str_repeat("\0", 100)
				."ustar 00"
				.str_repeat("\0", 92)
				.str_pad($filename_parts[0], 155, "\0");
			assert(strlen($file_header) == 512);

			// Checksum
			$checksum = array_sum(array_map('ord', str_split($file_header)));
			$checksum = str_pad(decoct($checksum), 6, "0", STR_PAD_LEFT)."\0 ";
			$file_header = substr_replace($file_header, $checksum, 148, 8);

			echo $file_header;
			readfile($file);

			$pad_file = 512 - ($size % 512);
			if ($pad_file) echo str_repeat("\0", $pad_file);

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
