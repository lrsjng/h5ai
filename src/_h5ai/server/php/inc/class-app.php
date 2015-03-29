<?php

class App {

    private static $RE_DELIMITER = "|";
    private static $ICON_EXTS = array("svg", "png", "jpg");
    private static $CUSTOM_EXTS = array("html", "md");


    private $options;


    public function __construct() {

        $this->options = Util::load_commented_json(APP_PATH . "/conf/options.json");
    }


    public function get_options() {

        return $this->options;
    }


    public function get_setup() {

        $consts = get_defined_constants(true);
        $setup = $consts["user"];

        $setup["PHP_VERSION"] = PHP_VERSION;
        unset($setup["AS_ADMIN_SESSION_KEY"]);
        unset($setup["PASSHASH"]);

        if (!AS_ADMIN) {
            unset($setup["APP_PATH"]);
            unset($setup["CACHE_PATH"]);
            unset($setup["CURRENT_PATH"]);
            unset($setup["PHP_VERSION"]);
            unset($setup["ROOT_PATH"]);
            unset($setup["SERVER_NAME"]);
            unset($setup["SERVER_VERSION"]);
        }

        return $setup;
    }


    public function get_types() {

        return Util::load_commented_json(APP_PATH . "/conf/types.json");
    }


    public function get_theme() {

        $theme = $this->options["view"]["theme"];
        $theme_path = APP_PATH . "/client/images/themes/${theme}";

        $icons = array();

        if (is_dir($theme_path)) {
            if ($dir = opendir($theme_path)) {
                while (($name = readdir($dir)) !== false) {
                    $path_parts = pathinfo($name);
                    if (in_array(@$path_parts["extension"], App::$ICON_EXTS)) {
                        $icons[$path_parts["filename"]] = "${theme}/${name}";
                    }
                }
                closedir($dir);
            }
        }

        return $icons;
    }


    public function to_url($path, $trailing_slash = true) {

        $rel_path = substr($path, strlen(ROOT_PATH));
        $parts = explode("/", $rel_path);
        $encoded_parts = array();
        foreach ($parts as $part) {
            if ($part != "") {
                $encoded_parts[] = rawurlencode($part);
            }
        }

        return Util::normalize_path(ROOT_HREF . implode("/", $encoded_parts), $trailing_slash);
    }


    public function to_path($url) {

        $rel_url = substr($url, strlen(ROOT_HREF));
        return Util::normalize_path(ROOT_PATH . "/" . rawurldecode($rel_url));
    }


    public function is_hidden($name) {

        // always hide
        if ($name === "." || $name === "..") {
            return true;
        }

        foreach ($this->options["view"]["hidden"] as $re) {
            $re = App::$RE_DELIMITER . str_replace(App::$RE_DELIMITER, '\\' . App::$RE_DELIMITER, $re) . App::$RE_DELIMITER;
            if (preg_match($re, $name)) {
                return true;
            }
        }

        return false;
    }


    public function read_dir($path) {

        $names = array();
        if (is_dir($path)) {
            foreach (scandir($path) as $name) {
                if (
                    $this->is_hidden($name)
                    || $this->is_hidden($this->to_url($path) . $name)
                    || (!is_readable($path .'/'. $name) && $this->options["view"]["hideIf403"])
                ) {
                    continue;
                }
                $names[] = $name;
            }
        }
        return $names;
    }


    public function is_managed_url($url) {

        return $this->is_managed_path($this->to_path($url));
    }


    public function is_managed_path($path) {

        if (!is_dir($path) || strpos($path, '../') !== false || strpos($path, '/..') !== false || $path === '..') {
            return false;
        }

        if ($path === APP_PATH || strpos($path, APP_PATH . '/') === 0) {
            return false;
        }

        foreach ($this->options["view"]["unmanaged"] as $name) {
            if (file_exists($path . "/" . $name)) {
                return false;
            }
        }

        while ($path !== ROOT_PATH) {
            if (@is_dir($path . "/_h5ai/server")) {
                return false;
            }
            $parent_path = Util::normalize_path(dirname($path));
            if ($parent_path === $path) {
                return false;
            }
            $path = $parent_path;
        }
        return true;
    }


    public function get_items($url, $what) {

        if (!$this->is_managed_url($url)) {
            return array();
        }

        // return $this->get_all_items();
        // return json_decode(file_get_contents(CACHE_PATH . "/item.json"));

        $cache = array();
        $folder = Item::get($this, $this->to_path($url), $cache);

        // add content of subfolders
        if ($what >= 2 && $folder !== null) {
            foreach ($folder->get_content($cache) as $item) {
                $item->get_content($cache);
            }
            $folder = $folder->get_parent($cache);
        }

        // add content of this folder and all parent folders
        while ($what >= 1 && $folder !== null) {
            $folder->get_content($cache);
            $folder = $folder->get_parent($cache);
        }

        uasort($cache, array("Item", "cmp"));
        $result = array();
        foreach ($cache as $p => $item) {
            $result[] = $item->to_json_object();
        }

        return $result;
    }


    private function get_all_item_content($item, &$cache) {

        foreach ($item->get_content($cache) as $child) {
            if ($child->is_folder) {
                $this->get_all_item_content($child, $cache);
            }
        }
    }


    public function cummulate_folders($item, &$cache) {

        if (!$item->is_folder) {
            return;
        }

        $max_date = $item->date;
        $sum_size = 0;
        foreach ($item->get_content($cache) as $child) {
            $this->cummulate_folders($child, $cache);
            if ($child->date > $max_date) {
                $max_date = $child->date;
            }
            $sum_size += $child->size;
        }

        $item->date = $max_date;
        $item->size = $sum_size;
    }


    public function get_all_items() {

        $cache = array();
        $root = Item::get($this, ROOT_PATH, $cache);

        $this->get_all_item_content($root, $cache);
        $this->cummulate_folders($root, $cache);

        uasort($cache, array("Item", "cmp"));
        $result = array();
        foreach ($cache as $p => $item) {
            $result[] = $item->to_json_object();
        }

        @file_put_contents(CACHE_PATH . "/item.json", json_encode($result));
        return $result;
    }


    public function get_fallback() {

        $cache = array();
        $folder = Item::get($this, CURRENT_PATH, $cache);
        $items = $folder->get_content($cache);
        uasort($items, array("Item", "cmp"));

        $html = "<table>";

        $html .= "<tr>";
        $html .= "<th class='fb-i'></th>";
        $html .= "<th class='fb-n'><span>Name</span></th>";
        $html .= "<th class='fb-d'><span>Last modified</span></th>";
        $html .= "<th class='fb-s'><span>Size</span></th>";
        $html .= "</tr>";

        if ($folder->get_parent($cache)) {
            $html .= "<tr>";
            $html .= "<td class='fb-i'><img src='" . APP_HREF . "client/images/fallback/folder-parent.png' alt='folder-parent'/></td>";
            $html .= "<td class='fb-n'><a href='..'>Parent Directory</a></td>";
            $html .= "<td class='fb-d'></td>";
            $html .= "<td class='fb-s'></td>";
            $html .= "</tr>";
        }

        foreach ($items as $item) {
            $type = $item->is_folder ? "folder" : "file";

            $html .= "<tr>";
            $html .= "<td class='fb-i'><img src='" . APP_HREF . "client/images/fallback/" . $type . ".png' alt='" . $type . "'/></td>";
            $html .= "<td class='fb-n'><a href='" . $item->url . "'>" . basename($item->path) . "</a></td>";
            $html .= "<td class='fb-d'>" . date("Y-m-d H:i", $item->date) . "</td>";
            $html .= "<td class='fb-s'>" . ($item->size !== null ? intval($item->size / 1000) . " KB" : "" ) . "</td>";
            $html .= "</tr>";
        }

        $html .= "</table>";

        return $html;
    }


    public function get_l10n_list() {

        $langs = array();
        $l10n_path = APP_PATH . "/conf/l10n";
        if (is_dir($l10n_path)) {
            if ($dir = opendir($l10n_path)) {
                while (($file = readdir($dir)) !== false) {
                    if (Util::ends_with($file, ".json")) {
                        $translations = Util::load_commented_json($l10n_path . "/" . $file);
                        $langs[basename($file, ".json")] = $translations["lang"];
                    }
                }
                closedir($dir);
            }
        }
        ksort($langs);
        return $langs;
    }


    public function get_l10n($iso_codes) {

        if (!is_array($iso_codes)) {
            $iso_codes = func_get_args();
        }

        $results = array();
        foreach ($iso_codes as $iso_code) {
            if ($iso_code !== "") {
                $file = APP_PATH . "/conf/l10n/" . $iso_code . ".json";
                $results[$iso_code] = Util::load_commented_json($file);
                $results[$iso_code]["isoCode"] = $iso_code;
            }
        }

        return $results;
    }


    private function read_custom_file($path, $name, &$content, &$type) {

        foreach (APP::$CUSTOM_EXTS as $ext) {
            $file = "$path/" . FILE_PREFIX . ".$name.$ext";
            if (is_readable($file)) {
                $content = file_get_contents($file);
                $type = $ext;
                return;
            }
        }
    }


    public function get_customizations($url) {

        if (!$this->options["custom"]["enabled"]) {
            return array(
                "header" => null,
                "header_type" => null,
                "footer" => null,
                "footer_type" => null
            );
        }

        $path = $this->to_path($url);

        $header = null;
        $header_type = null;
        $footer = null;
        $footer_type = null;

        $this->read_custom_file($path, "header", $header, $header_type);
        $this->read_custom_file($path, "footer", $footer, $footer_type);

        while ($header === null || $footer === null) {

            if ($header === null) {
                $this->read_custom_file($path, "headers", $header, $header_type);
            }
            if ($footer === null) {
                $this->read_custom_file($path, "footers", $footer, $footer_type);
            }

            if ($path === ROOT_PATH) {
                break;
            }
            $parent_path = Util::normalize_path(dirname($path));
            if ($parent_path === $path) {
                break;
            }
            $path = $parent_path;
        }

        return array(
            "header" => $header,
            "header_type" => $header_type,
            "footer" => $footer,
            "footer_type" => $footer_type
        );
    }
}
