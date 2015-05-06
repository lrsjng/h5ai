<?php

class Custom {

    private static $extensions = ["html", "md"];

    function __construct($app) {

        $this->app = $app;
    }

    private function read_custom_file($path, $name, &$content, &$type) {

        foreach (Custom::$extensions as $ext) {
            $file = "$path/" . FILE_PREFIX . ".$name.$ext";
            if (is_readable($file)) {
                $content = file_get_contents($file);
                $type = $ext;
                return;
            }
        }
    }

    public function get_customizations($href) {

        if (!$this->app->query_option("custom.enabled", false)) {
            return [
                "header" => ["content" => null, "type" => null],
                "footer" => ["content" => null, "type" => null]
            ];
        }

        $path = $this->app->to_path($href);

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

        return [
            "header" => ["content" => $header, "type" => $header_type],
            "footer" => ["content" => $footer, "type" => $footer_type]
        ];
    }
}
