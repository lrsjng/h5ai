<?php

class Util {


    const ERR_MISSING_PARAM = "ERR_MISSING_PARAM";
    const ERR_ILLIGAL_PARAM = "ERR_ILLIGAL_PARAM";
    const ERR_FAILED = "ERR_FAILED";
    const ERR_DISABLED = "ERR_DISABLED";
    const ERR_UNSUPPORTED = "ERR_UNSUPPORTED";
    const NO_DEFAULT = "NO_*@+#?!_DEFAULT";
    const RE_DELIMITER = "|";


    public static function normalize_path($path, $trailing_slash = false) {

        $path = preg_replace("#[\\\\/]+#", "/", $path);
        return preg_match("#^(\w:)?/$#", $path) ? $path : (rtrim($path, "/") . ($trailing_slash ? "/" : ""));
    }


    public static function json_exit($obj = []) {

        header("Content-type: application/json;charset=utf-8");
        echo json_encode($obj);
        exit;
    }


    public static function json_fail($err, $msg = "", $cond = true) {

        if ($cond) {
            Util::json_exit(["err" => $err, "msg" => $msg]);
        }
    }


    public static function array_query($array, $keypath = "", $default = Util::NO_DEFAULT) {

        $value = $array;

        $keys = array_filter(explode(".", $keypath));
        foreach ($keys as $key) {
            if (!is_array($value) || !array_key_exists($key, $value)) {
                return $default;
            }
            $value = $value[$key];
        }

        return $value;
    }


    public static function is_post_request() {

        return (strtolower($_SERVER["REQUEST_METHOD"]) === "post");
    }


    public static function query_request_param($keypath = "", $default = Util::NO_DEFAULT) {

        $value = Util::array_query($_POST, $keypath, Util::NO_DEFAULT);

        if ($value === Util::NO_DEFAULT) {
            Util::json_fail(Util::ERR_MISSING_PARAM, "parameter '$keypath' is missing", $default === Util::NO_DEFAULT);
            return $default;
        }

        return $value;
    }


    public static function query_boolean_request_param($keypath = "", $default = Util::NO_DEFAULT) {

        $value = Util::query_request_param($keypath, $default);
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }


    public static function query_numeric_request_param($keypath = "", $default = Util::NO_DEFAULT) {

        $value = Util::query_request_param($keypath, $default);
        Util::json_fail(Util::ERR_ILLIGAL_PARAM, "parameter '$keypath' is not numeric", !is_numeric($value));
        return intval($value, 10);
    }


    public static function query_array_request_param($keypath = "", $default = Util::NO_DEFAULT) {

        $value = Util::query_request_param($keypath, $default);
        Util::json_fail(Util::ERR_ILLIGAL_PARAM, "parameter '$keypath' is no array", !is_array($value));
        return $value;
    }


    public static function starts_with($sequence, $head) {

        return substr($sequence, 0, strlen($head)) === $head;
    }


    public static function ends_with($sequence, $tail) {

        return substr($sequence, -strlen($tail)) === $tail;
    }


    public static function wrap_pattern($pattern) {

        return Util::RE_DELIMITER . str_replace(Util::RE_DELIMITER, '\\' . Util::RE_DELIMITER, $pattern) . Util::RE_DELIMITER;
    }


    public static function load_commented_json($path) {

        if (!file_exists($path)) {
            return [];
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

        $lines = [];
        $rc = null;
        exec($cmd, $lines, $rc);
        return implode("\n", $lines);
    }


    public static function exec_0($cmd) {

        $lines = [];
        $rc = null;
        try {
            @exec($cmd, $lines, $rc);
            return $rc === 0;
        } catch (Exception $e) {}
        return false;
    }


    private static $size_cache = [];

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

            if ($app->get_option("foldersize.enabled", false)) {
                if (HAS_CMD_DU && $app->get_option("foldersize.type", null) === "shell-du") {
                    $cmdv = ["du", "-sk", $path];
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
