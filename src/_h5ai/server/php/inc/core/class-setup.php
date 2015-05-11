<?php

class Setup {

    const DEFAULT_PASSHASH = 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';
    const AS_ADMIN_SESSION_KEY = '__H5AI_AS_ADMIN__';

    private $consts;

    public function __construct($update_cached_setup = false, $env = []) {

        $this->consts = [];
        $this->update_cached_setup = $update_cached_setup;
        $this->env = $env;

        $this->setup_php();
        $this->setup_app();
        $this->setup_admin();
        $this->setup_server();
        $this->setup_paths();
        $this->setup_cache();
        $this->setup_cmds();
    }

    private function set($key, $value) {

        if (array_key_exists($key, $this->consts)) {
            Logger::log('setup key already taken', [
                'key' => $key,
                'value' => $value,
                'found' => $this->consts[$key]
            ]);
            exit;
        }
        if (!is_string($value) && !is_bool($value)) {
            Logger::log('setup value neither string nor boolean', [
                'key' => $key,
                'value' => $value
            ]);
            exit;
        }

        $this->consts[$key] = $value;
    }

    public function get($key) {

        if (!array_key_exists($key, $this->consts)) {
            Logger::log('setup key not found', ['key' => $key]);
            exit;
        }

        return $this->consts[$key];
    }

    private function setup_php() {

        $this->set('PHP_VERSION', PHP_VERSION);
        $this->set('MIN_PHP_VERSION', MIN_PHP_VERSION);
        $this->set('HAS_PHP_EXIF', function_exists('exif_thumbnail'));

        $has_php_jpeg = false;
        if (function_exists('gd_info')) {
            $infos = gd_info();
            $has_php_jpeg = array_key_exists('JPEG Support', $infos) && $infos['JPEG Support'];
        }
        $this->set('HAS_PHP_JPEG', $has_php_jpeg);
    }

    private function setup_app() {

        $this->set('NAME', '{{pkg.name}}');
        $this->set('VERSION', '{{pkg.version}}');
        $this->set('FILE_PREFIX', '_{{pkg.name}}');
    }

    private function setup_admin() {

        $this->set('AS_ADMIN_SESSION_KEY', Setup::AS_ADMIN_SESSION_KEY);
        $this->set('AS_ADMIN', isset($_SESSION[Setup::AS_ADMIN_SESSION_KEY]) && $_SESSION[Setup::AS_ADMIN_SESSION_KEY] === true);
        $this->set('PASSHASH', PASSHASH);
        $this->set('HAS_CUSTOM_PASSHASH', strtolower(PASSHASH) === strtolower(Setup::DEFAULT_PASSHASH));
    }

    private function setup_server() {

        $server_name = null;
        $server_version = null;
        $server_software = getenv('SERVER_SOFTWARE');
        if ($server_software && preg_match('#^(.*?)(?:/(.*?))?(?: |$)#', strtolower($server_software), $matches)) {
            $server_name = $matches[1];
            $server_version = count($matches) > 2 ? $matches[2] : '';
        }
        $this->set('SERVER_NAME', $server_name);
        $this->set('SERVER_VERSION', $server_version);
        $this->set('HAS_SERVER', in_array($server_name, ['apache', 'lighttpd', 'nginx', 'cherokee']));
    }

    private function setup_paths() {

        $script_name = getenv('SCRIPT_NAME');
        if ($this->get('SERVER_NAME') === 'lighttpd') {
            $script_name = preg_replace('#^.*?//#', '/', $script_name);
        }
        $this->set('APP_HREF', Util::normalize_path(dirname(dirname(dirname($script_name))), true));
        $this->set('APP_PATH', Util::normalize_path(dirname(dirname(dirname(dirname(dirname(__FILE__))))), false));

        $this->set('ROOT_HREF', Util::normalize_path(dirname($this->get('APP_HREF')), true));
        $this->set('ROOT_PATH', Util::normalize_path(dirname($this->get('APP_PATH')), false));

        $index_href = null;
        if (@is_readable(Util::normalize_path($this->get('APP_PATH') . '/server/php/index.php', false))) {
            $index_href = Util::normalize_path($this->get('APP_HREF') . '/server/php/index.php', false);
        }
        $this->set('INDEX_HREF', $index_href);
    }

    private function setup_cache() {

        $this->set('CACHE_HREF', Util::normalize_path($this->get('APP_HREF') . '/cache', true));
        $this->set('CACHE_PATH', Util::normalize_path($this->get('APP_PATH') . '/cache', false));
        $this->set('HAS_WRITABLE_CACHE', @is_writable($this->get('CACHE_PATH')));
    }

    private function setup_cmds() {

        $this->set('CMDS_PATH', Util::normalize_path($this->get('CACHE_PATH') . '/cmds.json', false));

        $cmds = Util::load_commented_json($this->get('CMDS_PATH'));
        if (sizeof($cmds) === 0 || $this->update_cached_setup) {
            $cmds['command'] = Util::exec_0('command -v command');
            $cmds['which'] = Util::exec_0('which which');

            $cmd = false;
            if ($cmds['command']) {
                $cmd = 'command -v';
            } else if ($cmds['which']) {
                $cmd = 'which';
            }

            foreach (['avconv', 'convert', 'du', 'ffmpeg', 'tar', 'zip'] as $c) {
                $cmds[$c] = ($cmd !== false) && Util::exec_0($cmd . ' ' . $c);
            }

            Util::save_json($this->get('CMDS_PATH'), $cmds);
        }
        foreach ($cmds as $c => $has) {
            $this->set('HAS_CMD_' . strtoupper($c), $has);
        }
    }

    public function to_jsono() {

        $keys = [
            'APP_HREF',
            'ROOT_HREF',
            'VERSION',

            'AS_ADMIN',
            'HAS_CUSTOM_PASSHASH'
        ];

        if ($this->get('AS_ADMIN')) {
            $keys = array_merge($keys, [
                'PHP_VERSION',
                'MIN_PHP_VERSION',
                'HAS_PHP_EXIF',
                'HAS_PHP_JPEG',

                'SERVER_NAME',
                'SERVER_VERSION',
                'HAS_SERVER',

                'INDEX_HREF',

                'HAS_WRITABLE_CACHE',

                'HAS_CMD_AVCONV',
                'HAS_CMD_CONVERT',
                'HAS_CMD_DU',
                'HAS_CMD_FFMPEG',
                'HAS_CMD_TAR',
                'HAS_CMD_ZIP'
            ]);
        }

        $jsono = [];
        foreach ($keys as $key) {
            $jsono[$key] = $this->get($key);
        }
        return $jsono;
    }
}
