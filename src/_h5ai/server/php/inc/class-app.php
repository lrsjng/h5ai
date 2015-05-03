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


    public function get_option($keypath, $default) {

        $value = $this->options;
        $keys = array_filter(explode(".", $keypath));
        foreach ($keys as $key) {
            if (array_key_exists($key, $value)) {
                $value = $value[$key];
            } else {
                return $default;
            }
        }
        return $value;
    }


    public function get_setup() {

        $keys = array(
            "APP_HREF",
            "ROOT_HREF",
            "VERSION",

            "AS_ADMIN",
            "HAS_CUSTOM_PASSHASH"
        );

        if (AS_ADMIN) {
            $keys = array_merge($keys, array(
                "PHP_VERSION",
                "MIN_PHP_VERSION",
                "HAS_MIN_PHP_VERSION",
                "HAS_PHP_EXIF",
                "HAS_PHP_JPEG",

                "SERVER_NAME",
                "SERVER_VERSION",
                "HAS_SERVER",

                "INDEX_HREF",

                "HAS_WRITABLE_CACHE",

                "HAS_CMD_TAR",
                "HAS_CMD_ZIP",
                "HAS_CMD_CONVERT",
                "HAS_CMD_FFMPEG",
                "HAS_CMD_AVCONV",
                "HAS_CMD_DU"
            ));
        }

        $setup = array();
        foreach ($keys as $key) {
            $setup[$key] = constant($key);
        }
        return $setup;
    }


    public function get_types() {

        return Util::load_commented_json(APP_PATH . "/conf/types.json");
    }


    public function get_theme() {

        $theme = $this->get_option("view.theme", "-NONE-");
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


    public function to_href($path, $trailing_slash = true) {

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


    public function to_path($href) {

        $rel_href = substr($href, strlen(ROOT_HREF));
        return Util::normalize_path(ROOT_PATH . "/" . rawurldecode($rel_href));
    }


    public function is_hidden($name) {

        // always hide
        if ($name === "." || $name === "..") {
            return true;
        }

        foreach ($this->get_option("view.hidden", array()) as $re) {
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
                    || $this->is_hidden($this->to_href($path) . $name)
                    || (!is_readable($path .'/'. $name) && $this->get_option("view.hideIf403", false))
                ) {
                    continue;
                }
                $names[] = $name;
            }
        }
        return $names;
    }


    public function is_managed_href($href) {

        return $this->is_managed_path($this->to_path($href));
    }


    public function is_managed_path($path) {

        if (!is_dir($path) || strpos($path, '../') !== false || strpos($path, '/..') !== false || $path === '..') {
            return false;
        }

        if ($path === APP_PATH || strpos($path, APP_PATH . '/') === 0) {
            return false;
        }

        foreach ($this->get_option("view.unmanaged", array()) as $name) {
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


    public function get_items($href, $what) {

        if (!$this->is_managed_href($href)) {
            return array();
        }

        $cache = array();
        $folder = Item::get($this, $this->to_path($href), $cache);

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


    private function get_current_path() {

        $uri_parts = parse_url(getenv("REQUEST_URI"));
        $current_href = Util::normalize_path($uri_parts["path"], true);
        $current_path = $this->to_path($current_href);

        if (!is_dir($current_path)) {
            $current_path = Util::normalize_path(dirname($current_path), false);
        }

        return $current_path;
    }


    public function get_fallback($path = null) {

        if (!$path) {
            $path = $this->get_current_path();
        }

        $cache = array();
        $folder = Item::get($this, $path, $cache);
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
            $html .= "<td class='fb-n'><a href='" . $item->href . "'>" . basename($item->path) . "</a></td>";
            $html .= "<td class='fb-d'>" . date("Y-m-d H:i", $item->date) . "</td>";
            $html .= "<td class='fb-s'>" . ($item->size !== null ? intval($item->size / 1000) . " KB" : "" ) . "</td>";
            $html .= "</tr>";
        }

        $html .= "</table>";

        return $html;
    }


    public function get_langs() {

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

        $results = array();

        foreach ($iso_codes as $iso_code) {
            $file = APP_PATH . "/conf/l10n/" . $iso_code . ".json";
            $results[$iso_code] = Util::load_commented_json($file);
            $results[$iso_code]["isoCode"] = $iso_code;
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


    public function get_customizations($href) {

        if (!$this->get_option("custom.enabled", false)) {
            return array(
                "header" => null,
                "headerType" => null,
                "footer" => null,
                "footerType" => null
            );
        }

        $path = $this->to_path($href);

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
            "headerType" => $header_type,
            "footer" => $footer,
            "footerType" => $footer_type
        );
    }
}
