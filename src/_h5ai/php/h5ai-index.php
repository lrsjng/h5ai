<?php header("Content-type: text/html;h5ai=%BUILD_VERSION%"); ?>
<!DOCTYPE html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>Directory index · styled with h5ai</title>
	<meta name="description" content="Directory index styled with h5ai (http://larsjung.de/h5ai)">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="shortcut icon" type="image/png" href="/_h5ai/images/h5ai-16x16.png">
	<link rel="apple-touch-icon" type="image/png" href="/_h5ai/images/h5ai-48x48.png">
	<link rel="stylesheet" href="//fonts.googleapis.com/css?family=Ubuntu:regular,italic,bold">
	<link rel="stylesheet" href="/_h5ai/css/styles.css">
	<script src="/_h5ai/js/modernizr-2.5.3.min.js"></script>
</head>
<body id="h5ai-main">
	<div id="topbar" class="clearfix">
		<ul id="navbar"></ul>
	</div>
	<div id="content">
		<div id="extended" class="clearfix"></div>
	</div>
	<div id="bottombar" class="clearfix">
		<span class="left">
			<a id="h5ai-reference" href="http://larsjung.de/h5ai" title="h5ai project page">h5ai %BUILD_VERSION%</a>
			<span class="hideOnJs noJsMsg"> ⚡ JavaScript is disabled! ⚡ </span>
			<span class="oldBrowser"> ⚡ Some features disabled! Works best in <a href="http://browsehappy.com">modern browsers</a>. ⚡ </span>
		</span>
		<span class="right"></span>
		<span class="center"></span>
	</div>
	<script src="/_h5ai/config.js"></script>
	<script src="/_h5ai/js/scripts.js"></script>
	<div id="data-generic-json" class="hidden">
		<?php if (stripos($_SERVER["REQUEST_METHOD"], "HEAD") === false) {

			$h5ai_php = str_replace("\\", "/", dirname(__FILE__)) . "/inc/H5ai.php";

			if (!file_exists($h5ai_php)) {

				function find_h5ai($path, $h5ai) {

					if (file_exists($path . $h5ai)) {
						return $path . $h5ai;
					}

					$parent = str_replace("\\", "/", dirname($path));
					if ($parent !== $path) {
						return find_h5ai($parent, $h5ai);
					}

					error_log("h5ai not found: " . __FILE__);
				}

				$h5ai_php = find_h5ai(str_replace("\\", "/", dirname(__FILE__)), "/_h5ai/php/inc/H5ai.php");
			}

			require_once($h5ai_php);

			$h5ai = new H5ai(__FILE__);
			echo $h5ai->getGenericJson();
		} ?>
	</div>
</body>
</html>