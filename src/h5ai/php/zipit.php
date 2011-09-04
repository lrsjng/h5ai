<?php

class ZipIt {
    private $h5ai;

    public function __construct($h5ai) {

        $this->h5ai = $h5ai;
    }

    public function zip($hrefs) {

        $zipFile = tempnam("/tmp", "h5ai-download");
        $zip = new ZipArchive();

        if (!$zip->open($zipFile, ZIPARCHIVE::CREATE)) {
            return false;
        }

        foreach ($hrefs as $href) {
            $localFile = $this->h5ai->getAbsPath($href);
            $file = preg_replace("!^" . $this->h5ai->getDocRoot() . "!", "", $localFile);
            if (is_dir($localFile)) {
                $this->zipDir($zip, $localFile, $file);
            } else {
                $this->zipFile($zip, $localFile, $file);
            }
        }

        $zip->close();
        return $zipFile;
    }

    private function zipFile($zip, $localFile, $file) {

        if (is_readable($localFile)) {
            $zip->addFile($localFile, $file);
        }
    }

    private function zipDir($zip, $localDir, $dir) {

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

?>