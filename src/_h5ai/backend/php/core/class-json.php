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

        for ($i = 0; $i < strlen($commented_json); $i += 1) {

            $char = $commented_json[$i];
            $charchar = $char . @$commented_json[$i + 1];
            $prevChar = @$commented_json[$i - 1];

            if (!$insideComment && $char === '"' && $prevChar !== "\\") {
                $insideString = !$insideString;
            }

            if ($insideString) {
                $json .= $char;
            } else if (!$insideComment && $charchar === '//') {
                $insideComment = Json::SINGLE;
                $i += 1;
            } else if (!$insideComment && $charchar === '/*') {
                $insideComment = Json::MULTI;
                $i += 1;
            } else if (!$insideComment) {
                $json .= $char;
            } else if ($insideComment === Json::SINGLE && $charchar === "\r\n") {
                $insideComment = false;
                $json .= $charchar;
                $i += 1;
            } else if ($insideComment === Json::SINGLE && $char === "\n") {
                $insideComment = false;
                $json .= $char;
            } else if ($insideComment === Json::MULTI && $charchar === '*/') {
                $insideComment = false;
                $i += 1;
            }
        }

        return $json;
    }
}
