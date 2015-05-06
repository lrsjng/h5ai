<?php

class Search {

    function __construct($app) {

        $this->app = $app;
    }

    function get_paths($root, $pattern = null) {

        $paths = [];
        if ($this->app->is_managed_path($root)) {
            $names = $this->app->read_dir($root);
            foreach ($names as $name) {
                $path = $root . "/" . $name;
                if ($pattern && $this->matches($path, $pattern)) {
                    $paths[] = $path;
                }
                if (@is_dir($path)) {
                    $paths = array_merge($paths, $this->get_paths($path, $pattern));
                }
            }
        }
        return $paths;
    }

    function get_items($href, $pattern = null) {

        $cache = [];
        $root = $this->app->to_path($href);
        $paths = $this->get_paths($root, $pattern);
        $items = array_map(function ($path) {

            return Item::get($this->app, $path, $cache)->to_json_object();
        }, $paths);
        return $items;
    }

    function matches($path, $pattern) {

        return preg_match($pattern, basename($path)) === 1;
    }
}
