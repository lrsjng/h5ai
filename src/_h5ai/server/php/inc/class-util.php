<?php

class Util {

    public static function normalize_path($path, $trailing_slash = false) {

        $path = preg_replace("#[\\\\/]+#", "/", $path);
        return preg_match("#^(\w:)?/$#", $path) ? $path : (rtrim($path, "/") . ($trailing_slash ? "/" : ""));
    }


    public static function json_exit($obj = array()) {

        if (!isset($obj["code"])) {
            $obj["code"] = 0;
        }

        header("Content-type: application/json;charset=utf-8");
        echo json_encode($obj);
        exit;
    }


    public static function json_fail($code, $msg = "", $cond = true) {

        if ($cond) {
            Util::json_exit(array("code" => $code, "msg" => $msg));
        }
    }


    public static function has_request_param($key) {

        return array_key_exists($key, $_REQUEST);
    }


    public static function use_request_param($key, $default = null) {

        if (!array_key_exists($key, $_REQUEST)) {
            Util::json_fail(101, "parameter '$key' is missing", $default === null);
            return $default;
        }

        $value = $_REQUEST[$key];
        unset($_REQUEST[$key]);
        return $value;
    }


    public static function starts_with($sequence, $head) {

        return substr($sequence, 0, strlen($head)) === $head;
    }


    public static function ends_with($sequence, $tail) {

        return substr($sequence, -strlen($tail)) === $tail;
    }


    public static function load_commented_json($path) {

        if (!file_exists($path)) {
            return array();
        }

        $content = file_get_contents($path);

        // remove comments to get pure json
        $content = preg_replace("/\/\*.*?\*\/|\/\/.*?(\n|$)/s", "", $content);

        return json_decode($content, true);
    }


    public static function save_json($path, $obj) {

        $json = json_encode($obj);
        return file_put_contents($path, $json) !== false;
    }


    public static function passthru_cmd($cmd) {

        $rc = null;
        passthru($cmd, $rc);
        return $rc;
    }


    public static function exec_cmdv($cmdv) {

        if (!is_array($cmdv)) {
            $cmdv = func_get_args();
        }
        $cmd = implode(" ", array_map("escapeshellarg", $cmdv));

        $lines = array();
        $rc = null;
        exec($cmd, $lines, $rc);
        return implode("\n", $lines);
    }


    public static function exec_0($cmd) {

        $lines = array();
        $rc = null;
        try {
            @exec($cmd, $lines, $rc);
            return $rc === 0;
        } catch (Exception $e) {}
        return false;
    }


    private static $size_cache = array();

    public static function filesize($app, $path) {

        if (array_key_exists($path, Util::$size_cache)) {
            return Util::$size_cache[$path];
        }

        $size = null;

        if (is_file($path)) {

            if (PHP_INT_SIZE < 8) {
                $_handle = fopen($path, "r");

                $_pos = 0;
                $_size = 1073741824;
                fseek($_handle, 0, SEEK_SET);
                while ($_size > 1) {
                    fseek($_handle, $_size, SEEK_CUR);

                    if (fgetc($_handle) === false) {
                        fseek($_handle, -$_size, SEEK_CUR);
                        $_size = (int)($_size / 2);
                    } else {
                        fseek($_handle, -1, SEEK_CUR);
                        $_pos += $_size;
                    }
                }

                while (fgetc($_handle) !== false) {
                    $_pos++;
                }
                fclose($_handle);

                $size = $_pos;
            } else {
                $size = @filesize($path);
            }

        } else if (is_dir($path)) {

            $options = $app->get_options();
            if ($options["foldersize"]["enabled"]) {
                if (HAS_CMD_DU && $options["foldersize"]["type"] === "shell-du") {
                    $cmdv = array("du", "-sk", $path);
                    $size = intval(preg_replace("#\s.*$#", "", Util::exec_cmdv($cmdv)), 10) * 1024;
                } else {
                    $size = 0;
                    foreach ($app->read_dir($path) as $name) {
                        $size += Util::filesize($app, $path . "/" . $name);
                    }
                }
            }
        }

        Util::$size_cache[$path] = $size;
        return $size;
    }
}
