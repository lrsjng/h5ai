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


    private static $size_cache = array();


    private static function filesize($app, $path) {

        if (array_key_exists($path, Item::$size_cache)) {
            return Item::$size_cache[$path];
        }

        $size = null;

        if (is_file($path)) {

            if (PHP_INT_SIZE < 8) {
                $_handle = fopen($path, "r");

                $_pos = 0;
                $_size = 1073741824;
                fseek($_handle, 0, SEEK_SET);
                while ($_size > 1) {
                    fseek($_handle, $_size, SEEK_CUR);

                    if (fgetc($_handle) === false) {
                        fseek($_handle, -$_size, SEEK_CUR);
                        $_size = (int)($_size / 2);
                    } else {
                        fseek($_handle, -1, SEEK_CUR);
                        $_pos += $_size;
                    }
                }

                while (fgetc($_handle) !== false) {
                    $_pos++;
                }
                fclose($_handle);

                $size = $_pos;
            } else {
                $size = @filesize($path);
            }

        } else if (is_dir($path)) {

            $options = $app->get_options();
            if ($options["foldersize"]["enabled"]) {
                if (HAS_CMD_DU && $options["foldersize"]["type"] === "shell-du") {
                    $cmdv = array("du", "-sk", $path);
                    $size = intval(preg_replace("#\s.*$#", "", exec_cmdv($cmdv)), 10) * 1024;
                } else {
                    $size = 0;
                    foreach ($app->read_dir($path) as $name) {
                        $size += Item::filesize($app, $path . "/" . $name);
                    }
                }
            }
        }

        Item::$size_cache[$path] = $size;
        return $size;
    }


    public static function get($app, $path, &$cache) {

        if (!starts_with($path, ROOT_PATH)) {
            err_log("ILLEGAL REQUEST: " . $path . ", " . ROOT_PATH);
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


    public $app,
            $path, $url,
            $date, $size,
            $is_folder,
            $is_content_fetched;


    private function __construct($app, $path) {

        $this->app = $app;

        $this->path = normalize_path($path, false);
        $this->is_folder = is_dir($this->path);
        $this->url = $app->to_url($this->path, $this->is_folder);
        $this->date = @filemtime($this->path);
        $this->size = Item::filesize($app, $this->path);
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

        $parent_path = normalize_path(dirname($this->path), false);
        if ($parent_path !== $this->path && starts_with($parent_path, ROOT_PATH)) {
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
