<?php

class Api {

    private $app;


    public function __construct($app) {

        $this->app = $app;
    }


    public function apply() {

        $action = Util::query_request_param("action");
        $supported = ["download", "get", "login", "logout"];
        Util::json_fail(Util::ERR_UNSUPPORTED, "unsupported action", !in_array($action, $supported));

        $methodname = "on_${action}";
        $this->$methodname();
    }


    private function on_download() {

        Util::json_fail(Util::ERR_DISABLED, "download disabled", !$this->app->query_option("download.enabled", false));

        $as = Util::query_request_param("as");
        $type = Util::query_request_param("type");
        $base_href = Util::query_request_param("baseHref");
        $hrefs = Util::query_request_param("hrefs");

        $archive = new Archive($this->app);

        set_time_limit(0);
        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=\"$as\"");
        header("Connection: close");
        $ok = $archive->output($type, $base_href, $hrefs);

        Util::json_fail(Util::ERR_FAILED, "packaging failed", !$ok);
        exit;
    }


    private function on_get() {

        $response = [];

        foreach (["langs", "options", "setup", "types"] as $name) {
            if (Util::query_boolean_request_param($name, false)) {

                $methodname = "get_${name}";
                $response[$name] = $this->app->$methodname();
            }
        }

        if (Util::query_boolean_request_param("theme", false)) {

            $theme = new Theme($this->app);
            $response["theme"] = $theme->get_icons();
        }

        if (Util::query_request_param("items", false)) {

            $href = Util::query_request_param("items.href");
            $what = Util::query_numeric_request_param("items.what");

            $response["items"] = $this->app->get_items($href, $what);
        }

        if (Util::query_request_param("custom", false)) {

            Util::json_fail(Util::ERR_DISABLED, "custom disabled", !$this->app->query_option("custom.enabled", false));
            $href = Util::query_request_param("custom");

            $custom = new Custom($this->app);
            $response["custom"] = $custom->get_customizations($href);
        }

        if (Util::query_request_param("l10n", false)) {

            Util::json_fail(Util::ERR_DISABLED, "l10n disabled", !$this->app->query_option("l10n.enabled", false));
            $iso_codes = Util::query_array_request_param("l10n");

            $iso_codes = array_filter($iso_codes);
            $response["l10n"] = $this->app->get_l10n($iso_codes);
        }

        if (Util::query_request_param("search", false)) {

            Util::json_fail(Util::ERR_DISABLED, "search disabled", !$this->app->query_option("search.enabled", false));
            $href = Util::query_request_param("search.href");
            $pattern = Util::query_request_param("search.pattern");

            $search = new Search($this->app);
            $response["search"] = $search->get_items($href, $pattern);
        }

        if (Util::query_request_param("thumbs", false)) {

            Util::json_fail(Util::ERR_DISABLED, "thumbnails disabled", !$this->app->query_option("thumbnails.enabled", false));
            Util::json_fail(Util::ERR_UNSUPPORTED, "thumbnails not supported", !HAS_PHP_JPEG);
            $thumbs = Util::query_array_request_param("thumbs");

            $response["thumbs"] = $this->app->get_thumbs($thumbs);
        }

        Util::json_exit($response);
    }


    private function on_login() {

        $pass = Util::query_request_param("pass");
        $_SESSION[AS_ADMIN_SESSION_KEY] = strcasecmp(hash("sha512", $pass), PASSHASH) === 0;
        Util::json_exit(["asAdmin" => $_SESSION[AS_ADMIN_SESSION_KEY]]);
    }


    private function on_logout() {

        $_SESSION[AS_ADMIN_SESSION_KEY] = false;
        Util::json_exit(["asAdmin" => $_SESSION[AS_ADMIN_SESSION_KEY]]);
    }
}
