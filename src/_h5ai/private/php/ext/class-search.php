<?php

class Search {
    private $context;

    public function __construct($context) {
        $this->context = $context;
    }

    public function get_paths($root, $pattern = null, $ignorecase = false) {
        $paths = [];
        if ($pattern && $this->context->is_managed_path($root)) {
            $re = Util::wrap_pattern($pattern);
            if ($ignorecase) {
                $re .= 'i';
            }
            $names = $this->context->read_dir($root);
            foreach ($names as $name) {
                $path = $root . '/' . $name;
                if (preg_match($re, @basename($path))) {
                    $paths[] = $path;
                }
                if (@is_dir($path)) {
                    $paths = array_merge($paths, $this->get_paths($path, $pattern, $ignorecase));
                }
            }
        }
        return $paths;
    }

    public function get_items($href, $pattern = null, $ignorecase = false) {
        $cache = [];
        $root = $this->context->to_path($href);
        $paths = $this->get_paths($root, $pattern, $ignorecase);
        $items = array_map(function ($path) {
            return Item::get($this->context, $path, $cache)->to_json_object();
        }, $paths);
        return $items;
    }
}
