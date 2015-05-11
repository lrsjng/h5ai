<?php

class Api {

    private $request;
    private $setup;
    private $app;

    public function __construct($app) {

        $this->request = $app->get_request();
        $this->setup = $app->get_setup();
        $this->app = $app;
    }

    public function apply() {

        $action = $this->request->query('action');
        $supported = ['download', 'get', 'login', 'logout'];
        Util::json_fail(Util::ERR_UNSUPPORTED, 'unsupported action', !in_array($action, $supported));

        $methodname = 'on_' . $action;
        $this->$methodname();
    }

    private function on_download() {

        Util::json_fail(Util::ERR_DISABLED, 'download disabled', !$this->app->query_option('download.enabled', false));

        $as = $this->request->query('as');
        $type = $this->request->query('type');
        $base_href = $this->request->query('baseHref');
        $hrefs = $this->request->query('hrefs');

        $archive = new Archive($this->app);

        set_time_limit(0);
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $as . '"');
        header('Connection: close');
        $ok = $archive->output($type, $base_href, $hrefs);

        Util::json_fail(Util::ERR_FAILED, 'packaging failed', !$ok);
        exit;
    }

    private function on_get() {

        $response = [];

        foreach (['langs', 'options', 'types'] as $name) {
            if ($this->request->query_boolean($name, false)) {

                $methodname = 'get_' . $name;
                $response[$name] = $this->app->$methodname();
            }
        }

        if ($this->request->query_boolean('setup', false)) {

            $response['setup'] = $this->setup->to_jsono();
        }

        if ($this->request->query_boolean('theme', false)) {

            $theme = new Theme($this->app);
            $response['theme'] = $theme->get_icons();
        }

        if ($this->request->query('items', false)) {

            $href = $this->request->query('items.href');
            $what = $this->request->query_numeric('items.what');

            $response['items'] = $this->app->get_items($href, $what);
        }

        if ($this->request->query('custom', false)) {

            Util::json_fail(Util::ERR_DISABLED, 'custom disabled', !$this->app->query_option('custom.enabled', false));
            $href = $this->request->query('custom');

            $custom = new Custom($this->app);
            $response['custom'] = $custom->get_customizations($href);
        }

        if ($this->request->query('l10n', false)) {

            Util::json_fail(Util::ERR_DISABLED, 'l10n disabled', !$this->app->query_option('l10n.enabled', false));
            $iso_codes = $this->request->query_array('l10n');

            $iso_codes = array_filter($iso_codes);
            $response['l10n'] = $this->app->get_l10n($iso_codes);
        }

        if ($this->request->query('search', false)) {

            Util::json_fail(Util::ERR_DISABLED, 'search disabled', !$this->app->query_option('search.enabled', false));
            $href = $this->request->query('search.href');
            $pattern = $this->request->query('search.pattern');

            $search = new Search($this->app);
            $response['search'] = $search->get_items($href, $pattern);
        }

        if ($this->request->query('thumbs', false)) {

            Util::json_fail(Util::ERR_DISABLED, 'thumbnails disabled', !$this->app->query_option('thumbnails.enabled', false));
            Util::json_fail(Util::ERR_UNSUPPORTED, 'thumbnails not supported', !$this->setup->get('HAS_PHP_JPEG'));
            $thumbs = $this->request->query_array('thumbs');

            $response['thumbs'] = $this->app->get_thumbs($thumbs);
        }

        Util::json_exit($response);
    }

    private function on_login() {

        $pass = $this->request->query('pass');
        Util::json_exit(['asAdmin' => $this->app->login_admin($pass)]);
    }

    private function on_logout() {

        Util::json_exit(['asAdmin' => $this->app->logout_admin()]);
    }
}
