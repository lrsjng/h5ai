<?php

class SHA1 {
    private static $cache = [];

    public static function getHash($path) {
        $sha1 = new SHA1();
        return $sha1->hash($path);
    }

    public static function getCachedHash($path, $clear_cache = false) {
        if (array_key_exists($path, SHA1::$cache) && !$clear_cache) {
            return SHA1::$cache[$path];
        }

        $hash = SHA1::getHash($path, $clear_cache);

        SHA1::$cache[$path] = $hash;
        return $hash;
    }


    private function __construct() {

    }

    private function hash($path) {
        if (is_file($path)) {
            return sha1_file($path);
        }

        return null;
    }
}
