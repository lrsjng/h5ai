<?php

class ZipIt {

	private $h5ai;


	public function __construct($h5ai) {

		$this->h5ai = $h5ai;
	}


	public function zip($hrefs) {

		$zipFile = tempnam(sys_get_temp_dir(), "h5ai-zip-");
		$zip = new ZipArchive();

		if (!$zip->open($zipFile, ZIPARCHIVE::CREATE)) {
			return null;
		}

		$zip->addEmptyDir("/");
		foreach ($hrefs as $href) {
			$d = safe_dirname($href, true);
			$n = basename($href);
			if ($this->h5ai->getHttpCode($d) === "h5ai" && !$this->h5ai->ignoreThisFile($n)) {
				$localFile = $this->h5ai->getAbsPath($href);
				$file = preg_replace("!^" . $this->h5ai->getRootAbsPath() . "!", "", $localFile);
				if (is_dir($localFile)) {
					$this->zipDir($zip, $localFile, $file);
				} else {
					$this->zipFile($zip, $localFile, $file);
				}
			}
		}

		$zip->close();
		return filesize($zipFile) ? $zipFile : null;
	}


	private function zipFile($zip, $localFile, $file) {

		if (is_readable($localFile)) {
			$zip->addFile($localFile, $file);
		}
	}


	private function zipDir($zip, $localDir, $dir) {

		if ($this->h5ai->getHttpCode($this->h5ai->getAbsHref($localDir)) === "h5ai") {
			$zip->addEmptyDir($dir);
			$files = $this->h5ai->readDir($localDir);
			foreach ($files as $file) {
				$localFile = $localDir . "/" . $file;
				$file = $dir . "/" . $file;
				if (is_dir($localFile)) {
					$this->zipDir($zip, $localFile, $file);
				} else {
					$this->zipFile($zip, $localFile, $file);
				}
			}
		}
	}
}

?>