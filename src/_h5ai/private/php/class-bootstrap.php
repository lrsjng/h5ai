<?php

class Bootstrap {
    private static $autopaths = ['core', 'ext'];

    public static function run() {
        spl_autoload_register(['Bootstrap', 'autoload']);
        putenv('LANG=en_US.UTF-8');
        setlocale(LC_CTYPE, 'en_US.UTF-8');
        date_default_timezone_set(@date_default_timezone_get());
        session_start();

        $session = new Session($_SESSION);
        $request = new Request($_REQUEST, file_get_contents('php://input'));
        $setup = new Setup($request->query_boolean('refresh', false));
        $context = new Context($session, $request, $setup);

        if ($context->is_api_request()) {
            (new Api($context))->apply();
        } elseif ($context->is_info_request()) {
            $public_href = $setup->get('PUBLIC_HREF');
            $x_head_tags = $context->get_x_head_html();
            $fallback_mode = false;
            require __DIR__ . '/pages/info.php';
        } else {
            $public_href = $setup->get('PUBLIC_HREF');
            $x_head_tags = $context->get_x_head_html();
            $fallback_mode = $context->is_fallback_mode();
            $fallback_html = (new Fallback($context))->get_html();
            require __DIR__ . '/pages/index.php';
        }
    }

    public static function autoload($class_name) {
        $filename = 'class-' . strtolower($class_name) . '.php';

        foreach (Bootstrap::$autopaths as $path) {
            $file = __DIR__  . '/' . $path . '/' . $filename;
            if (file_exists($file)) {
                require_once $file;
                return true;
            }
        }
    }
}
