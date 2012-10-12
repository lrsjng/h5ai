<?php

class Entry {

	private static $FOLDER_SIZE_CMD = "du -sb \"[DIR]\"";

	public static function cmp($entry1, $entry2) {

		if ($entry1->is_folder && !$entry2->is_folder) {
			return -1;
		}
		if (!$entry1->is_folder && $entry2->is_folder) {
			return 1;
		}

		return strcasecmp($entry1->abs_path, $entry2->abs_path);
	}

	public static function get($app, $abs_path, &$cache) {

		if (!starts_with($abs_path, $app->get_root_abs_path())) {
			error_log("ILLEGAL REQUEST: " . $abs_path . ", " . $app->get_root_abs_path());
			return null;
		}

		if (is_array($cache) && array_key_exists($abs_path, $cache)) {
			return $cache[$abs_path];
		}

		$entry = new Entry($app, $abs_path);

		if (is_array($cache)) {
			$cache[$abs_path] = $entry;
		}
		return $entry;
	}


	public $app,
			$abs_path, $abs_href,
			$date, $size,
			$is_folder,
			$is_content_fetched;


	private function __construct($app, $abs_path) {

		$this->app = $app;

		$this->abs_path = normalize_path($abs_path);
		$this->is_folder = is_dir($this->abs_path);
		$this->abs_href = $this->app->get_abs_href($abs_path, $this->is_folder);

		$this->date = @filemtime($this->abs_path);

		if ($this->is_folder) {
			$this->size = null;
			$options = $app->get_options();
			if ($options["foldersize"]["enabled"]) {
				$cmd = str_replace("[DIR]", $this->abs_path, Entry::$FOLDER_SIZE_CMD);
				$this->size = intval(preg_replace("/\s.*$/", "", `$cmd`), 10);
			}
		} else {
			$this->size = @filesize($this->abs_path);
		}

		$this->is_content_fetched = false;
	}


	public function to_json_object() {

		$obj = array(
			"absHref" => $this->abs_href,
			"time" => $this->date * 1000, // seconds (PHP) to milliseconds (JavaScript)
			"size" => $this->size
		);

		if ($this->is_folder) {
			$obj["status"] = $this->app->get_http_code($this->abs_href);
			$obj["content"] = $this->is_content_fetched;
		}

		return $obj;
	}


	public function get_parent(&$cache) {

		$parent_abs_path = normalize_path(dirname($this->abs_path));
		if (starts_with($parent_abs_path, $this->app->get_root_abs_path())) {
			return Entry::get($this->app, $parent_abs_path, $cache);
		}
		return null;
	}


	public function get_content(&$cache) {

		$content = array();

		if ($this->app->get_http_code($this->abs_href) !== App::$MAGIC_SEQUENCE) {
			return $content;
		}

		$files = $this->app->read_dir($this->abs_path);
		foreach ($files as $file) {
			$entry = Entry::get($this->app, $this->abs_path . "/" . $file, $cache);
			$content[$entry->abs_path] = $entry;
		}

		$this->is_content_fetched = true;

		return $content;
	}
}

?>