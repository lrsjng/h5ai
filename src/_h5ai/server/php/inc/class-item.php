<?php

class Item {

	public static function cmp($item1, $item2) {

		if ($item1->is_folder && !$item2->is_folder) {
			return -1;
		}
		if (!$item1->is_folder && $item2->is_folder) {
			return 1;
		}

		return strcasecmp($item1->path, $item2->path);
	}


	private static $size_cache = array();


	private static function filesize($app, $path) {

		if (array_key_exists($path, Item::$size_cache)) {
			return Item::$size_cache[$path];
		}

		$size = 0;

		if (is_file($path)) {

			$size = @filesize($path);

		} else if (is_dir($path)) {

			$options = $app->get_options();
			if ($options["foldersize"]["enabled"]) {
				if (HAS_CMD_DU && $options["foldersize"]["type"] === "shell-du") {
					$cmdv = array("du", "-sk", $path);
					$size = intval(preg_replace("#\s.*$#", "", exec_cmdv($cmdv)), 10) * 1024;
				} else {
					foreach ($app->read_dir($path) as $name) {
						$size += Item::filesize($app, $path . "/" . $name);
					}
				}
			}
		}

		Item::$size_cache[$path] = $size;
		return $size;
	}


	public static function get($app, $path, &$cache) {

		if (!starts_with($path, ROOT_PATH)) {
			err_log("ILLEGAL REQUEST: " . $path . ", " . ROOT_PATH);
			return null;
		}

		if (is_array($cache) && array_key_exists($path, $cache)) {
			return $cache[$path];
		}

		$item = new Item($app, $path);

		if (is_array($cache)) {
			$cache[$path] = $item;
		}
		return $item;
	}


	public $app,
			$path, $url,
			$date, $size,
			$is_folder,
			$is_content_fetched;


	private function __construct($app, $path) {

		$this->app = $app;

		$this->path = normalize_path($path, false);
		$this->is_folder = is_dir($this->path);
		$this->url = $app->to_url($this->path, $this->is_folder);
		$this->date = @filemtime($this->path);
		$this->size = Item::filesize($app, $this->path);
		$this->is_content_fetched = false;
	}


	public function to_json_object() {

		$obj = array(
			"absHref" => $this->url,
			"time" => $this->date * 1000, // seconds (PHP) to milliseconds (JavaScript)
			"size" => $this->size
		);

		if ($this->is_folder) {
			$obj["status"] = $this->app->get_http_code($this->url);
			$obj["content"] = $this->is_content_fetched;
		}

		return $obj;
	}


	public function get_parent(&$cache) {

		$parent_path = normalize_path(dirname($this->path), false);
		if ($parent_path !== $this->path && starts_with($parent_path, ROOT_PATH)) {
			return Item::get($this->app, $parent_path, $cache);
		}
		return null;
	}


	public function get_content(&$cache) {

		$items = array();

		if ($this->app->get_http_code($this->url) !== MAGIC_SEQUENCE) {
			return $items;
		}

		$files = $this->app->read_dir($this->path);
		foreach ($files as $file) {
			$item = Item::get($this->app, $this->path . "/" . $file, $cache);
			$items[$item->path] = $item;
		}

		$this->is_content_fetched = true;

		return $items;
	}
}

?>