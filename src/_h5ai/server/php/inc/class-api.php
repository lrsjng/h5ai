<?php

class Api {

    private $app;


    public function __construct($app) {

        $this->app = $app;
    }


    public function apply() {

        $action = Util::get_request_param("action");
        $supported = array("login", "logout", "get", "getThumbHref", "download");
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

        if (Util::get_boolean_request_param("l10n", false)) {

            $iso_codes = Util::get_request_param("l10nCodes");
            $iso_codes = explode(":", $iso_codes);
            $response["l10n"] = $this->app->get_l10n($iso_codes);
        }

        if (Util::get_boolean_request_param("custom", false)) {

            $url = Util::get_request_param("customHref");
            $response["custom"] = $this->app->get_customizations($url);
        }

        if (Util::get_boolean_request_param("items", false)) {

            $url = Util::get_request_param("itemsHref");
            $what = Util::get_request_param("itemsWhat");
            $what = is_numeric($what) ? intval($what, 10) : 1;
            $response["items"] = $this->app->get_items($url, $what);
        }

        Util::json_exit($response);
    }


    private function on_getThumbHref() {

        Util::json_fail(Util::ERR_DISABLED, "thumbnails disabled", !$this->app->get_option("thumbnails.enabled", false));
        Util::json_fail(Util::ERR_UNSUPPORTED, "thumbnails not supported", !HAS_PHP_JPEG);

        $type = Util::get_request_param("type");
        $src_url = Util::get_request_param("href");
        $width = Util::get_request_param("width");
        $height = Util::get_request_param("height");

        $thumb = new Thumb($this->app);
        $thumb_url = $thumb->thumb($type, $src_url, $width, $height);
        Util::json_fail(Util::ERR_FAILED, "thumbnail creation failed", $thumb_url === null);

        Util::json_exit(array("absHref" => $thumb_url));
    }


    private function on_download() {

        Util::json_fail(Util::ERR_DISABLED, "downloads disabled", !$this->app->get_option("download.enabled", false));

        $as = Util::get_request_param("as");
        $type = Util::get_request_param("type");
        $base_href = Util::get_request_param("baseHref");
        $hrefs = Util::get_request_param("hrefs");

        $archive = new Archive($this->app);

        $hrefs = explode("|:|", trim($hrefs));

        set_time_limit(0);
        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=\"$as\"");
        header("Connection: close");
        $rc = $archive->output($type, $base_href, $hrefs);

        Util::json_fail(Util::ERR_FAILED, "packaging failed", $rc !== 0);
        exit;
    }
}
