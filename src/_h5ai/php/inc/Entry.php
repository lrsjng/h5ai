<?php

class Entry {


	private static $cache = array();


	public static function getCache() {

		return Entry::$cache;
	}


	public static function get($h5ai, $absPath, $absHref) {

		if (array_key_exists($absHref, Entry::$cache)) {
			return Entry::$cache[$absHref];
		}

		return new Entry($h5ai, $absPath, $absHref);
	}


	public static function sort() {

		uasort(Entry::$cache, function ($entry1, $entry2) {

			return strcasecmp($entry1->absHref, $entry2->absHref);
		});
	}




	public $h5ai, $absPath, $absHref, $date, $size, $isFolder, $parent;


	private function __construct($h5ai, $absPath, $absHref) {

		$this->h5ai = $h5ai;

		$this->absPath = H5ai::normalize_path($absPath);

		$this->isFolder = is_dir($this->absPath);
		$this->absHref = H5ai::normalize_path($absHref, $this->isFolder);

		$this->date = filemtime($this->absPath);

		if ($this->isFolder) {
			$this->size = null;
		} else {
			$this->size = filesize($this->absPath);
		}

		$this->parent = null;
		if ($this->absHref !== "/") {
			$this->parent = Entry::get($this->h5ai, H5ai::normalize_path(dirname($this->absPath)), H5ai::normalize_path(dirname($this->absHref), true));
		}

		Entry::$cache[$this->absHref] = $this;
	}


	public function toJsonObject($withStatus) {

		$obj = array(
			"absHref" => $this->absHref,
			"time" => ($this->date * 1000),
			"size" => $this->size
		);

		if ($withStatus && $this->isFolder) {
			$obj["status"] = $this->h5ai->getHttpCode($this->absHref);
		}

		return $obj;
	}


	public function getParent() {

		return $this->parent;
	}


	public function getContent() {

		$content = array();

		if ($this->h5ai->getHttpCode($this->absHref) !== "h5ai") {
			return $content;
		}

		$files = $this->h5ai->readDir($this->absPath);
		foreach ($files as $file) {
			$entry = Entry::get($this->h5ai, $this->absPath . "/" . $file, $this->absHref . rawurlencode($file));
			$content[$entry->absPath] = $entry;
		}

		return $content;
	}
}

?>