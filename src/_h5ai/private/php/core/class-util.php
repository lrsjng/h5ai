<?php

class Util {
    const ERR_MISSING_PARAM = 'ERR_MISSING_PARAM';
    const ERR_ILLIGAL_PARAM = 'ERR_ILLIGAL_PARAM';
    const ERR_FAILED = 'ERR_FAILED';
    const ERR_DISABLED = 'ERR_DISABLED';
    const ERR_UNSUPPORTED = 'ERR_UNSUPPORTED';
    const NO_DEFAULT = 'NO_*@+#?!_DEFAULT';
    const RE_DELIMITER = '@';
    // 'file' has to be the last item!
    public const AVAILABLE_TYPES = ['img', 'mov', 'doc', 'swf', 'file'];

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

    public static function exec_cmdv($cmdv, $capture = false, $redirect = false) {
        $cmd = implode(' ', array_map('escapeshellarg', $cmdv));

        if ($redirect) {
            // Redirect stderr to stdout (notably for ffmpeg)
            $cmd .= ' 2>&1'; // This cannot be shellarg-escaped
        }

        if ($capture){
            $lines = [];
            $rc = null;
            exec($cmd, $lines, $rc);
            return [$lines, $rc];
        }
        return exec($cmd);
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

    public static function proc_open_cmdv($cmdv, &$output, &$error) {
        $cmd = implode(' ', array_map('escapeshellarg', $cmdv));

        $descriptorspec = array(
            0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
            1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
            2 => array("pipe", "w")   // stderr is a pipe the child will write to
        );
        $process = proc_open($cmd, $descriptorspec, $pipes);

        if (is_resource($process)) {
            fclose($pipes[0]);  // We usually don't need stdin

            if (is_resource($output)) {
                stream_copy_to_stream($pipes[1], $output);
            } else {
                $output = stream_get_contents($pipes[1]);
            }
            fclose($pipes[1]);

            $error = stream_get_contents($pipes[2]);
            fclose($pipes[2]);

            $exit_code = proc_close($process);
            return $exit_code;
        }
        return -1;
    }

    public static function filesize($context, $path) {
        $withFoldersize = $context->query_option('foldersize.enabled', false);
        $withDu = $context->get_setup()->get('HAS_CMD_DU') && $context->query_option('foldersize.type', null) === 'shell-du';
        return Filesize::getCachedSize($path, $withFoldersize, $withDu);
    }

    public static function get_mimetype($source_path) {
        //return mime_content_type($filename);
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        return $finfo->file($source_path);
    }

    public static function mime_to_type($mime) {
        if (strpos($mime, 'image') !== false) {
            return 'img';
        }
        if (strpos($mime, 'video') !== false) {
            return 'mov';
        }
        if (strpos($mime, 'pdf') !== false) {
            return 'doc';
        }
        if (strpos($mime, 'flash') !== false) {
            return 'swf';
        }
        return 'file';
    }

    public static function get_types_array($type) {
        /* Returns an array of possible types, with $type as the first element*/
        $types = Util::AVAILABLE_TYPES;
        $key = array_search($type, $types);
        if ($key !== false) {
            unset($types[$key]);
            array_unshift($types, $type);
        }
        return $types;
    }
}
