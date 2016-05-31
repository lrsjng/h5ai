<?php

class Json {
    const SINGLE = 1;
    const MULTI = 2;

    public static function load($path) {
        if (!is_readable($path)) {
            return [];
        }

        $json = file_get_contents($path);
        return Json::decode($json);
    }

    public static function save($path, $obj) {
        $json = json_encode($obj);
        return file_put_contents($path, $json) !== false;
    }

    public static function decode($json) {
        $json = Json::strip($json);
        return json_decode($json, true);
    }

    public static function strip($commented_json) {
        $insideString = false;
        $insideComment = false;
        $json = '';

        $len = strlen($commented_json);
        for ($i = 0; $i < $len; $i++) {
            $char = $commented_json[$i];
            $charchar = $char . @$commented_json[$i + 1];
            $prevChar = @$commented_json[$i - 1];

            if (!$insideComment && $char === '"' && $prevChar !== "\\") {
                $insideString = !$insideString;
            }

            if ($insideString) {
                $json .= $char;
            } elseif (!$insideComment && $charchar === '//') {
                $insideComment = Json::SINGLE;
                $i++;
            } elseif (!$insideComment && $charchar === '/*') {
                $insideComment = Json::MULTI;
                $i++;
            } elseif (!$insideComment) {
                $json .= $char;
            } elseif ($insideComment === Json::SINGLE && $charchar === "\r\n") {
                $insideComment = false;
                $json .= $charchar;
                $i++;
            } elseif ($insideComment === Json::SINGLE && $char === "\n") {
                $insideComment = false;
                $json .= $char;
            } elseif ($insideComment === Json::MULTI && $charchar === '*/') {
                $insideComment = false;
                $i++;
            }
        }

        return $json;
    }
}
