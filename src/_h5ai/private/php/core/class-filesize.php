<?php

class Filesize {
    private static $cache = [];

    public static function getSize($path, $withFoldersize, $withDu) {
        $fs = new Filesize();
        return $fs->size($path, $withFoldersize, $withDu);
    }

    public static function getCachedSize($path, $withFoldersize, $withDu) {
        if (array_key_exists($path, Filesize::$cache)) {
            return Filesize::$cache[$path];
        }

        $size = Filesize::getSize($path, $withFoldersize, $withDu);

        Filesize::$cache[$path] = $size;
        return $size;
    }


    private function __construct() {}

    private function read_dir($path) {
        $paths = [];
        if (is_dir($path)) {
            foreach (scandir($path) as $name) {
                if ($name !== '.' && $name !== '..') {
                    $paths[] = $path . '/' . $name;
                }
            }
        }
        return $paths;
    }

    private function php_filesize($path, $recursive = false) {
        // if (PHP_INT_SIZE < 8) {
        // }
        $size = @filesize($path);

        if (!is_dir($path) || !$recursive) {
            return $size;
        }

        foreach ($this->read_dir($path) as $p) {
            $size += $this->php_filesize($p, true);
        }
        return $size;
    }


    private function exec($cmdv) {
        $cmd = implode(' ', array_map('escapeshellarg', $cmdv));
        $lines = [];
        $rc = null;
        exec($cmd, $lines, $rc);
        return $lines;
    }

    private function exec_du_all($paths) {
        $cmdv = array_merge(['du', '-sbL'], $paths);
        $lines = $this->exec($cmdv);

        $sizes = [];
        foreach ($lines as $line) {
            $parts = preg_split('/[\s]+/', $line, 2);
            $size = intval($parts[0], 10);
            $path = $parts[1];
            $sizes[$path] = $size;
        }
        return $sizes;
    }

    private function exec_du($path) {
        $sizes = $this->exec_du_all([$path]);
        return $sizes[$path];
    }


    private function size($path, $withFoldersize = false, $withDu = false) {
        if (is_file($path)) {
            return $this->php_filesize($path);
        }

        if (is_dir($path) && $withFoldersize) {
            if ($withDu) {
                return $this->exec_du($path);
            }

            return $this->php_filesize($path, true);
        }

        return null;
    }
}
