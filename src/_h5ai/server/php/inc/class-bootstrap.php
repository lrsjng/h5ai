<?php

class Bootstrap {

    public static function run() {

        Bootstrap::setup();

        $app = new App();
        if (Util::has_request_param("action")) {
            $api = new Api($app);
            $api->apply();
        } else {
            define("FALLBACK", $app->get_fallback());
            normalized_require_once("page");
        }
    }


    public static function setup() {

        // MISC
        putenv("LANG=en_US.UTF-8");
        setlocale(LC_CTYPE, "en_US.UTF-8");
        date_default_timezone_set("UTC");

        define("NAME", "{{pkg.name}}");
        define("VERSION", "{{pkg.version}}");

        define("BACKEND", "PHP");
        define("API", true);
        define("FILE_PREFIX", "_{{pkg.name}}");


        // ADMIN
        session_start();
        define("AS_ADMIN_SESSION_KEY", "__H5AI_AS_ADMIN__");
        define("AS_ADMIN", isset($_SESSION[AS_ADMIN_SESSION_KEY]) && $_SESSION[AS_ADMIN_SESSION_KEY] === true);
        define("HAS_CUSTOM_PASSHASH", PASSHASH !== "da39a3ee5e6b4b0d3255bfef95601890afd80709");


        // PHP
        define("MIN_PHP_VERSION", "5.3.0");
        define("HAS_PHP_VERSION", version_compare(PHP_VERSION, MIN_PHP_VERSION) >= 0);
        define("HAS_PHP_EXIF", function_exists("exif_thumbnail"));
        $has_php_jpg = false;
        if (function_exists("gd_info")) {
            $infos = gd_info();
            $has_php_jpg = array_key_exists("JPG Support", $infos) && $infos["JPG Support"] || array_key_exists("JPEG Support", $infos) && $infos["JPEG Support"];
        }
        define("HAS_PHP_JPG", $has_php_jpg);


        // SERVER
        $server_name = null;
        $server_version = null;
        $server_software = getenv("SERVER_SOFTWARE");
        if ($server_software && preg_match("#^(.*?)(?:/(.*?))?(?: |$)#", strtolower($server_software), $matches)) {
            $server_name = $matches[1];
            $server_version = count($matches) > 2 ? $matches[2] : '';
        }
        define("SERVER_NAME", $server_name);
        define("SERVER_VERSION", $server_version);
        define("HAS_SERVER", in_array($server_name, array("apache", "lighttpd", "nginx", "cherokee")));
        define("HAS_WIN_OS", strtolower(substr(PHP_OS, 0, 3)) === "win");


        // PATHS
        $script_name = getenv("SCRIPT_NAME");
        if (SERVER_NAME === "lighttpd") {
            $script_name = preg_replace("#^.*?//#", "/", $script_name);
        }
        define("APP_HREF", Util::normalize_path(dirname(dirname(dirname($script_name))), true));
        define("APP_PATH", Util::normalize_path(dirname(dirname(dirname(dirname(__FILE__)))), false));

        define("ROOT_HREF", Util::normalize_path(dirname(APP_HREF), true));
        define("ROOT_PATH", Util::normalize_path(dirname(APP_PATH), false));

        $uri_parts = parse_url(getenv("REQUEST_URI"));
        $current_href = Util::normalize_path($uri_parts["path"], true);
        $rel_href = substr($current_href, strlen(ROOT_HREF));
        $current_path = Util::normalize_path(ROOT_PATH . "/" . rawurldecode($rel_href));
        if (!is_dir($current_path)) {
            $current_href = Util::normalize_path(dirname($current_href), true);
            $current_path = Util::normalize_path(dirname($current_path), false);
        }
        define("CURRENT_HREF", $current_href);
        define("CURRENT_PATH", $current_path);

        $index_href = null;
        if (@is_readable(Util::normalize_path(APP_PATH . "/server/php/index.php", false))) {
            $index_href = Util::normalize_path(APP_HREF . "/server/php/index.php", false);
        }
        define("INDEX_HREF", $index_href);

        define("CACHE_HREF", Util::normalize_path(APP_HREF . "/cache", true));
        define("CACHE_PATH", Util::normalize_path(APP_PATH . "/cache", false));
        define("HAS_WRITABLE_CACHE", @is_writable(CACHE_PATH));
        define("CMDS_PATH", Util::normalize_path(CACHE_PATH . "/cmds.json", false));


        // EXTERNAL COMMANDS
        $cmds = Util::load_commented_json(CMDS_PATH);
        if (sizeof($cmds) === 0 || Util::has_request_param("updatecmds")) {
            $cmds["command"] = Util::exec_0("command -v command");
            $cmds["which"] = Util::exec_0("which which");

            $cmd = false;
            if ($cmds["command"]) {
                $cmd = "command -v";
            } else if ($cmds["which"]) {
                $cmd = "which";
            }

            foreach (array("tar", "zip", "convert", "ffmpeg", "avconv", "du") as $c) {
                $cmds[$c] = ($cmd !== false) && Util::exec_0($cmd . " " . $c);
            }

            Util::save_json(CMDS_PATH, $cmds);
        }
        foreach ($cmds as $c => $has) {
            define("HAS_CMD_" . strtoupper($c), $has);
        }
    }
}
