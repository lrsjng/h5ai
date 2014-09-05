<?php

class Archive {

    private static $SEGMENT_SIZE = 16777216;  // 1024 * 1024 * 16 = 16MiB
    private static $TAR_PASSTHRU_CMD = "cd [ROOTDIR] && tar --no-recursion -c -- [DIRS] [FILES]";
    private static $ZIP_PASSTHRU_CMD = "cd [ROOTDIR] && zip - -- [FILES]";

    private $app, $dirs, $files;


    public function __construct($app) {

        $this->app = $app;
    }


    public function output($type, $urls) {

        $this->dirs = array();
        $this->files = array();

        $this->add_hrefs($urls);

        if (count($this->dirs) === 0 && count($this->files) === 0) {
            if ($type === "php-tar") {
                $this->add_dir(CURRENT_PATH, "/");
            } else {
                $this->add_dir(CURRENT_PATH, ".");
            }
        }

        if ($type === "php-tar") {

            return $this->php_tar($this->dirs, $this->files);

        } else if ($type === "shell-tar") {

            return $this->shell_cmd(Archive::$TAR_PASSTHRU_CMD);

        } else if ($type === "shell-zip") {

            return $this->shell_cmd(Archive::$ZIP_PASSTHRU_CMD);
        }
        return 500;
    }


    private function shell_cmd($cmd) {

        $cmd = str_replace("[ROOTDIR]", escapeshellarg(CURRENT_PATH), $cmd);
        $cmd = str_replace("[DIRS]", count($this->dirs) ? implode(" ", array_map("escapeshellarg", $this->dirs)) : "", $cmd);
        $cmd = str_replace("[FILES]", count($this->files) ? implode(" ", array_map("escapeshellarg", $this->files)) : "", $cmd);
        try {
            Util::passthru_cmd($cmd);
        } catch (Exeption $err) {
            return 500;
        }
        return 0;
    }


    private function php_tar($dirs, $files) {

        $filesizes = array();
        $total_size = 512 * count($dirs);
        foreach (array_keys($files) as $real_file) {

            $size = filesize($real_file);

            $filesizes[$real_file] = $size;
            $total_size += 512 + $size;
            if ($size % 512 != 0) {
                $total_size += 512 - ($size % 512);
            }
        }

        header("Content-Length: " . $total_size);

        foreach ($dirs as $archived_dir) {

            echo $this->php_tar_header($archived_dir, 0, 0, 5);
        }
        foreach ($files as $real_file => $archived_file) {

            $size = $filesizes[$real_file];

            echo $this->php_tar_header($archived_file, $size, @filemtime($real_file), 0);
            $this->print_file($real_file);

            if ($size % 512 != 0) {
                echo str_repeat("\0", 512 - ($size % 512));
            }
        }

        return 0;
    }


    private function php_tar_header($filename, $size, $mtime, $type) {

        $name = substr(basename($filename), -99);
        $prefix = substr(Util::normalize_path(dirname($filename)), -154);
        if ($prefix === '.') {
            $prefix = '';
        }

        $header =
            str_pad($name, 100, "\0")  // filename [100]
            . "0000755\0"  // file mode [8]
            . "0000000\0"  // uid [8]
            . "0000000\0"  // gid [8]
            . str_pad(decoct($size), 11, "0", STR_PAD_LEFT) . "\0"  // file size [12]
            . str_pad(decoct($mtime), 11, "0", STR_PAD_LEFT) . "\0"  // file modification time [12]
            . "        "  // checksum [8]
            . str_pad($type, 1)  // file type [1]
            . str_repeat("\0", 100)  // linkname [100]
            . "ustar\0"  // magic [6]
            . "00"  // version [2]
            . str_repeat("\0", 80)  // uname, gname, defmajor, devminor [32 + 32 + 8 + 8]
            . str_pad($prefix, 155, "\0")  // filename [155]
            . str_repeat("\0", 12);  // fill [12]
        assert(strlen($header) === 512);

        // checksum
        $checksum = array_sum(array_map('ord', str_split($header)));
        $checksum = str_pad(decoct($checksum), 6, "0", STR_PAD_LEFT) . "\0 ";
        $header = substr_replace($header, $checksum, 148, 8);

        return $header;
    }


    private function print_file($file) {

        // Send file content in segments to not hit PHP's memory limit (default: 128M)
        if ($fd = fopen($file, 'rb')) {
            while (!feof($fd)) {
                print fread($fd, Archive::$SEGMENT_SIZE);
                @ob_flush();
                @flush();
            }
            fclose($fd);
        }
    }


    private function add_hrefs($urls) {

        foreach ($urls as $href) {

            if (trim($href) === "") {
                continue;
            }

            $d = Util::normalize_path(dirname($href), true);
            $n = basename($href);

            if ($this->app->is_managed_url($d) && !$this->app->is_hidden($n)) {

                $real_file = $this->app->to_path($href);
                $archived_file = preg_replace("!^" . preg_quote(Util::normalize_path(CURRENT_PATH, true)) . "!", "", $real_file);

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

        if ($this->app->is_managed_path($real_dir)) {
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
