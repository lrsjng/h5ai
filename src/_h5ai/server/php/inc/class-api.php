<?php

class Api {


    private $actions, $app, $options;


    public function __construct($app) {

        $this->actions = array("login", "logout", "get", "getThumbHref", "download");
        $this->app = $app;
        $this->options = $app->get_options();
    }


    public function apply() {

        $action = use_request_param("action");
        json_fail(100, "unsupported request", !in_array($action, $this->actions));

        $methodname = "on_${action}";
        $this->$methodname();
    }


    private function on_login() {

        $pass = use_request_param("pass");
        $_SESSION[AS_ADMIN_SESSION_KEY] = sha1($pass) === PASSHASH;
        json_exit(array("as_admin" => $_SESSION[AS_ADMIN_SESSION_KEY]));
    }


    private function on_logout() {

        $_SESSION[AS_ADMIN_SESSION_KEY] = false;
        json_exit(array("as_admin" => $_SESSION[AS_ADMIN_SESSION_KEY]));
    }


    private function on_get() {

        $response = array();

        if (has_request_param("setup")) {

            use_request_param("setup");
            $response["setup"] = $this->app->get_setup();
        }

        if (has_request_param("options")) {

            use_request_param("options");
            $response["options"] = $this->app->get_options();
        }

        if (has_request_param("types")) {

            use_request_param("types");
            $response["types"] = $this->app->get_types();
        }

        if (has_request_param("theme")) {

            use_request_param("theme");
            $response["theme"] = $this->app->get_theme();
        }

        if (has_request_param("langs")) {

            use_request_param("langs");
            $response["langs"] = $this->app->get_l10n_list();
        }

        if (has_request_param("l10n")) {

            use_request_param("l10n");
            $iso_codes = use_request_param("l10nCodes");
            $iso_codes = explode(":", $iso_codes);
            $response["l10n"] = $this->app->get_l10n($iso_codes);
        }

        if (has_request_param("custom")) {

            use_request_param("custom");
            $url = use_request_param("customHref");
            $response["custom"] = $this->app->get_customizations($url);
        }

        if (has_request_param("items")) {

            use_request_param("items");
            $url = use_request_param("itemsHref");
            $what = use_request_param("itemsWhat");
            $what = is_numeric($what) ? intval($what, 10) : 1;
            $response["items"] = $this->app->get_items($url, $what);
        }

        if (has_request_param("all_items")) {

            use_request_param("all_items");
            $response["all_items"] = $this->app->get_all_items();
        }

        if (AS_ADMIN && count($_REQUEST)) {
            $response["unused"] = $_REQUEST;
        }

        json_exit($response);
    }


    private function on_getThumbHref() {

        json_fail(1, "thumbnails disabled", !$this->options["thumbnails"]["enabled"]);
        json_fail(2, "thumbnails not supported", !HAS_PHP_JPG);

        $type = use_request_param("type");
        $src_url = use_request_param("href");
        $mode = use_request_param("mode");
        $width = use_request_param("width");
        $height = use_request_param("height");

        $thumb = new Thumb($this->app);
        $thumb_url = $thumb->thumb($type, $src_url, $mode, $width, $height);
        json_fail(3, "thumbnail creation failed", $thumb_url === null);

        json_exit(array("absHref" => $thumb_url));
    }


    private function on_download() {

        json_fail(1, "downloads disabled", !$this->options["download"]["enabled"]);

        $as = use_request_param("as");
        $type = use_request_param("type");
        $hrefs = use_request_param("hrefs");

        $archive = new Archive($this->app);

        $hrefs = explode("|:|", trim($hrefs));

        set_time_limit(0);
        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=\"$as\"");
        header("Connection: close");
        $rc = $archive->output($type, $hrefs);

        json_fail(2, "packaging failed", $rc !== 0);
        exit;
    }
}
