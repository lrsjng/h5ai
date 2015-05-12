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

        require __DIR__ . '/../../conf/passhash.php';

        $session = new Session($_SESSION);
        $request = new Request($_REQUEST);
        $setup = new Setup($request->query_boolean('refresh', false));
        $context = new Context($session, $request, $setup);

        if ($context->is_api_request()) {
            (new Api($context))->apply();
        } else if ($context->is_info_request()) {
            define('PUBLIC_HREF', $setup->get('PUBLIC_HREF'));
            require __DIR__ . '/info.php';
        } else {
            define('PUBLIC_HREF', $setup->get('PUBLIC_HREF'));
            define('FALLBACK', (new Fallback($context))->get_html());
            require __DIR__ . '/page.php';
        }
    }

    public function autoload($class_name) {

        $filename = 'class-' . strtolower($class_name) . '.php';

        foreach (Bootstrap::$autopaths as $path) {
            $file = __DIR__  . '/' . $path . '/' . $filename;
            if (file_exists($file)) {
                require $file;
                return true;
            }
        }
    }
}
