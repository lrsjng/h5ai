<?php

class Util {
    const ERR_MISSING_PARAM = 'ERR_MISSING_PARAM';
    const ERR_ILLIGAL_PARAM = 'ERR_ILLIGAL_PARAM';
    const ERR_FAILED = 'ERR_FAILED';
    const ERR_DISABLED = 'ERR_DISABLED';
    const ERR_UNSUPPORTED = 'ERR_UNSUPPORTED';
    const NO_DEFAULT = 'NO_*@+#?!_DEFAULT';
    const RE_DELIMITER = '@';

    public static function normalize_path($path, $trailing_slash = false) {
        $path = preg_replace('#[\\\\/]+#', '/', $path);
        return preg_match('#^(\w:)?/$#', $path) ? $path : (rtrim($path, '/') . ($trailing_slash ? '/' : ''));
    }

    public static function json_exit($obj = []) {
        header('Content-type: application/json;charset=utf-8');
        echo json_encode($obj);
        exit;
    }

    public static function json_fail($err, $msg = '', $cond = true) {
        if ($cond) {
            Util::json_exit(['err' => $err, 'msg' => $msg]);
        }
    }

    public static function array_query($array, $keypath = '', $default = Util::NO_DEFAULT) {
        $value = $array;

        $keys = array_filter(explode('.', $keypath));
        foreach ($keys as $key) {
            if (!is_array($value) || !array_key_exists($key, $value)) {
                return $default;
            }
            $value = $value[$key];
        }

        return $value;
    }

    public static function starts_with($sequence, $head) {
        return substr($sequence, 0, strlen($head)) === $head;
    }

    public static function ends_with($sequence, $tail) {
        $len = strlen($tail);
        return $len === 0 ? true : substr($sequence, -$len) === $tail;
    }

    public static function wrap_pattern($pattern) {
        return Util::RE_DELIMITER . str_replace(Util::RE_DELIMITER, '\\' . Util::RE_DELIMITER, $pattern) . Util::RE_DELIMITER;
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
        $cmd = implode(' ', array_map('escapeshellarg', $cmdv));

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

    public static function filesize($context, $path) {
        $withFoldersize = $context->query_option('foldersize.enabled', false);
        $withDu = $context->get_setup()->get('HAS_CMD_DU') && $context->query_option('foldersize.type', null) === 'shell-du';
        return Filesize::getCachedSize($path, $withFoldersize, $withDu);
    }
}
