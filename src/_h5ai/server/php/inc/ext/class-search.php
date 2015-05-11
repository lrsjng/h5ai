<?php

class Search {

    public function __construct($app) {

        $this->app = $app;
    }

    public function get_paths($root, $pattern = null) {

        $paths = [];
        if ($pattern && $this->app->is_managed_path($root)) {
            $re = Util::wrap_pattern($pattern);
            $names = $this->app->read_dir($root);
            foreach ($names as $name) {
                $path = $root . '/' . $name;
                if (preg_match($re, @basename($path))) {
                    $paths[] = $path;
                }
                if (@is_dir($path)) {
                    $paths = array_merge($paths, $this->get_paths($path, $pattern));
                }
            }
        }
        return $paths;
    }

    public function get_items($href, $pattern = null) {

        $cache = [];
        $root = $this->app->to_path($href);
        $paths = $this->get_paths($root, $pattern);
        $items = array_map(function ($path) {

            return Item::get($this->app, $path, $cache)->to_json_object();
        }, $paths);
        return $items;
    }
}
