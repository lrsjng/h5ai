<?php

class Session {

    private static $key_prefix = '__H5AI__';
    private $store;

    public function __construct(&$store) {

        $this->store = &$store;
    }

    public function set($key, $value) {

        $key = Session::$key_prefix . $key;
        $this->store[$key] = $value;
    }

    public function get($key, $default = null) {

        $key = Session::$key_prefix . $key;
        return array_key_exists($key, $this->store) ? $this->store[$key] : $default;
    }
}
