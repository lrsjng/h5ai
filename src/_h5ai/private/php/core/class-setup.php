<?php

class Setup {
    private $store;
    private $refresh;

    public function __construct($refresh = false) {
        $this->store = [];
        $this->refresh = $refresh;

        $this->add_globals_and_envs();
        $this->add_php_checks();
        $this->add_app_metadata();
        $this->add_server_metadata_and_check();
        $this->add_paths();
        $this->add_sys_cmd_checks();
    }

    private function set($key, $value) {
        if (array_key_exists($key, $this->store)) {
            Logger::log('setup key already taken', [
                'key' => $key,
                'value' => $value,
                'found' => $this->store[$key]
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

        $this->store[$key] = $value;
    }

    public function get($key) {
        if (!array_key_exists($key, $this->store)) {
            Logger::log('setup key not found', ['key' => $key]);
            exit;
        }

        return $this->store[$key];
    }

    private function add_globals_and_envs() {
        $this->set('PHP_VERSION', PHP_VERSION);
        $this->set('MIN_PHP_VERSION', MIN_PHP_VERSION);
        $this->set('PHP_ARCH', (PHP_INT_SIZE * 8) . '-bit');

        $this->set('REQUEST_METHOD', $_SERVER['REQUEST_METHOD']);
        $this->set('REQUEST_HREF', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
        $this->set('SCRIPT_NAME', $_SERVER['SCRIPT_NAME']);
        $this->set('SERVER_SOFTWARE', $_SERVER['SERVER_SOFTWARE']);
        $this->set('HTTP_USER_AGENT', $_SERVER['HTTP_USER_AGENT']);
    }

    private function add_php_checks() {
        $this->set('HAS_PHP_EXIF', function_exists('exif_thumbnail'));

        $has_php_jpeg = false;
        if (function_exists('gd_info')) {
            $infos = gd_info();
            $has_php_jpeg = array_key_exists('JPEG Support', $infos) && $infos['JPEG Support'];
        }
        $this->set('HAS_PHP_JPEG', $has_php_jpeg);
    }

    private function add_app_metadata() {
        $this->set('NAME', 'h5ai');
        $this->set('VERSION', H5AI_VERSION);
        $this->set('FILE_PREFIX', '_h5ai');
    }

    private function add_server_metadata_and_check() {
        $server_software = $this->get('SERVER_SOFTWARE');
        $server_name = null;
        $server_version = null;

        if ($server_software && preg_match('#^(.*?)(?:/(.*?))?(?: |$)#', strtolower($server_software), $matches)) {
            $server_name = $matches[1];
            $server_version = count($matches) > 2 ? $matches[2] : '';
        }

        $this->set('SERVER_NAME', $server_name);
        $this->set('SERVER_VERSION', $server_version);
        $this->set('HAS_SERVER', in_array($server_name, ['apache', 'lighttpd', 'nginx', 'cherokee']));
    }

    private function add_paths() {
        $script_name = $this->get('SCRIPT_NAME');
        if ($this->get('SERVER_NAME') === 'lighttpd') {
            $script_name = preg_replace('#^.*?//#', '/', $script_name);
        }

        $this->set('H5AI_HREF', Util::normalize_path(dirname(dirname($script_name)), true));
        $this->set('H5AI_PATH', Util::normalize_path(dirname(dirname(dirname(dirname(__FILE__)))), false));

        $this->set('ROOT_HREF', Util::normalize_path(dirname($this->get('H5AI_HREF')), true));
        $this->set('ROOT_PATH', Util::normalize_path(dirname($this->get('H5AI_PATH')), false));

        $this->set('PUBLIC_HREF', Util::normalize_path($this->get('H5AI_HREF') . '/public/', true));
        $this->set('PUBLIC_PATH', Util::normalize_path($this->get('H5AI_PATH') . '/public/', false));

        $this->set('INDEX_HREF', Util::normalize_path($this->get('PUBLIC_HREF') . '/index.php', false));
        $this->set('CACHE_PUB_HREF', Util::normalize_path($this->get('PUBLIC_HREF') . '/cache', true));
        $this->set('CACHE_PUB_PATH', Util::normalize_path($this->get('PUBLIC_PATH') . '/cache', false));
        $this->set('HAS_WRITABLE_CACHE_PUB', @is_writable($this->get('CACHE_PUB_PATH')));

        $this->set('PRIVATE_PATH', Util::normalize_path($this->get('H5AI_PATH') . '/private', false));
        $this->set('CONF_PATH', Util::normalize_path($this->get('PRIVATE_PATH') . '/conf', false));
        $this->set('CACHE_PRV_PATH', Util::normalize_path($this->get('PRIVATE_PATH') . '/cache', false));
        $this->set('HAS_WRITABLE_CACHE_PRV', @is_writable($this->get('CACHE_PRV_PATH')));
    }

    private function add_sys_cmd_checks() {
        $cmds_cache_path = Util::normalize_path($this->get('CACHE_PRV_PATH') . '/cmds.json', false);

        $cmds = Json::load($cmds_cache_path);
        if (sizeof($cmds) === 0 || $this->refresh) {
            $cmds['command'] = Util::exec_0('command -v command');
            $cmds['which'] = Util::exec_0('which which') || Util::exec_0('which which.exe');

            $cmd = false;
            if ($cmds['command']) {
                $cmd = 'command -v';
            } elseif ($cmds['which']) {
                $cmd = 'which';
            }

            foreach (['avconv', 'convert', 'du', 'ffmpeg', 'gm', 'tar', 'zip'] as $c) {
                $cmds[$c] = ($cmd !== false) && (Util::exec_0($cmd . ' ' . $c) || Util::exec_0($cmd . ' ' . $c . '.exe'));
            }

            Json::save($cmds_cache_path, $cmds);
        }
        foreach ($cmds as $c => $has) {
            $this->set('HAS_CMD_' . strtoupper($c), $has);
        }
    }

    public function to_jsono($as_admin = false) {
        $keys = [
            'PUBLIC_HREF',
            'ROOT_HREF'
        ];

        if ($as_admin) {
            $keys = array_merge($keys, [
                'VERSION',

                'PHP_VERSION',
                'MIN_PHP_VERSION',
                'PHP_ARCH',
                'HAS_PHP_EXIF',
                'HAS_PHP_JPEG',

                'SERVER_NAME',
                'SERVER_VERSION',
                'HAS_SERVER',

                'INDEX_HREF',

                'HAS_WRITABLE_CACHE_PUB',
                'HAS_WRITABLE_CACHE_PRV',

                'HAS_CMD_AVCONV',
                'HAS_CMD_CONVERT',
                'HAS_CMD_DU',
                'HAS_CMD_FFMPEG',
                'HAS_CMD_GM',
                'HAS_CMD_TAR',
                'HAS_CMD_ZIP'
            ]);
        }

        $jsono = ['AS_ADMIN' => $as_admin];
        foreach ($keys as $key) {
            $jsono[$key] = $this->get($key);
        }
        return $jsono;
    }
}
