<?php

class Theme {

    private static $extensions = ['svg', 'png', 'jpg'];

    function __construct($app) {

        $this->app = $app;
    }

    public function get_icons() {

        $app_path = $this->app->get_setup()->get('APP_PATH');
        $theme = $this->app->query_option('view.theme', '-NONE-');
        $theme_path = $app_path . '/client/images/themes/' . $theme;

        $icons = [];

        if (is_dir($theme_path)) {
            if ($dir = opendir($theme_path)) {
                while (($name = readdir($dir)) !== false) {
                    $path_parts = pathinfo($name);
                    if (in_array(@$path_parts['extension'], Theme::$extensions)) {
                        $icons[$path_parts['filename']] = $theme . '/' . $name;
                    }
                }
                closedir($dir);
            }
        }

        return $icons;
    }
}
