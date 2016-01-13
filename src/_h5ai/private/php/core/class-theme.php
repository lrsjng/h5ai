<?php

class Theme {
    private static $EXTENSIONS = ['svg', 'png', 'jpg'];
    private $context;

    public function __construct($context) {
        $this->context = $context;
    }

    public function get_icons() {
        $public_path = $this->context->get_setup()->get('PUBLIC_PATH');
        $theme = $this->context->query_option('view.theme', '-NONE-');
        $theme_path = $public_path . '/images/themes/' . $theme;

        $icons = [];

        if (is_dir($theme_path)) {
            if ($dir = opendir($theme_path)) {
                while (($name = readdir($dir)) !== false) {
                    $path_parts = pathinfo($name);
                    if (in_array(@$path_parts['extension'], Theme::$EXTENSIONS)) {
                        $icons[$path_parts['filename']] = $theme . '/' . $name;
                    }
                }
                closedir($dir);
            }
        }

        return $icons;
    }
}
