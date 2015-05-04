<?php

class Api {

    private $app;


    public function __construct($app) {

        $this->app = $app;
    }


    public function apply() {

        $action = Util::get_request_param("action");
        $supported = array("login", "logout", "get", "download");
        Util::json_fail(Util::ERR_UNSUPPORTED, "unsupported action", !in_array($action, $supported));

        $methodname = "on_${action}";
        $this->$methodname();
    }


    private function on_login() {

        $pass = Util::get_request_param("pass");
        $_SESSION[AS_ADMIN_SESSION_KEY] = sha1($pass) === PASSHASH;
        Util::json_exit(array("asAdmin" => $_SESSION[AS_ADMIN_SESSION_KEY]));
    }


    private function on_logout() {

        $_SESSION[AS_ADMIN_SESSION_KEY] = false;
        Util::json_exit(array("asAdmin" => $_SESSION[AS_ADMIN_SESSION_KEY]));
    }


    private function on_get() {

        $response = array();

        foreach (array("setup", "options", "types", "theme", "langs") as $name) {
            if (Util::get_boolean_request_param($name, false)) {

                $methodname = "get_${name}";
                $response[$name] = $this->app->$methodname();
            }
        }

        if (Util::get_request_param("l10n", false)) {

            $iso_codes = Util::get_request_param("l10n");
            $iso_codes = array_filter($iso_codes);
            $response["l10n"] = $this->app->get_l10n($iso_codes);
        }

        if (Util::get_request_param("custom", false)) {

            $href = Util::get_request_param("custom");
            $response["custom"] = $this->app->get_customizations($href);
        }

        if (Util::get_request_param("items", false)) {

            $items = Util::get_request_param("items");
            $href = $items["href"];
            $what = $items["what"];
            $what = is_numeric($what) ? intval($what, 10) : 1;
            $response["items"] = $this->app->get_items($href, $what);
        }

        if (Util::get_request_param("thumbs", false)) {

            Util::json_fail(Util::ERR_DISABLED, "thumbnails disabled", !$this->app->get_option("thumbnails.enabled", false));
            Util::json_fail(Util::ERR_UNSUPPORTED, "thumbnails not supported", !HAS_PHP_JPEG);

            $thumbs = Util::get_request_param("thumbs");
            $response["thumbs"] = $this->app->get_thumbs($thumbs);
        }

        Util::json_exit($response);
    }


    private function on_download() {

        Util::json_fail(Util::ERR_DISABLED, "downloads disabled", !$this->app->get_option("download.enabled", false));

        $as = Util::get_request_param("as");
        $type = Util::get_request_param("type");
        $base_href = Util::get_request_param("baseHref");
        $hrefs = Util::get_request_param("hrefs");

        $archive = new Archive($this->app);

        set_time_limit(0);
        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=\"$as\"");
        header("Connection: close");
        $rc = $archive->output($type, $base_href, $hrefs);

        Util::json_fail(Util::ERR_FAILED, "packaging failed", $rc !== 0);
        exit;
    }
}
