<?php

require_once "cache.php";

class H5ai {
    private static $SORT_ORDER = array("column" => "name", "ascending" => true);
    private static $VIEWMODES = array("details", "icons");

    private $docRoot, $domain, $options, $types, $cache, $absHref, $absPath, $ignore, $ignoreRE, $sortOrder, $dateFormat, $view;

    public function __construct() {

        $this->docRoot = getenv("DOCUMENT_ROOT");
        $this->domain = getenv("HTTP_HOST");

        $this->options = $this->loadOptions($this->docRoot . "/h5ai/options.js");
        $this->types = $this->loadTypes($this->docRoot . "/h5ai/types.txt");
        $this->cache = new Cache($this->docRoot . "/h5ai/cache");

        $this->absHref = $this->normalizePath(preg_replace('/\\?.*/', '', getenv("REQUEST_URI")), true);
        $this->absPath = $this->normalizePath($this->docRoot . rawurldecode($this->absHref), false);

        $this->ignore = $this->options["options"]["ignore"];
        $this->ignoreRE = $this->options["options"]["ignoreRE"];

        $defaultSortOrder = $this->options["options"]["sortorder"];
        $this->sortOrder = array(
            "column" => array_key_exists("col", $_REQUEST) ? $_REQUEST["col"] : $defaultSortOrder["column"],
            "ascending" => array_key_exists("asc", $_REQUEST) ? $_REQUEST["asc"] !== "false" : $defaultSortOrder["ascending"]
        );
        $this->dateFormat = $this->options["options"]["dateFormat"];
        $this->view = array_key_exists("view", $_REQUEST) ? $_REQUEST["view"] : $this->options["options"]["viewmodes"][0];
        if (!in_array($this->view, H5ai::$VIEWMODES)) {
            $this->view = H5ai::$VIEWMODES[0];
        }
    }


    private function loadOptions($file) {

        $str = file_exists($file) ? file_get_contents($file) : "";
        $str = preg_replace("/\/\*.*?\*\//s", "", $str);

        $optstr = preg_replace("/^.*h5aiOptions\s*=\s*/s", "", $str);
        $optstr = preg_replace("/;.*/s", "", $optstr);
        $options = json_decode($optstr, true);

        $langstr = preg_replace("/^.*h5aiLangs\s*=\s*/s", "", $str);
        $langstr = preg_replace("/;.*/s", "", $langstr);
        $langs = json_decode($langstr, true);

        return array("options" => $options, "langs" => $langs);
    }


    private function loadTypes($file) {

        $lines = file($file);
        $types = array();
        foreach($lines as $line) {
            if (substr($line, 0, 1) === '#') {
                continue;
            }
            $types[] = preg_split("/\s+/", $line);
        }
        return $types;
    }

    public function getDocRoot() {

        return $this->docRoot;
    }

    public function getDomain() {

        return $this->domain;
    }

    public function getView() {

        return $this->view;
    }

    public function getOptions() {

        return $this->options["options"];
    }

    public function getLangs() {

        return $this->options["langs"];
    }

    public function getAbsHref($absPath = null, $endWithSlash = true) {

        if ($absPath === null) {
            return $this->absHref;
        }
        $absHref = preg_replace("!^" . $this->docRoot . "!", "", $absPath);
        $parts = explode("/", $absHref);
        $encodedParts = array();
        foreach ($parts as $part) {
            $encodedParts[] = rawurlencode($part);
        }
        $endodedAbsHref = implode("/", $encodedParts);
        return $this->normalizePath($endodedAbsHref, $endWithSlash);
    }

    public function getAbsPath($absHref = null) {

        if ($absHref === null) {
            return $this->absPath;
        }
        return $this->normalizePath($this->docRoot . rawurldecode($absHref), false);
    }

    public function getSortOrder() {

        return $this->sortOrder;
    }

    public function getDateFormat() {

        return $this->dateFormat;
    }

    public function showThumbs() {

        return $this->options["options"]["showThumbs"] === true;
    }

    public function getTitle() {

        $title = $this->domain . rawurldecode($this->absHref);
        $title = preg_replace("/\/$/", "", $title);
        $title = preg_replace("/\//", " > ", $title);
        if ($this->absHref !== "/") {
            $title = basename($this->absPath) . " - " . $title;
        }
        return $title;
    }

    public function getType($absPath) {

        foreach($this->types as $type) {
            foreach(array_slice($type, 1) as $pattern) {
                if ($this->endsWith($absPath, $pattern)) {
                    return $type[0];
                }
            }
        }
        return "unknown";
    }

    public function ignoreThisFile($file) {

        # always ignore
        if ($file === "." || $file === ".." || $this->startsWith($file, '.ht')) {
            return true;
        }

        if (in_array($file, $this->ignore)) {
            return true;
        }
        foreach ($this->ignoreRE as $re) {
            if (preg_match($re, $file)) {
                return true;
            }
        }

        return false;
    }

    public function readDir($path) {

        $content = array();
        if (is_dir($path)) {
            if ($dir = opendir($path)) {
                while (($file = readdir($dir)) !== false) {
                    if (!$this->ignoreThisFile($file)) {
                        $content[] = $file;
                    }
                }
                closedir($dir);
            }
        }
        return $content;
    }

    public function getLabel($absHref) {

        return $absHref === "/" ? $this->domain : rawurldecode(basename($absHref));
    }

    public function normalizePath($path, $endWithSlash) {

        return ($path === "/") ? "/" : (preg_replace('#/$#', '', $path) . ($endWithSlash ? "/" : ""));
    }

    public function startsWith($sequence, $start) {

        return strcasecmp(substr($sequence, 0, strlen($start)), $start) === 0;
    }

    public function endsWith($sequence, $end) {

        return strcasecmp(substr($sequence, -strlen($end)), $end) === 0;
    }

    public function getHttpCode($absHref) {

        return $this->cachedHttpCode($absHref);
        #return $this->fetchHttpCode($absHref);
        #return $this->guessHttpCode($absHref);
    }

    public function cachedHttpCode($absHref) {

        $cached = $this->cache->get($absHref);
        if ($cached === false) {
            $folderStatus = $this->options["options"]["folderStatus"];
            if (array_key_exists($absHref, $folderStatus)) {
                $code = $folderStatus[$absHref];
            } else {
                $code = $this->fetchHttpCode($absHref);
            }
            $cached = array("href" => $absHref, "code" => $code);
            $this->cache->set($absHref, $cached);
        }
        return $cached["code"];
    }

    public function fetchHttpCode($absHref) {

        $contentType = "Content-Type:";
        $h5aiContentType = "Content-Type: text/html;h5ai=";
        $host = getenv("HTTP_HOST");
        $port = getenv("SERVER_PORT");
        $msg = "HEAD $absHref HTTP/1.1\r\nHost: $host\r\nConnection: Close\r\n\r\n";

        $errno = "";
        $errstr = "";
        $socket = fsockopen($host, $port, $errno, $errstr, 30);
        if($socket === 0) {
            return null;
        }

        fwrite($socket, $msg);
        $content = fgets($socket);
        $code = intval(trim(substr($content, 9, 4)));
        if ($code === 200) {
            while (! $this->startsWith($content, $contentType)) {
                $content = fgets($socket);
            }
            if ($this->startsWith($content, $h5aiContentType)) {
                $code = "h5ai";
            }
        }
        fclose($socket);
        return $code;
    }

    public function guessHttpCode($absHref) {

        $indexFiles = array("index.html", "index.cgi", "index.pl", "index.php", "index.xhtml", "index.htm");
        $absPath = $this->getAbsPath($absHref);
        $files = $this->readDir($absPath);
        foreach ($files as $file) {
            if (in_array($file, $indexFiles)) {
                return 200;
            }
        }
        return "h5ai";
    }
}

?>