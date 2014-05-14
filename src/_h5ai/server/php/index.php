<?php

function normalized_require_once($lib) {

	$path = dirname(__FILE__) . "/inc/" . $lib;
	$path = preg_replace("#\\+|/+#", "/", $path);
	require_once($path);
}

normalized_require_once("main.php");

?>