<?php

class Api {

    private $actions, $app, $options;


    public function __construct($app) {

        $this->actions = array("login", "logout", "get", "getThumbHref", "download");
        $this->app = $app;
        $this->options = $app->get_options();
    }


    public function apply() {

        $action = Util::use_request_param("action");
        Util::json_fail(100, "unsupported request", !in_array($action, $this->actions));

        $methodname = "on_${action}";
        $this->$methodname();
    }


    private function on_login() {

        $pass = Util::use_request_param("pass");
        $_SESSION[AS_ADMIN_SESSION_KEY] = sha1($pass) === PASSHASH;
        Util::json_exit(array("as_admin" => $_SESSION[AS_ADMIN_SESSION_KEY]));
    }


    private function on_logout() {

        $_SESSION[AS_ADMIN_SESSION_KEY] = false;
        Util::json_exit(array("as_admin" => $_SESSION[AS_ADMIN_SESSION_KEY]));
    }


    private function on_get() {

        $response = array();

        if (Util::has_request_param("setup")) {

            Util::use_request_param("setup");
            $response["setup"] = $this->app->get_setup();
        }

        if (Util::has_request_param("options")) {

            Util::use_request_param("options");
            $response["options"] = $this->app->get_options();
        }

        if (Util::has_request_param("types")) {

            Util::use_request_param("types");
            $response["types"] = $this->app->get_types();
        }

        if (Util::has_request_param("theme")) {

            Util::use_request_param("theme");
            $response["theme"] = $this->app->get_theme();
        }

        if (Util::has_request_param("langs")) {

            Util::use_request_param("langs");
            $response["langs"] = $this->app->get_l10n_list();
        }

        if (Util::has_request_param("l10n")) {

            Util::use_request_param("l10n");
            $iso_codes = Util::use_request_param("l10nCodes");
            $iso_codes = explode(":", $iso_codes);
            $response["l10n"] = $this->app->get_l10n($iso_codes);
        }

        if (Util::has_request_param("custom")) {

            Util::use_request_param("custom");
            $url = Util::use_request_param("customHref");
            $response["custom"] = $this->app->get_customizations($url);
        }

        if (Util::has_request_param("items")) {

            Util::use_request_param("items");
            $url = Util::use_request_param("itemsHref");
            $what = Util::use_request_param("itemsWhat");
            $what = is_numeric($what) ? intval($what, 10) : 1;
            $response["items"] = $this->app->get_items($url, $what);
        }

        if (Util::has_request_param("all_items")) {

            Util::use_request_param("all_items");
            $response["all_items"] = $this->app->get_all_items();
        }

        if (AS_ADMIN && count($_REQUEST)) {
            $response["unused"] = $_REQUEST;
        }

        Util::json_exit($response);
    }


    private function on_getThumbHref() {

        Util::json_fail(1, "thumbnails disabled", !$this->options["thumbnails"]["enabled"]);
        Util::json_fail(2, "thumbnails not supported", !HAS_PHP_JPG);

        $type = Util::use_request_param("type");
        $src_url = Util::use_request_param("href");
        $width = Util::use_request_param("width");
        $height = Util::use_request_param("height");

        $thumb = new Thumb($this->app);
        $thumb_url = $thumb->thumb($type, $src_url, $width, $height);
        Util::json_fail(3, "thumbnail creation failed", $thumb_url === null);

        Util::json_exit(array("absHref" => $thumb_url));
    }


    private function on_download() {

        Util::json_fail(1, "downloads disabled", !$this->options["download"]["enabled"]);

        $as = Util::use_request_param("as");
        $type = Util::use_request_param("type");
        $hrefs = Util::use_request_param("hrefs");

        $archive = new Archive($this->app);

        $hrefs = explode("|:|", trim($hrefs));

        set_time_limit(0);
        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=\"$as\"");
        header("Connection: close");
        $rc = $archive->output($type, $hrefs);

        Util::json_fail(2, "packaging failed", $rc !== 0);
        exit;
    }
}
