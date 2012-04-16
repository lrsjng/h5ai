<?php

class ZipIt {

	private $h5ai;


	public static function isUsable() {

		return class_exists("ZipArchive");
	}


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
			$d = H5ai::normalize_path(dirname($href), true);
			$n = basename($href);
			$code = $this->h5ai->getHttpCode($d);
			if ($code == 401) {
				return $code;
			}

			if ($code == "h5ai" && !$this->h5ai->ignoreThisFile($n)) {
				$localFile = $this->h5ai->getAbsPath($href);
				$file = preg_replace("!^" . $this->h5ai->getRootAbsPath() . "!", "", $localFile);
				if (is_dir($localFile)) {
					$rcode = $this->zipDir($zip, $localFile, $file);
					if ($rcode == 401) {
						return $rcode;
					}
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

		$code = $this->h5ai->getHttpCode($this->h5ai->getAbsHref($localDir));

		if ($code == 'h5ai') {
			$zip->addEmptyDir($dir);
			$files = $this->h5ai->readDir($localDir);
			foreach ($files as $file) {
				$localFile = $localDir . "/" . $file;
				$file = $dir . "/" . $file;
				if (is_dir($localFile)) {
					$rcode = $this->zipDir($zip, $localFile, $file);
					if ($rcode == 401) {
						return $rcode;
					}
				} else {
					$this->zipFile($zip, $localFile, $file);
				}
			}
		}
		return $code;
	}
}

?>