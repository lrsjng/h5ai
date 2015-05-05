<?php

class Bootstrap {

    public static function run() {

        $bs = new Bootstrap();
        $bs->setup_php();
        $bs->setup_app();
        $bs->setup_admin();
        $bs->setup_server();
        $bs->setup_paths();
        $bs->setup_cache();
        $bs->setup_ext_cmds();

        $app = new App();
        if (Util::is_post_request()) {
            $api = new Api($app);
            $api->apply();
        } else {
            define("FALLBACK", $app->get_fallback());
            normalized_require_once("page");
        }
    }


    private function setup_php() {

        putenv("LANG=en_US.UTF-8");
        setlocale(LC_CTYPE, "en_US.UTF-8");
        date_default_timezone_set(@date_default_timezone_get());

        define("MIN_PHP_VERSION", "5.4.0");
        define("HAS_MIN_PHP_VERSION", version_compare(PHP_VERSION, MIN_PHP_VERSION) >= 0);
        define("HAS_PHP_EXIF", function_exists("exif_thumbnail"));
        $has_php_jpeg = false;
        if (function_exists("gd_info")) {
            $infos = gd_info();
            $has_php_jpeg = array_key_exists("JPEG Support", $infos) && $infos["JPEG Support"];
        }
        define("HAS_PHP_JPEG", $has_php_jpeg);
    }


    private function setup_app() {

        define("NAME", "{{pkg.name}}");
        define("VERSION", "{{pkg.version}}");
        define("FILE_PREFIX", "_{{pkg.name}}");
    }


    private function setup_admin() {

        session_start();
        define("AS_ADMIN_SESSION_KEY", "__H5AI_AS_ADMIN__");
        define("AS_ADMIN", isset($_SESSION[AS_ADMIN_SESSION_KEY]) && $_SESSION[AS_ADMIN_SESSION_KEY] === true);
        define("HAS_CUSTOM_PASSHASH", PASSHASH !== "da39a3ee5e6b4b0d3255bfef95601890afd80709");
    }


    private function setup_server() {

        $server_name = null;
        $server_version = null;
        $server_software = getenv("SERVER_SOFTWARE");
        if ($server_software && preg_match("#^(.*?)(?:/(.*?))?(?: |$)#", strtolower($server_software), $matches)) {
            $server_name = $matches[1];
            $server_version = count($matches) > 2 ? $matches[2] : '';
        }
        define("SERVER_NAME", $server_name);
        define("SERVER_VERSION", $server_version);
        define("HAS_SERVER", in_array($server_name, ["apache", "lighttpd", "nginx", "cherokee"]));
    }


    private function setup_paths() {

        $script_name = getenv("SCRIPT_NAME");
        if (SERVER_NAME === "lighttpd") {
            $script_name = preg_replace("#^.*?//#", "/", $script_name);
        }
        define("APP_HREF", Util::normalize_path(dirname(dirname(dirname($script_name))), true));
        define("APP_PATH", Util::normalize_path(dirname(dirname(dirname(dirname(__FILE__)))), false));

        define("ROOT_HREF", Util::normalize_path(dirname(APP_HREF), true));
        define("ROOT_PATH", Util::normalize_path(dirname(APP_PATH), false));

        $index_href = null;
        if (@is_readable(Util::normalize_path(APP_PATH . "/server/php/index.php", false))) {
            $index_href = Util::normalize_path(APP_HREF . "/server/php/index.php", false);
        }
        define("INDEX_HREF", $index_href);
    }


    private function setup_cache() {

        define("CACHE_HREF", Util::normalize_path(APP_HREF . "/cache", true));
        define("CACHE_PATH", Util::normalize_path(APP_PATH . "/cache", false));
        define("HAS_WRITABLE_CACHE", @is_writable(CACHE_PATH));
    }


    private function setup_ext_cmds() {

        define("CMDS_PATH", Util::normalize_path(CACHE_PATH . "/cmds.json", false));

        $cmds = Util::load_commented_json(CMDS_PATH);
        if (sizeof($cmds) === 0 || Util::get_boolean_request_param("updatecmds", false)) {
            $cmds["command"] = Util::exec_0("command -v command");
            $cmds["which"] = Util::exec_0("which which");

            $cmd = false;
            if ($cmds["command"]) {
                $cmd = "command -v";
            } else if ($cmds["which"]) {
                $cmd = "which";
            }

            foreach (["tar", "zip", "convert", "ffmpeg", "avconv", "du"] as $c) {
                $cmds[$c] = ($cmd !== false) && Util::exec_0($cmd . " " . $c);
            }

            Util::save_json(CMDS_PATH, $cmds);
        }
        foreach ($cmds as $c => $has) {
            define("HAS_CMD_" . strtoupper($c), $has);
        }
    }
}
