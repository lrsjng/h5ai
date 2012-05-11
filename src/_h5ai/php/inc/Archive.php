<?php

class Archive {

	private static $TAR_CMD = "$(cd [ROOTDIR] && tar --no-recursion -cf [TARGET] [DIRS] [FILES])";
	private static $ZIP_CMD = "$(cd [ROOTDIR] && zip [TARGET] [FILES])";


	private $h5ai, $dirs, $files, $sc401;


	public function __construct($h5ai) {

		$this->h5ai = $h5ai;
	}


	public function create($execution, $format, $hrefs) {

		$this->dirs = array();
		$this->files = array();
		$this->sc401 = false;

		$this->add_hrefs($hrefs);

		if ($this->sc401) {
			return 401;
		} else if (count($this->dirs) === 0 && count($this->files) === 0) {
			return 404;
		}

		$target = H5ai::normalize_path(sys_get_temp_dir(), true) . "h5ai-selection-" . microtime(true) . rand() .  "." . $format;

		try {
			if ($execution === "shell") {

				if ($format === "tar") {
					$cmd = Archive::$TAR_CMD;
				} else if ($format === "zip") {
					$cmd = Archive::$ZIP_CMD;
				} else {
					return null;
				}
				$cmd = str_replace("[ROOTDIR]", "\"" . $this->h5ai->getRootAbsPath() . "\"", $cmd);
				$cmd = str_replace("[TARGET]", "\"" . $target . "\"", $cmd);
				$cmd = str_replace("[DIRS]", count($this->dirs) ? "\"" . implode("\"  \"", array_values($this->dirs)) . "\"" : "", $cmd);
				$cmd = str_replace("[FILES]", count($this->files) ? "\"" . implode("\"  \"", array_values($this->files)) . "\"" : "", $cmd);

				`$cmd`;

			} else if ($execution === "php") {

				$archive = new PharData($target);
				foreach ($this->dirs as $archivedDir) {
					$archive->addEmptyDir($archivedDir);
				}
				foreach ($this->files as $realFile => $archivedFile) {
					$archive->add_file($realFile, $archivedFile); // very, very slow :/
				}

			}
		} catch (Exeption $err) {
			return 500;
		}

		return @filesize($target) ? $target : null;
	}


	private function add_hrefs($hrefs) {

		foreach ($hrefs as $href) {

			$d = H5ai::normalize_path(dirname($href), true);
			$n = basename($href);

			$code = $this->h5ai->getHttpCode($d);
			if ($code == 401) {
				$this->sc401 = true;
			}

			if ($code == "h5ai" && !$this->h5ai->is_ignored($n)) {

				$realFile = $this->h5ai->getAbsPath($href);
				$archivedFile = preg_replace("!^" . H5ai::normalize_path($this->h5ai->getRootAbsPath(), true) . "!", "", $realFile);

				if (is_dir($realFile)) {
					$this->add_dir($realFile, $archivedFile);
				} else {
					$this->add_file($realFile, $archivedFile);
				}
			}
		}
	}


	private function add_file($realFile, $archivedFile) {

		if (is_readable($realFile)) {
			$this->files[$realFile] = $archivedFile;
		}
	}


	private function add_dir($realDir, $archivedDir) {

		$code = $this->h5ai->getHttpCode($this->h5ai->getAbsHref($realDir));
		if ($code == 401) {
			$this->sc401 = true;
		}

		if ($code == "h5ai") {
			$this->dirs[] = $archivedDir;

			$files = $this->h5ai->read_dir($realDir);
			foreach ($files as $file) {

				$realFile = $realDir . "/" . $file;
				$archivedFile = $archivedDir . "/" . $file;

				if (is_dir($realFile)) {
					$this->add_dir($realFile, $archivedFile);
				} else {
					$this->add_file($realFile, $archivedFile);
				}
			}
		}
	}
}

?>