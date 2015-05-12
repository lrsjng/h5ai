<?php

class Bootstrap {

    public static function main() {

        (new Bootstrap())->run();
    }

    private static $autopaths = ['core', 'ext'];

    public function run() {

        spl_autoload_register([$this, 'autoload']);
        putenv('LANG=en_US.UTF-8');
        setlocale(LC_CTYPE, 'en_US.UTF-8');
        date_default_timezone_set(@date_default_timezone_get());
        session_start();

        $this->once('../config');

        $session = new Session($_SESSION);
        $request = new Request($_REQUEST);
        $setup = new Setup($request->query_boolean('refresh', false));
        $app = new App($session, $request, $setup);

        if (strtolower($setup->get('REQUEST_METHOD')) === 'post') {
            (new Api($app))->apply();
        } else {
            define('APP_HREF', $setup->get('APP_HREF'));
            define('FALLBACK', (new Fallback($app))->get_html());
            $this->once('page');
        }
    }

    public function autoload($class_name) {

        $filename = 'class-' . strtolower($class_name) . '.php';

        foreach (Bootstrap::$autopaths as $path) {
            $file = __DIR__  . '/' . $path . '/' . $filename;
            if (file_exists($file)) {
                require_once $file;
                return true;
            }
        }
    }

    private function once($lib) {

        require_once __DIR__ . '/' . $lib . '.php';
    }
}
