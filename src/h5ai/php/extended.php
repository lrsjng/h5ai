<?php

require_once "thumbnail.php";


class Entry {
	private $h5ai, $label, $absPath, $absHref, $date, $isFolder, $type, $size, $thumbTypes;

	public function __construct( $h5ai, $absPath, $absHref, $type = null, $label = null ) {

		$this->h5ai = $h5ai;
		$this->label = $label !== null ? $label : $this->h5ai->getLabel( $absHref );
		$this->absPath = $this->h5ai->normalizePath( $absPath, false );
		$this->isFolder = is_dir( $this->absPath );
		$this->absHref = $this->h5ai->normalizePath( $absHref, $this->isFolder );
		
		$this->date = filemtime( $this->absPath );

		if ( $this->isFolder ) {
			$this->type = $type !== null ? $type : "folder";
			$this->size = "";
		} else {
			$this->type = $type !== null ? $type : $this->h5ai->getType( $this->absPath );
			$this->size = filesize( $this->absPath );
		}
		
		$this->thumbTypes = array( "bmp", "gif", "ico", "image", "jpg", "png", "tiff" );
	}

	public function isFolder() {

		return $this->isFolder;
	}

	function compare( $that, $sortOrder ) {

		if ( $this->isFolder && !$that->isFolder ) {
			return -1;
		}
		if ( !$this->isFolder && $that->isFolder ) {
			return 1;
		}

		$res = 0;
		if ( $sortOrder[ "column" ] === "name" ) {
			$res = strcasecmp( $this->absPath, $that->absPath );
		} else if ( $sortOrder[ "column" ] === "date" ) {
			$res = $this->date - $that->date;
		} else if ( $sortOrder[ "column" ] === "size" ) {
			$res = $this->size - $that->size;
		}
		if ( ! $sortOrder[ "ascending" ] ) {
			$res = -$res;
		}
		return $res;
	}

	public function toHtml( $dateFormat ) {

		$classes = "entry " . $this->type;
		$img = $this->type;
		$smallImg = "/h5ai/icons/16x16/" . $this->type . ".png";
		$bigImg = "/h5ai/icons/48x48/" . $this->type . ".png";
		$hint = "";
		$dateLabel = date( $dateFormat, $this->date );

		if ( $this->isFolder && $this->type !== "folder-parent" ) {
			$code = $this->h5ai->getHttpCode( $this->absHref );
			$classes .= " checkedHttpCode";
			if ( $code !== "h5ai" ) {
				if ( $code === 200 ) {
					$img = "folder-page";
					$smallImg = "/h5ai/icons/16x16/folder-page.png";
					$bigImg = "/h5ai/icons/48x48/folder-page.png";
				} else {
					$classes .= " error";
					$hint = "<span class='hint'> " . $code . " </span>";
				}
			}
		}
		if ( $this->h5ai->showThumbs() && in_array( $this->type, $this->thumbTypes ) ) {
			$classes .= " thumb";
			$thumbnail = new Thumbnail( $this->absPath, "square", 16, 16 );
			$thumbnail->create();
			$smallImg = file_exists( $thumbnail->getPath() ) ? $thumbnail->getHref() : $thumbnail->getLiveHref();
			$thumbnail = new Thumbnail( $this->absPath, "rational", 96, 46 );
			$thumbnail->create();
			$bigImg = file_exists( $thumbnail->getPath() ) ? $thumbnail->getHref() : $thumbnail->getLiveHref();
		}

		$html = "\t<li class='" . $classes . "'>\n";
		$html .= "\t\t<a href='" . $this->absHref . "'>\n";
		$html .= "\t\t\t<span class='icon small'><img src='" . $smallImg . "' alt='" . $img . "' /></span>\n";
		$html .= "\t\t\t<span class='icon big'><img src='" . $bigImg . "' alt='" . $img . "' /></span>\n";
		$html .= "\t\t\t<span class='label'>" . $this->label . $hint . "</span>\n";
		$html .= "\t\t\t<span class='date'>" . $dateLabel . "</span>\n";
		$html .= "\t\t\t<span class='size'>" . $this->formatSize( $this->size ) . "</span>\n";
		$html .= "\t\t</a>\n";
		$html .= "\t</li>\n";
		return $html;
	}

	
	private function formatSize( $size ) {

		$units = array( 'B', 'KB', 'MB', 'GB', 'TB' );
	    for ( $i = 0; $size >= 1024 && $i < 4; $i++ ) {
	    	$size /= 1024;
	    }
	    return round( $size, 0 ) . " " . $units[$i];
	}
}


class Extended {
	private $h5ai, $parent, $content;

	public function __construct( $h5ai ) {

		$this->h5ai = $h5ai;
		$this->parent = null;
		$this->content = array();
		$this->loadContent();
	}

	private function loadContent() {

		if ( $this->h5ai->getAbsHref() !== "/" ) {
			$options = $this->h5ai->getOptions();
			$parentPath = dirname( $this->h5ai->getAbsPath() );
			$parentHref = dirname( $this->h5ai->getAbsHref() );
			$label = $options["setParentFolderLabels"] === true ? $this->h5ai->getLabel( $parentHref ) : "<span class='l10n-parentDirectory'>Parent Directory</span>";
			$this->parent = new Entry( $this->h5ai, $parentPath, $parentHref, "folder-parent", $label );
		}

		$this->content = array();

		$files = $this->h5ai->readDir( $this->h5ai->getAbsPath() );
		foreach ( $files as $file ) {
			$absPath = $this->h5ai->getAbsPath() . "/" . $file;
			$absHref = $this->h5ai->getAbsHref() . rawurlencode( $file );
			$this->content[$absPath] = new Entry( $this->h5ai, $absPath, $absHref );
		}

		$this->sort();
	}

	public function cmpEntries( $p1, $p2 ) {

		return $p1->compare( $p2, $this->h5ai->getSortOrder() );
	}

	public function sort() {

		uasort( $this->content, array( $this, "cmpEntries" ) );
	}

	public function getFolderCount() {

		$count = 0;
		foreach( $this->content as $entry ) {
			if ( $entry->isFolder() ) {
				$count++;
			}
		}
		return $count;
	}

	public function getFileCount() {

		$count = 0;
		foreach( $this->content as $entry ) {
			if ( !$entry->isFolder() ) {
				$count++;
			}
		}
		return $count;
	}

	public function toHtml() {

		$html = "<section id='extended' class='" . $this->h5ai->getView() . "-view clearfix'>\n";
		$html .= "<ul>\n";
		$html .= $this->generateHeaders();
		if ( $this->parent !== null ) {
			$html .= $this->parent->toHtml( $this->h5ai->getDateFormat() );
		}
		foreach( $this->content as $entry ) {
			$html .= $entry->toHtml( $this->h5ai->getDateFormat() );
		}
		$html .= "</ul>\n";
		if ( count( $this->content ) === 0 ) {
			$html .= "<div class='empty l10n-empty'>empty</div>";
		}
		$html .="</section>";
		return $html;
	}

	public function generateHeaders() {

		$asc = "<img src='/h5ai/images/ascending.png' class='sort' alt='ascending' />";
		$desc = "<img src='/h5ai/images/descending.png' class='sort' alt='descending' />";

		$so = $this->h5ai->getSortOrder();
		$order = $so["ascending"] ? $asc : $desc;
		$nameHref = "?col=name" . ( $so["column"] === "name" && $so["ascending"] ? "&asc=false" : "&asc=true" );
		$dateHref = "?col=date" . ( $so["column"] === "date" && $so["ascending"] ? "&asc=false" : "&asc=true" );
		$sizeHref = "?col=size" . ( $so["column"] === "size" && $so["ascending"] ? "&asc=false" : "&asc=true" );
		$nameSort = $so["column"] === "name" ? $order : "";
		$dateSort = $so["column"] === "date" ? $order : "";
		$sizeSort = $so["column"] === "size" ? $order : "";

		$html = "\t<li class='header'>\n";
		$html .= "\t\t<a class='icon'></a>\n";
		$html .= "\t\t<a class='label' href='$nameHref'><span class='l10n-name'>Name</span>$nameSort</a>\n";
		$html .= "\t\t<a class='date' href='$dateHref'>$dateSort<span class='l10n-lastModified'>Last modified</span></a>\n";
		$html .= "\t\t<a class='size' href='$sizeHref'>$sizeSort<span class='l10n-size'>Size</span></a>\n";
		$html .= "\t</li>\n";
		return $html;
	}
}

?>