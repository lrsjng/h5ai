<?php

class Item {

    public static function cmp($item1, $item2) {

        if ($item1->is_folder && !$item2->is_folder) {
            return -1;
        }
        if (!$item1->is_folder && $item2->is_folder) {
            return 1;
        }

        return strcasecmp($item1->path, $item2->path);
    }


    public static function get($app, $path, &$cache) {

        if (!Util::starts_with($path, ROOT_PATH)) {
            return null;
        }

        if (is_array($cache) && array_key_exists($path, $cache)) {
            return $cache[$path];
        }

        $item = new Item($app, $path);

        if (is_array($cache)) {
            $cache[$path] = $item;
        }
        return $item;
    }


    public $app;
    public $path, $url, $date, $size;
    public $is_folder, $is_content_fetched;
    public $md5, $sha1;


    private function __construct($app, $path) {

        $this->app = $app;

        $this->path = Util::normalize_path($path, false);
        $this->is_folder = is_dir($this->path);
        $this->url = $app->to_url($this->path, $this->is_folder);
        $this->date = @filemtime($this->path);
        $this->size = Util::filesize($app, $this->path);
        $this->is_content_fetched = false;

        // $options = $app->get_options();
        // if (!$this->is_folder && $options["hashes"]["enabled"]) {
        if (!$this->is_folder) {
            // $this->md5 = md5_file($this->path);
            // $this->sha1 = sha1_file($this->path);
            $this->md5 = null;
            $this->sha1 = null;
        } else {
            $this->md5 = null;
            $this->sha1 = null;
        }
    }


    public function to_json_object() {

        $obj = array(
            "absHref" => $this->url,
            "time" => $this->date * 1000, // seconds (PHP) to milliseconds (JavaScript)
            "size" => $this->size
        );

        if ($this->is_folder) {
            $obj["is_managed"] = $this->app->is_managed_url($this->url);
            $obj["content"] = $this->is_content_fetched;
        } else {
            $obj["md5"] = $this->md5;
            $obj["sha1"] = $this->sha1;
        }

        return $obj;
    }


    public function get_parent(&$cache) {

        $parent_path = Util::normalize_path(dirname($this->path), false);
        if ($parent_path !== $this->path && Util::starts_with($parent_path, ROOT_PATH)) {
            return Item::get($this->app, $parent_path, $cache);
        }
        return null;
    }


    public function get_content(&$cache) {

        $items = array();

        if (!$this->app->is_managed_url($this->url)) {
            return $items;
        }

        $files = $this->app->read_dir($this->path);
        foreach ($files as $file) {
            $item = Item::get($this->app, $this->path . "/" . $file, $cache);
            $items[$item->path] = $item;
        }

        $this->is_content_fetched = true;

        return $items;
    }
}
