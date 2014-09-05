<?php



/*********************************************************************
  SHA1 hash of the info page password, the preset password is the
  empty string. You might change it to keep this information private.
  Online hash generator: http://www.sha1.cz/
*********************************************************************/
define("PASSHASH", "da39a3ee5e6b4b0d3255bfef95601890afd80709");



function normalized_require_once($lib) {

    require_once(preg_replace("#[\\\\/]+#", "/", dirname(__FILE__) . "/inc/${lib}.php"));
}

function __autoload($class_name) {

    normalized_require_once("class-" . strtolower($class_name));
}

Setup::init();
$app = new App();

if (Util::has_request_param("action")) {
    $api = new Api($app);
    $api->apply();
} else {
    define("FALLBACK", $app->get_fallback());
    normalized_require_once("page");
}
