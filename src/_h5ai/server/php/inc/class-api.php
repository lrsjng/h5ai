<?php

class Api {


	private $app;


	public function __construct($app) {

		$this->app = $app;
	}


	public function apply() {

		$options = $this->app->get_options();

		$action = use_request_param("action");

		if ($action === "get") {

			$response = array();

			if (has_request_param("setup")) {

				use_request_param("setup");
				$response["setup"] = $this->app->get_setup();
			}

			if (has_request_param("options")) {

				use_request_param("options");
				$response["options"] = $this->app->get_options();
			}

			if (has_request_param("types")) {

				use_request_param("types");
				$response["types"] = $this->app->get_types();
			}

			if (has_request_param("langs")) {

				use_request_param("langs");
				$response["langs"] = $this->app->get_l10n_list();
			}

			if (has_request_param("l10n")) {

				use_request_param("l10n");
				$iso_codes = use_request_param("l10nCodes");
				$iso_codes = explode(":", $iso_codes);
				$response["l10n"] = $this->app->get_l10n($iso_codes);
			}

			if (has_request_param("custom")) {

				use_request_param("custom");
				$url = use_request_param("customHref");
				$response["custom"] = $this->app->get_customizations($url);
			}

			if (has_request_param("items")) {

				use_request_param("items");
				$url = use_request_param("itemsHref");
				$what = use_request_param("itemsWhat");
				$what = is_numeric($what) ? intval($what, 10) : 1;
				$response["items"] = $this->app->get_items($url, $what);
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

			normalized_require_once("class-thumb");
			if (!Thumb::is_supported()) {
				json_fail(2, "thumbnails not supported");
			}

			$type = use_request_param("type");
			$src_url = use_request_param("href");
			$mode = use_request_param("mode");
			$width = use_request_param("width");
			$height = use_request_param("height");

			$thumb = new Thumb($this->app);
			$thumb_url = $thumb->thumb($type, $src_url, $mode, $width, $height);
			if ($thumb_url === null) {
				json_fail(3, "thumbnail creation failed");
			}

			json_exit(array("absHref" => $thumb_url));
		}


		else if ($action === "download") {

			json_fail(1, "downloads disabled", !$options["download"]["enabled"]);

			$as = use_request_param("as");
			$type = use_request_param("type");
			$hrefs = use_request_param("hrefs");

			normalized_require_once("class-archive");
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

			$href = use_request_param("href");

			json_fail(1, "wrong HTTP method", strtolower($_SERVER["REQUEST_METHOD"]) !== "post");
			json_fail(2, "something went wrong", !array_key_exists("userfile", $_FILES));

			$userfile = $_FILES["userfile"];

			json_fail(3, "something went wrong [" . $userfile["error"] . "]", $userfile["error"] !== 0);
			json_fail(4, "folders not supported", file_get_contents($userfile["tmp_name"]) === "null");

			$upload_dir = $this->app->to_path($href);
			$code = $this->app->get_http_code($href);

			json_fail(5, "upload dir no h5ai folder or ignored", $code !== MAGIC_SEQUENCE || $this->app->is_ignored($upload_dir));

			$dest = $upload_dir . "/" . utf8_encode($userfile["name"]);

			json_fail(6, "already exists", file_exists($dest));
			json_fail(7, "can't move uploaded file", !move_uploaded_file($userfile["tmp_name"], $dest));

			json_exit();
		}


		else if ($action === "delete") {

			json_fail(1, "deletion disabled", !$options["delete"]["enabled"]);

			$hrefs = use_request_param("hrefs");

			$hrefs = explode("|:|", trim($hrefs));
			$errors = array();

			foreach ($hrefs as $href) {

				$d = normalize_path(dirname($href), true);
				$n = basename($href);

				$code = $this->app->get_http_code($d);

				if ($code == MAGIC_SEQUENCE && !$this->app->is_ignored($n)) {

					$abs_path = $this->app->to_path($href);

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

			$href = use_request_param("href");
			$name = use_request_param("name");

			$d = normalize_path(dirname($href), true);
			$n = basename($href);

			$code = $this->app->get_http_code($d);

			if ($code == MAGIC_SEQUENCE && !$this->app->is_ignored($n)) {

				$abs_path = $this->app->to_path($href);
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