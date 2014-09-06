<?php

class Logger {

    private static $start;
    private static $prev;

    public static function init() {

        self::$start = self::time();
        self::$prev = self::$start;
        register_shutdown_function(function () { Logger::log('shutdown'); });
        Logger::log('--------------------------------');
    }

    private static function time() {

        return microtime(true) * 1000; // sec * 1000 = ms
    }

    public static function log($message=null, $obj=null) {

        $now = self::time();
        $message = number_format($now - self::$start, 3) . " " . number_format($now - self::$prev, 3) . " " . $message;

        @error_log($message . " " . var_export($obj, true));
        // @ChromePhp::log($message, $obj);

        self::$prev = $now;
    }
}
Logger::init();
