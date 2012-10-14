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

			if (array_key_exists("entries", $_REQUEST)) {

				list($abs_href, $what) = use_optional_request_params("entriesHref", "entriesWhat", "entries");
				$what = is_numeric($what) ? intval($what, 10) : 1;
				$response["entries"] = $this->app->get_entries($abs_href, $what);
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


		else if ($action === "createArchive") {

			json_fail(1, "downloads disabled", !$options["download"]["enabled"]);

			list($execution, $format, $hrefs) = use_request_params(array("execution", "format", "hrefs"));

			normalized_require_once("/server/php/inc/Archive.php");
			$archive = new Archive($this->app);

			$hrefs = explode(":", trim($hrefs));
			$target = $archive->create($execution, $format, $hrefs);

			if (!is_string($target)) {
				json_fail($target, "package creation failed");
			}

			json_exit(array("id" => basename($target), "size" => filesize($target)));
		}


		else if ($action === "getArchive") {

			json_fail(1, "downloads disabled", !$options["download"]["enabled"]);

			list($id, $as) = use_request_params(array("id", "as"));
			json_fail(2, "file not found", !preg_match("/^package-/", $id));

			$target = $this->app->get_cache_abs_path() . "/" . $id;
			json_fail(3, "file not found", !file_exists($target));

			header("Content-Type: application/octet-stream");
			header("Content-Length: " . filesize($target));
			header("Content-Disposition: attachment; filename=\"$as\"");
			header("Connection: close");
			register_shutdown_function("delete_tempfile", $target);
			readfile($target);
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

			$hrefs = explode(":", trim($hrefs));
			$errors = array();

			foreach ($hrefs as $href) {

				$d = normalize_path(dirname($href), true);
				$n = basename($href);

				$code = $this->app->get_http_code($d);

				if ($code == App::$MAGIC_SEQUENCE && !$this->app->is_ignored($n)) {

					$abs_path = $this->app->get_abs_path($href);

					if (!unlink($abs_path)) {
						$errors[] = $href;
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
	}
}

?>