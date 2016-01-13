<?php

class Session {
    private static $KEY_PREFIX = '__H5AI__';
    private $store;

    public function __construct(&$store) {
        $this->store = &$store;
    }

    public function set($key, $value) {
        $key = Session::$KEY_PREFIX . $key;
        $this->store[$key] = $value;
    }

    public function get($key, $default = null) {
        $key = Session::$KEY_PREFIX . $key;
        return array_key_exists($key, $this->store) ? $this->store[$key] : $default;
    }
}
