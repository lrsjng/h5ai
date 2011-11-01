<?php

##############################################
# taken from here:
# http://www.jongales.com/blog/2009/02/18/simple-file-based-php-cache-class/
# with minor modifications
##############################################

class Cache {
    private $dir;

    function __construct($dir) {

        $this->dir = $dir;
    }

    private function _name($key) {

        return $this->dir . "/" . sha1($key);
    }

    public function get($key, $expiration = 3600) {

        if (!is_dir($this->dir) || !is_writable($this->dir)) {
            return false;
        }

        $cache_path = $this->_name($key);

        if (!@file_exists($cache_path)) {
            return false;
        }

        if (filemtime($cache_path) < (time() - $expiration)) {
            $this->clear($key);
            return false;
        }

        if (!$fp = @fopen($cache_path, "rb")) {
            return false;
        }

        flock($fp, LOCK_SH);
        $cache = "";

        if (filesize($cache_path) > 0) {
            $cache = unserialize(fread($fp, filesize($cache_path)));
        } else {
            $cache = null;
        }

        flock($fp, LOCK_UN);
        fclose($fp);

        return $cache;
    }

    public function set($key, $data) {

        if (!is_dir($this->dir) || !is_writable($this->dir)) {
            return false;
        }

        $cache_path = $this->_name($key);

        if (! $fp = fopen($cache_path, "wb")) {
            return false;
        }

        if (flock($fp, LOCK_EX)) {
            fwrite($fp, serialize($data));
            flock($fp, LOCK_UN);
        } else {
            return false;
        }
        fclose($fp);
        @chmod($cache_path, 0777);
        return true;
    }

    public function clear($key) {

        $cache_path = $this->_name($key);

        if (file_exists($cache_path)) {
            unlink($cache_path);
            return true;
        }
        return false;
    }
}

?>