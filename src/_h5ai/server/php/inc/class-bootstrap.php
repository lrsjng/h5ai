<?php

class Bootstrap {

    private $basepath;
    private $classpaths;

    public function __construct($basepath) {

        $this->basepath = $basepath;
        $this->classpaths = ['/inc', '/inc/core', '/inc/ext'];
    }

    public function run() {

        spl_autoload_register([$this, 'autoload']);
        putenv('LANG=en_US.UTF-8');
        setlocale(LC_CTYPE, 'en_US.UTF-8');
        date_default_timezone_set(@date_default_timezone_get());
        session_start();

        $request_method = getenv('REQUEST_METHOD');
        $request_uri = getenv('REQUEST_URI');
        $script_name = getenv('SCRIPT_NAME');
        $server_software = getenv('SERVER_SOFTWARE');

        $this->once('config');

        $request = new Request($_REQUEST);
        $setup = new Setup($request->query_boolean('updateCachedSetup', false), $_ENV);
        $app = new App($request, $setup);

        if (strtolower(getenv('REQUEST_METHOD')) === 'post') {
            (new Api($app))->apply();
        } else {
            // (new Page($app))->apply();
                // define('PAGE_APP_HREF', $setup->get('APP_HREF'));
                // define('PAGE_FALLBACK', (new Fallback($app))->get_html());
            define('APP_HREF', $setup->get('APP_HREF'));
            define('FALLBACK', (new Fallback($app))->get_html());
            $this->once('inc/page');
        }
    }

    public function autoload($class_name) {

        $filename = 'class-' . strtolower($class_name) . '.php';

        foreach ($this->classpaths as $classpath) {
            $file = $this->basepath . $classpath . '/' . $filename;
            if (file_exists($file)) {
                require_once($file);
                return true;
            }
        }
    }

    private function once($lib) {

        require_once($this->basepath . '/' . $lib . '.php');
    }
}
