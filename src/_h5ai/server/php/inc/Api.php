<?php

class Api {


	public function __construct($app) {

		$this->app = $app;
	}


	public function apply() {

		$options = $this->app->get_options();

		list($action) = use_request_params(array("action"));

		if ($action === "get") {

			$response = array();

			if (array_key_exists("options", $_REQUEST)) {

				use_request_params("options");
				$response["options"] = $this->app->get_options();
			}

			if (array_key_exists("types", $_REQUEST)) {

				use_request_params("types");
				$response["types"] = $this->app->get_types();
			}

			if (array_key_exists("langs", $_REQUEST)) {

				use_request_params("langs");
				$response["langs"] = $this->app->get_l10n_list();
			}

			if (array_key_exists("l10n", $_REQUEST)) {

				list($iso_codes) = use_request_params("l10nCodes", "l10n");
				$iso_codes = explode(":", $iso_codes);
				$response["l10n"] = $this->app->get_l10n($iso_codes);
			}

			if (array_key_exists("checks", $_REQUEST)) {

				use_request_params("checks");
				$response["checks"] = $this->app->get_server_checks();
			}

			if (array_key_exists("server", $_REQUEST)) {

				use_request_params("server");
				$response["server"] = $this->app->get_server_details();
			}

			if (array_key_exists("custom", $_REQUEST)) {

				list($abs_href) = use_optional_request_params("customHref", "custom");
				$response["custom"] = $this->app->get_customizations($abs_href);
			}

			if (array_key_exists("items", $_REQUEST)) {

				list($abs_href, $what) = use_optional_request_params("itemsHref", "itemsWhat", "items");
				$what = is_numeric($what) ? intval($what, 10) : 1;
				$response["items"] = $this->app->get_items($abs_href, $what);
			}

			if (count($_REQUEST)) {
				$response["unused"] = $_REQUEST;
			}

			json_exit($response);
		}


		else if ($action === "getThumbHref") {

			if (!$options["thumbnails"]["enabled"]) {
				json_fail(1, "thumbnails disabled");
			}

			normalized_require_once("/server/php/inc/Thumb.php");
			if (!Thumb::is_supported()) {
				json_fail(2, "thumbnails not supported");
			}

			list($type, $src_abs_href, $mode, $width, $height) = use_request_params(array("type", "href", "mode", "width", "height"));

			$thumb = new Thumb($this->app);
			$thumb_href = $thumb->thumb($type, $src_abs_href, $mode, $width, $height);
			if ($thumb_href === null) {
				json_fail(3, "thumbnail creation failed");
			}

			json_exit(array("absHref" => $thumb_href));
		}


		else if ($action === "download") {

			json_fail(1, "downloads disabled", !$options["download"]["enabled"]);

			list($as, $type, $hrefs) = use_request_params(array("as", "type", "hrefs"));

			normalized_require_once("/server/php/inc/Archive.php");
			$archive = new Archive($this->app);

			$hrefs = explode("|:|", trim($hrefs));

			set_time_limit(0);
			header("Content-Type: application/octet-stream");
			header("Content-Disposition: attachment; filename=\"$as\"");
			header("Connection: close");
			$rc = $archive->output($type, $hrefs);

			if ($rc !== 0) {
				json_fail("packaging failed");
			}
			exit;
		}


		else if ($action === "upload") {

			list($href) = use_request_params(array("href"));

			json_fail(1, "wrong HTTP method", strtolower($_SERVER["REQUEST_METHOD"]) !== "post");
			json_fail(2, "something went wrong", !array_key_exists("userfile", $_FILES));

			$userfile = $_FILES["userfile"];

			json_fail(3, "something went wrong [" . $userfile["error"] . "]", $userfile["error"] !== 0);
			json_fail(4, "folders not supported", file_get_contents($userfile["tmp_name"]) === "null");

			$upload_dir = $this->app->get_abs_path($href);
			$code = $this->app->get_http_code($href);

			json_fail(5, "upload dir no h5ai folder or ignored", $code !== App::$MAGIC_SEQUENCE || $this->app->is_ignored($upload_dir));

			$dest = $upload_dir . "/" . utf8_encode($userfile["name"]);

			json_fail(6, "already exists", file_exists($dest));
			json_fail(7, "can't move uploaded file", !move_uploaded_file($userfile["tmp_name"], $dest));

			json_exit();
		}


		else if ($action === "delete") {

			json_fail(1, "deletion disabled", !$options["delete"]["enabled"]);

			list($hrefs) = use_request_params(array("hrefs"));

			$hrefs = explode("|:|", trim($hrefs));
			$errors = array();

			foreach ($hrefs as $href) {

				$d = normalize_path(dirname($href), true);
				$n = basename($href);

				$code = $this->app->get_http_code($d);

				if ($code == App::$MAGIC_SEQUENCE && !$this->app->is_ignored($n)) {

					$abs_path = $this->app->get_abs_path($href);

					if (!unlink($abs_path)) {
					   //check if it's a directory
					   if(is_dir($abs_path)) {
					    //check for files & folders within dir, deletes them, recursively (from SOF, barbushin | tested in PHP 5.4)
						foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($abs_path, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST) as $path) {
						$path->isFile() ? unlink($path->getPathname()) : rmdir($path->getPathname());
						}
					   rmdir($abs_path);
					   
					   } else {
					   //return error if neither dir or file could be deleted
					   $errors[] = $href;
					   }
						
					}
				}
			}

			if (count($errors)) {
				json_fail(2, "deletion failed for some");
			} else {
				json_exit();
			}
		}


		else if ($action === "rename") {

			json_fail(1, "renaming disabled", !$options["rename"]["enabled"]);

			list($href, $name) = use_request_params(array("href", "name"));

			$d = normalize_path(dirname($href), true);
			$n = basename($href);

			$code = $this->app->get_http_code($d);

			if ($code == App::$MAGIC_SEQUENCE && !$this->app->is_ignored($n)) {

				$abs_path = $this->app->get_abs_path($href);
				$folder = normalize_path(dirname($abs_path));

				if (!rename($abs_path, $folder . "/" . $name)) {
					json_fail(2, "renaming failed");
				}
			}

			json_exit();
		}

		json_fail(100, "unsupported request");
	}
}

?>
