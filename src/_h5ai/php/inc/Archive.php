<?php

class Archive {

	private $h5ai;


	public function __construct($h5ai) {

		$this->h5ai = $h5ai;
	}


	public function create($format, $hrefs) {

		$target = H5ai::normalize_path(sys_get_temp_dir(), true) . "h5ai-selection-" . microtime(true) . "-" . rand() .  "." . $format;
		$archive = new PharData($target);

		foreach ($hrefs as $href) {
			$d = H5ai::normalize_path(dirname($href), true);
			$n = basename($href);
			$code = $this->h5ai->getHttpCode($d);
			if ($code == 401) {
				return $code;
			}

			if ($code == "h5ai" && !$this->h5ai->ignoreThisFile($n)) {
				$realFile = $this->h5ai->getAbsPath($href);
				$archivedFile = preg_replace("!^" . $this->h5ai->getRootAbsPath() . "!", "", $realFile);
				if (is_dir($realFile)) {
					$rcode = $this->addDir($archive, $realFile, $archivedFile);
					if ($rcode == 401) {
						return $rcode;
					}
				} else {
					$this->addFile($archive, $realFile, $archivedFile);
				}
			}
		}

		return filesize($target) ? $target : null;
	}


	private function addFile($archive, $realFile, $archivedFile) {

		if (is_readable($realFile)) {
			$archive->addFile($realFile, $archivedFile);
		}
	}


	private function addDir($archive, $realDir, $archivedDir) {

		$code = $this->h5ai->getHttpCode($this->h5ai->getAbsHref($realDir));

		if ($code == "h5ai") {
			$archive->addEmptyDir($archivedDir);
			$files = $this->h5ai->readDir($realDir);
			foreach ($files as $file) {
				$realFile = $realDir . "/" . $file;
				$archivedFile = $archivedDir . "/" . $file;
				if (is_dir($realFile)) {
					$rcode = $this->addDir($archive, $realFile, $archivedFile);
					if ($rcode == 401) {
						return $rcode;
					}
				} else {
					$this->addFile($archive, $realFile, $archivedFile);
				}
			}
		}
		return $code;
	}
}

?>