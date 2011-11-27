<?php

class TreeEntry {
    private $h5ai, $label, $absPath, $absHref, $isFolder, $type, $content;

    public function __construct($h5ai, $absPath, $absHref, $type = null) {

        $this->h5ai = $h5ai;

        $this->label = $this->h5ai->getLabel($absHref);
        $this->absPath = $this->h5ai->normalizePath($absPath, false);
        $this->isFolder = is_dir($this->absPath);
        $this->absHref = $this->h5ai->normalizePath($absHref, $this->isFolder);

        $this->type = $type !== null ? $type : ($this->isFolder ? "folder" : $this->h5ai->getType($this->absPath));
        $this->content = null;
    }

    public function loadContent() {

        $this->content = array();

        if ($this->h5ai->getHttpCode($this->absHref) !== "h5ai") {
            return;
        }

        $files = $this->h5ai->readDir($this->absPath);
        foreach ($files as $file) {
            $tree = new TreeEntry($this->h5ai, $this->absPath . "/" . $file, $this->absHref . rawurlencode($file));

            if ($tree->isFolder) {
                $this->content[$tree->absPath] = $tree;
            }
        }

        $this->sort();
    }

    public function cmpTrees($t1, $t2) {

        if ($t1->isFolder && !$t2->isFolder) {
            return -1;
        }
        if (!$t1->isFolder && $t2->isFolder) {
            return 1;
        }
        return strcasecmp($t1->absPath, $t2->absPath);
    }

    public function sort() {

        if ($this->content !== null) {
            uasort($this->content, array($this, "cmpTrees"));
        }
    }

    public function toHtml() {

        $classes = "entry " . $this->type . ($this->absHref === $this->h5ai->getAbsHref() ? " current" : "");
        $icon = $this->type;
        if ($this->absHref === "/") {
            $icon = "folder-home";
        }
        $hint = "";
        $code = "h5ai";

        if ($this->isFolder) {
            $code = $this->h5ai->getHttpCode($this->absHref);
            $classes .= " checkedHttpCode";
            if ($code !== "h5ai") {
                if ($code === 200) {
                    $icon = "folder-page";
                    $hint = "<span class='hint'><img src='" . $this->h5ai->image("page") . "' alt='page' /></span>";
                } else {
                    $classes .= " error";
                    $hint = "<span class='hint'> " . $code . " </span>";
                }
            }
        }

        $html = "<div class='" . $classes ."'>\n";
        if ($this->content !== null && count($this->content) === 0 || $code !== "h5ai") {
            $html .= "<span class='blank'></span>\n";
        } else {
            $indicatorState = $this->content === null ? " unknown" : " open";
            $html .= "<span class='indicator" . $indicatorState . "'><img src='" . $this->h5ai->image("tree") . "' alt='>' /></span>\n";
        }
        $html .= "<a href='" . $this->absHref . "'>\n";
        $html .= "<span class='icon'><img src='" . $this->h5ai->icon($icon) . "' alt='" . $icon . "' /></span>\n";
        $html .= "<span class='label'>" . $this->label . "</span>" . $hint . "\n";
        $html .= "</a>\n";
        $html .= $this->contentToHtml();
        $html .= "</div>\n";
        return $html;
    }

    public function contentToHtml() {

        $html = "<ul class='content'>\n";
        if ($this->content !== null) {
            foreach($this->content as $tree) {
                $html .= "<li>" . $tree->toHtml() . "</li>";
            }
        }
        $html .= "</ul>\n";
        return $html;
    }

    public function getRoot() {

        if ($this->absHref === "/") {
            return $this;
        };

        $tree = new TreeEntry($this->h5ai, dirname($this->absPath), dirname($this->absHref));
        $tree->loadContent();
        $tree->content[$this->absPath] = $this;

        return $tree->getRoot();
    }
}


class Tree {
    private $h5ai;

    public function __construct($h5ai) {

        $this->h5ai = $h5ai;
    }

    public function toHtml() {

        $options = $this->h5ai->getOptions();
        if ($options["showTree"] === false) {
            return "";
        }

        $tree = new TreeEntry($this->h5ai, $this->h5ai->getAbsPath(), $this->h5ai->getAbsHref());
        $tree->loadContent();
        $root = $tree->getRoot();
        return "<section id='tree'>\n" . $root->toHtml() . "</section>\n";
    }
}


?>