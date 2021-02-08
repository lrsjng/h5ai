<?php

class Thumb {
    private static $FFMPEG_CMDV = ['ffmpeg', '-v', 'warning', '-nostdin', '-y', '-hide_banner', '-ss', '[H5AI_DUR]', '-i', '[H5AI_SRC]', '-an', '-vframes', '1', '-f', 'image2', '-'];
    private static $FFPROBE_CMDV = ['ffprobe', '-v', 'warning', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', '[H5AI_SRC]'];
    private static $AVCONV_CMDV = ['avconv', '-v', 'warning', '-nostdin', '-y', '-hide_banner', '-ss', '[H5AI_DUR]', '-i', '[H5AI_SRC]', '-an', '-vframes', '1', '-f', 'image2', '-'];
    private static $AVPROBE_CMDV = ['avprobe', '-v', 'warning', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', '[H5AI_SRC]'];
    private static $CONVERT_CMDV = ['convert', '-density', '200', '-quality', '100', '-strip', '[H5AI_SRC][0]', 'JPG:-'];
    private static $GM_CONVERT_CMDV = ['gm', 'convert', '-density', '200', '-quality', '100', '-strip', '[H5AI_SRC][0]', 'JPG:-'];
    private static $THUMB_CACHE = 'thumbs';

    private $context;
    private $setup;
    private $thumbs_path;
    private $thumbs_href;
    private $image;
    private $attempt;

    public function __construct($context, $source_path, $type) {
        $this->context = $context;
        $this->setup = $context->get_setup();
        $this->thumbs_path = $this->setup->get('CACHE_PUB_PATH') . '/' . self::$THUMB_CACHE;
        $this->thumbs_href = $this->setup->get('CACHE_PUB_HREF') . self::$THUMB_CACHE;
        $this->source_path = $source_path;
        $this->type = $type;
        $this->source_hash = sha1($source_path);
        $this->capture_data = false;
        $this->thumb_path = null;
        $this->thumb_href = null;
        $this->image = null;
        $this->attempt = 0;

        if (!is_dir($this->thumbs_path)) {
            @mkdir($this->thumbs_path, 0755, true);
        }
    }

    public function __destruct(){
        if ($this->image !== null) {
            unset($this->image);
        }
    }

    public function thumb($width, $height) {
        if (!file_exists($this->source_path) || Util::starts_with($this->source_path, $this->setup->get('CACHE_PUB_PATH'))) {
            return null;
        }
        $name = 'thumb-' . $this->source_hash . '-' . $width . 'x' . $height . '.jpg';
        $this->thumb_path = $this->thumbs_path . '/' . $name;
        $this->thumb_href = $this->thumbs_href . '/' . $name;

        if (file_exists($this->thumb_path) && filemtime($this->source_path) <= filemtime($this->thumb_path)) {
            if ($this->type === 'file') {
                // This one was previously detected as able to generate thumbnail,
                // if we leave 'file' as type, this would block the next requests
                $this->type = 'done';
            }
            return $this->thumb_href;
        }
        if ($this->image !== null) {
            // Use cached capture data
            return $this->thumb_href($width, $height);
        }

        $types = Util::get_types_array($this->type);
        $thumb_href = null;

        /* Hopefully, the first type is the right one, but in the off chance
           that it is not, we'll shift to test the subsequent ones. */
        foreach($types as $type) {
            $capture = $this->capture($type);
            if (!$capture) {
                if ($this->type === 'file') {
                    break;  // We have tried as a file but failed
                }
                continue;
            }
            $thumb_href = $this->thumb_href($width, $height);
            if (!is_null($thumb_href)) {
                return $thumb_href;
            }
        }
        return $thumb_href;
    }

    private function thumb_href($width, $height) {
        $this->image->thumb($width, $height);
        $this->image->save_dest_jpeg($this->thumb_path, 80);

        if (file_exists($this->thumb_path)) {
            // Cache it for further requests
            return $this->thumb_href;
        }
        unset($this->image);
        $this->image = null;
        return null;
    }

    private function capture($type) {
        if ($this->attempt >= count(Util::AVAILABLE_TYPES)) {
            return false;
        }
        ++$this->attempt;
        if ($type === 'file') {
            if ($this->setup->get('HAS_PHP_FILEINFO')) {
                $handler_type = Util::mime_to_handler_type(
                    Util::get_mimetype($this->source_path));
                $this->type = $handler_type;
                if ($handler_type === 'file') {
                    return false;  // Giving up
                }
                return $this->capture($handler_type);
            }
            else {
                $this->type = 'file';
                return false;
            }
        }
        else if ($type === 'img') {
            if ($this->setup->get('HAS_PHP_EXIF')) {
                $exiftype = exif_imagetype($this->source_path);
                if (!$exiftype) {
                    return false;
                }
                //       IMAGETYPE_SWF      IMAGETYPE_SWC
                else if ($exiftype === 4 || $exiftype === 13) {
                    return $this->capture('swf');
                }
            }
            $success = $this->do_capture_img();
            return $success ? $success : $this->capture('file');
        }
        else if ($type === 'mov') {
            if ($this->setup->get('HAS_CMD_FFMPEG')) {
                $probe_cmd = self::$FFPROBE_CMDV;
                $conv_cmd = self::$FFMPEG_CMDV;
            } else if ($this->setup->get('HAS_CMD_AVCONV')) {
                $probe_cmd = self::$AVPROBE_CMDV;
                $conv_cmd = self::$AVCONV_CMDV;
            } else {
                return false;
            }
            try {
                $timestamp = $this->compute_duration($probe_cmd, $this->source_path);
                return $this->do_capture($conv_cmd, $timestamp);
            } catch (Exception $e) {
                return $this->capture('file');
            }
        }
        else if ($type === 'swf'){
            if ($this->setup->get('HAS_CMD_FFMPEG')) {
                $probe_cmd = self::$FFPROBE_CMDV;
                $conv_cmd = self::$FFMPEG_CMDV;
            } else if ($this->setup->get('HAS_CMD_AVCONV')) {
                $probe_cmd = self::$AVPROBE_CMDV;
                $conv_cmd = self::$AVCONV_CMDV;
            } else {
                return false;
            }
            try {
                $timestamp = $this->compute_duration($probe_cmd, $this->source_path);
                $conv_cmd[6] = '-i';
                $conv_cmd[7] = '[H5AI_SRC]';
                $conv_cmd[8] = '-ss';
                $conv_cmd[9] = '[H5AI_DUR]';
                return $this->do_capture($conv_cmd, $timestamp);
            } catch (Exception $e) {
                return $this->capture('file');
            }
        }
        else if ($type === 'doc') {
            try {
                if ($this->setup->get('HAS_CMD_GM')) {
                    return $this->do_capture(self::$GM_CONVERT_CMDV);
                } else if ($this->setup->get('HAS_CMD_CONVERT')) {
                    return $this->do_capture(self::$CONVERT_CMDV);
                } else {
                    return false;
                }
            } catch (Exception $e) {
                return $this->capture('file');
            }
        }
        return false;
    }

    public function do_capture_img() {
        $image = new Image($this->source_path);

        $MBs = 2 * 1024 * 1024;
        $capture_data = fopen("php://temp/maxmemory:$MBs", 'r+');

        $et = false;
        if ($this->setup->get('HAS_PHP_EXIF') && $this->context->query_option('thumbnails.exif', false) === true) {
            $et = @exif_thumbnail($this->source_path);
        }
        if($et !== false) {
            rewind($capture_data);  // Make sure we don't append
            fwrite($capture_data, $et);

            $is_valid = $image->set_source_data($capture_data);
            $image->normalize_exif_orientation($this->source_path);
        } else {
            $input_file  = fopen($this->source_path, 'r');
            stream_copy_to_stream($input_file, $capture_data);
            fclose($input_file);
            $is_valid = $image->set_source_data($capture_data);
        }
        fclose($capture_data);

        if (!$is_valid) {
            unset($image);
            return false;
        }
        if ($this->image === null) {
            $this->image = $image;
        }
        return true;
    }

    public function do_capture($cmdv, $timestamp = null) {
        if (is_null($timestamp)){
            foreach ($cmdv as &$arg) {
                $arg = str_replace('[H5AI_SRC]', $this->source_path, $arg);
            }
        } else {
            foreach ($cmdv as &$arg) {
                $arg = str_replace(
                    ['[H5AI_SRC]', '[H5AI_DUR]'],
                    [$this->source_path, $timestamp],
                    $arg
                );
            }
        }
        $image = new Image($this->source_path);

        // If the result is more than 2MiB, write it to /tmp
        $MBs = 2 * 1024 * 1024;
        $capture_data = fopen("php://temp/maxmemory:$MBs", 'r+');

        $error = null;
        $exit = Util::proc_open_cmdv($cmdv, $capture_data, $error);

        // Make sure our output is a valid image
        rewind($capture_data);
        $data = fread($capture_data, 3);
        // Instead of parsing the child process' stderror stream for actual errors,
        // simply make sure the stdout stream start with the JPEG magic number
        $is_image = (!empty($data)) ? (bin2hex($data) === 'ffd8ff') : false;

        if (!$is_image){
            fclose($capture_data);
            throw new Exception($error);
        }
        $success = $image->set_source_data($capture_data);
        fclose($capture_data);
        if (!$success){
            return false;
        }
        if ($this->image === null) {
            $this->image = $image;
        }
        return true;
    }

    private function compute_duration($cmdv, $source_path) {
        foreach ($cmdv as &$arg) {
            $arg = str_replace('[H5AI_SRC]', $source_path, $arg);
        }
        $output = null;
        $error = null;
        $exit = Util::proc_open_cmdv($cmdv, $output, $error);
        if (empty($output) || !is_numeric($output) || is_infinite($output)) {
            if (!empty($error) && strpos($error, 'misdetection possible') !== false) {
                throw new Exception($error);
            }
            return '0.1';
        }
        // Seek at user-defined percentage of the total video duration
        return strval(
            round(
            (floatval($duration) *
            floatval($this->context->query_option('thumbnails.seek', 50)) / 100),
            1, PHP_ROUND_HALF_UP)
        );
    }
}

class Image {
    private $source_file;
    private $source;
    private $width;
    private $height;
    private $dest;

    public function __construct($filename = null) {
        $this->source_file = null;
        $this->source = null;
        $this->width = null;
        $this->height = null;

        $this->dest = null;

        $this->source_file = $filename;
    }

    public function __destruct() {
        $this->release_source();
        $this->release_dest();
    }

    public function set_source_data($fp) {
        $this->release_dest();

        rewind($fp);
        try {
            $this->source = imagecreatefromstring(
                stream_get_contents($fp));
        } catch (Exception $e) {
            $this->source = null;
            return false;
        }
        if (!$this->source) {
            $this->source = null;
            return false;
        }
        $this->width = imagesx($this->source);
        $this->height = imagesy($this->source);

        if (!$this->width || !$this->height) {
            $this->release_source();
            $this->source_file = null;
            $this->width = null;
            $this->height = null;
            return false;
        }
        return true;
    }

    public function save_dest_jpeg($filename, $quality = 80) {
        if (!is_null($this->dest)) {
            @imagejpeg($this->dest, $filename, $quality);
            @chmod($filename, 0775);
        }
    }

    public function release_dest() {
        if (!is_null($this->dest)) {
            @imagedestroy($this->dest);
            $this->dest = null;
        }
    }

    public function release_source() {
        if (!is_null($this->source)) {
            @imagedestroy($this->source);
            $this->source_file = null;
            $this->source = null;
            $this->width = null;
            $this->height = null;
        }
    }

    public function thumb($width, $height) {
        if (is_null($this->source)) {
            return;
        }

        $src_r = 1.0 * $this->width / $this->height;

        if ($height == 0) {
            if ($src_r >= 1) {
                $height = 1.0 * $width / $src_r;
            } else {
                $height = $width;
                $width = 1.0 * $height * $src_r;
            }
            if ($width > $this->width) {
                $width = $this->width;
                $height = $this->height;
            }
        }

        $ratio = 1.0 * $width / $height;

        if ($src_r <= $ratio) {
            $src_w = $this->width;
            $src_h = $src_w / $ratio;
            $src_x = 0;
        } else {
            $src_h = $this->height;
            $src_w = $src_h * $ratio;
            $src_x = 0.5 * ($this->width - $src_w);
        }

        $width = intval($width);
        $height = intval($height);
        $src_x = intval($src_x);
        $src_w = intval($src_w);
        $src_h = intval($src_h);

        $this->dest = imagecreatetruecolor($width, $height);
        $icol = imagecolorallocate($this->dest, 255, 255, 255);
        imagefill($this->dest, 0, 0, $icol);
        imagecopyresampled($this->dest, $this->source, 0, 0, $src_x, 0, $width, $height, $src_w, $src_h);
    }

    public function rotate($angle) {
        if (is_null($this->source) || ($angle !== 90 && $angle !== 180 && $angle !== 270)) {
            return;
        }

        //FIXME once rotated, prevent further rotations since we keep $this->source in memory
        $this->source = imagerotate($this->source, $angle, 0);
        if ( $angle === 90 || $angle === 270 ) {
            list($this->width, $this->height) = [$this->height, $this->width];
        }
    }

    public function normalize_exif_orientation($exif_source_file = null) {
        if (is_null($this->source) || !function_exists('exif_read_data')) {
            return;
        }

        if ($exif_source_file === null) {
            $exif_source_file = $this->source_file;
        }

        $exif = exif_read_data($exif_source_file);
        switch (@$exif['Orientation']) {
            case 3:
                $this->rotate(180);
                break;
            case 6:
                $this->rotate(270);
                break;
            case 8:
                $this->rotate(90);
                break;
        }
    }
}
