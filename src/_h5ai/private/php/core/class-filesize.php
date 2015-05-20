<?php

class Filesize {

    private $cache = [];

    public function __construct() {

    }

    public function fseek($path) {

        $size = 0;
        $step = 1073741824;

        $handle = fopen($path, 'r');
        fseek($handle, 0, SEEK_SET);

        while ($step > 1) {
            fseek($handle, $step, SEEK_CUR);
            if (fgetc($handle) !== false) {
                $size += $step + 1;
            } else {
                fseek($handle, -$step, SEEK_CUR);
                $step = intval($step / 2, 10);
            }
        }

        while (fgetc($handle) !== false) {
            $size += 1;
        }

        fclose($handle);

        return $size;
    }

    public function filesize($path) {

        return @filesize($path);
    }

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

    private function exec($cmdv) {

        $cmd = implode(' ', array_map('escapeshellarg', $cmdv));
        $lines = [];
        $rc = null;
        exec($cmd, $lines, $rc);
        return $lines;
    }

    public function du_paths($paths) {

        $cmdv = array_merge(['du', '-sk'], $paths);
        $lines = $this->exec($cmdv);

        $sizes = [];
        foreach ($lines as $line) {
            $parts = preg_split('/[\s]+/', $line, 2);
            $size = intval($parts[0], 10) * 1024;
            $path = $parts[1];
            $sizes[$path] = $size;
        }
        return $sizes;
    }

    public function du_dir($path) {

        return $this->du_paths($this->read_dir($path));
    }

    public function du_path($path) {

        $sizes = $this->du_paths([$path]);
        return $sizes[$path];
    }

    public function add($path) {

        $size = 0;
        foreach ($this->read_dir($path) as $p) {
            $size += $this->filesize($p);
        }
        return $size;
    }
}
