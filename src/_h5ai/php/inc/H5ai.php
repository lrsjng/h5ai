<?php

require_once "Cache.php";

class H5ai {
    private static $VIEWMODES = array("details", "icons");

    private $docRoot, $h5aiRoot, $h5aiAbsHref, $domain,
            $config, $options, $types, $langs,
            $cache,
            $absHref, $absPath,
            $ignore, $ignoreRE,
            $view;

    public function __construct() {

        global $H5AI_CONFIG;

        $this->docRoot = $H5AI_CONFIG["DOCUMENT_ROOT"];
        $this->h5aiRoot = $H5AI_CONFIG["H5AI_ROOT"];
        $this->ignore = $H5AI_CONFIG["IGNORE"];
        $this->ignoreRE = $H5AI_CONFIG["IGNORE_PATTERNS"];

        $this->config = $this->loadConfig($this->h5aiRoot . "/config.js");
        $this->options = $this->config["options"];
        $this->types = $this->config["types"];
        $this->langs = $this->config["langs"];

        $this->cache = new Cache($this->h5aiRoot . "/cache");

        $this->hrefRoot = $this->options["rootAbsHref"];
        $this->h5aiAbsHref = $this->options["h5aiAbsHref"];
        $this->domain = getenv("HTTP_HOST");

        $this->absHref = $this->normalizePath(preg_replace('/\\?.*/', '', getenv("REQUEST_URI")), true);
        $this->absPath = $this->getAbsPath($this->absHref);

        $this->view = $this->options["viewmodes"][0];
        if (!in_array($this->view, H5ai::$VIEWMODES)) {
            $this->view = H5ai::$VIEWMODES[0];
        }
    }


    private function loadConfig($file) {

        $str = file_exists($file) ? file_get_contents($file) : "";

        // remove comments and change expression to pure json
        $str = preg_replace("/\/\*.*?\*\//s", "", $str);
        $str = preg_replace("/^.*H5AI_CONFIG\s*=\s*/s", "", $str);
        $str = preg_replace("/;.*/s", "", $str);
        $config = json_decode($str, true);

        return $config;
    }


    public function getDocRoot() {

        return $this->docRoot;
    }

    public function getH5aiRoot() {

        return $this->h5aiRoot;
    }

    public function getHrefRoot() {

        return $this->hrefRoot;
    }

    public function getH5aiAbsHref() {

        return $this->h5aiAbsHref;
    }

    public function getDomain() {

        return $this->domain;
    }

    public function getView() {

        return $this->view;
    }

    public function api() {

        return $this->h5aiAbsHref . "php/api.php";
    }

    public function image($id) {

        return $this->h5aiAbsHref . "images/" . $id . ".png";
    }

    public function icon($id, $big = false) {

        return $this->h5aiAbsHref . "icons/" . ($big ? "48x48" : "16x16") . "/" . $id . ".png";
    }

    public function getOptions() {

        return $this->options;
    }

    public function getLangs() {

        return $this->langs;
    }

    public function getAbsHref($absPath = null, $endWithSlash = true) {

        if ($absPath === null) {
            return $this->absHref;
        }

        //
        $absPath=substr($absPath, strlen($this->docRoot));

        $absHref = preg_replace("!^" . $this->docRoot . "!", "", $absPath);
        $parts = explode("/", $absHref);
        $encodedParts = array();
        foreach ($parts as $part) {
            $encodedParts[] = rawurlencode($part);
        }
        $endodedAbsHref = implode("/", $encodedParts);

        //
        $endodedAbsHref = $this->hrefRoot . $endodedAbsHref;

        return $this->normalizePath($endodedAbsHref, $endWithSlash);
    }

    public function getAbsPath($absHref = null) {

        if ($absHref === null) {
            return $this->absPath;
        }

        //
        $absHref=substr($absHref, strlen($this->hrefRoot));

        return $this->normalizePath($this->docRoot . "/" . rawurldecode($absHref), false);
    }

    public function showThumbs() {

        return $this->options["showThumbs"] === true;
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

        foreach($this->types as $type => $exts) {
            foreach($exts as $ext) {
                if ($this->endsWith($absPath, $ext)) {
                    return $type;
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
            $folderStatus = $this->options["folderStatus"];
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
        $msg = "HEAD $absHref HTTP/1.1\r\nHost: $host\r\nConnection: Close\r\n";
        if (isset($_SERVER['PHP_AUTH_USER'])) {
            $msg .= "Authorization: Basic " . base64_encode($_SERVER['PHP_AUTH_USER'] . ":" . $_SERVER['PHP_AUTH_PW']) . "\r\n";
        }
        $msg .= "\r\n";

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