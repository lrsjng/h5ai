<?php

class Item {

    private static $FOLDER_SIZE_CACHE = "folder-sizes";

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


    // Conditions permitting, uses Linux du command to quickly set all of $path's child folder sizes
    public static function set_fast_child_folder_sizes($app, $path, &$cache) {

        $options = $app->get_options();
        if (!(HAS_CMD_DU && $options["foldersize"]["enabled"] && $options["foldersize"]["type"] === "shell-du"
              && is_array($cache) && sizeof($cache))) {
            return;
        }

        $sizes_cache_folder_path = CACHE_PATH . "/" . Item::$FOLDER_SIZE_CACHE;

        if (!is_dir($sizes_cache_folder_path)) {
            @mkdir($sizes_cache_folder_path, 0755, true);
        }


        $path_hash = sha1($path);
        $folder_sizes = array();
        $cache_enabled = $options["foldersize"]["cacheEnabled"] && HAS_WRITABLE_CACHE;
        $cache_max_age = intval($options["foldersize"]["cacheMaxAge"]);
        $now = time();
        $cache_expired = true;

        // read folder sizes from cache if enabled and not expired
        $sizes_cache_file_path = $sizes_cache_folder_path . "/folder-sizes-$path_hash.json";
        if ($cache_enabled && file_exists($sizes_cache_file_path)) {
            $data = json_decode(file_get_contents($sizes_cache_file_path),true);
            if (isset($data['items']) && isset($data['created'])) {
                $created = intval($data['created']);
                $age = $now-$created;
                if ($now - $created > $cache_max_age) {
                    unlink($sizes_cache_file_path);
                } else {
                    $cache_expired = false;
                    $folder_sizes = $data['items'];
                }
            }
        }

        if (!sizeof($folder_sizes)) {
            $du_lines = array();
            exec("du -sk $path/*/", $du_lines);  // trailing slash gets folders only
            foreach ($du_lines as $du_line) {
                // $line is bites separated by tab then full path (with trailing slash) i.e. "1024  /var/www/folder1/"
                $line_parts = explode("\t", $du_line);

                // add filesize to array with its path as the key
                $folder_sizes[$line_parts[1]] = intval($line_parts[0], 10) * 1024;
            }
        }

        if ($cache_enabled && $cache_expired && sizeof($folder_sizes)) {
            @file_put_contents($sizes_cache_file_path, json_encode(array(
                'created' => time(),
                'items' => $folder_sizes
            )));
        }


        // set folder size
        foreach($cache as $item) {
            if ($item->is_folder) { // check for folder to avoid case where a folder and file both share the same name
                $itemPath = $item->path . '/'; // trailing slash needed to match folder name
                if (isset($folder_sizes[$itemPath])) {
                    $item->size = $folder_sizes[$itemPath];
                }
            }
        }
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
