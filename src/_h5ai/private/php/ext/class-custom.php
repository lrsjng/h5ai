<?php

class Custom {
    private static $EXTENSIONS = ['html', 'md'];
    private $context;

    public function __construct($context) {
        $this->context = $context;
    }

    private function read_custom_file($path, $name, &$content, &$type) {
        $file_prefix = $this->context->get_setup()->get('FILE_PREFIX');

        foreach (Custom::$EXTENSIONS as $ext) {
            $file = $path . '/' . $file_prefix . '.' . $name . '.' . $ext;
            if (is_readable($file)) {
                $content = file_get_contents($file);
                $type = $ext;
                return;
            }
        }
    }

    /**
     * Load custom options for the specified path. Traverses the directory structure to include
     * options for all parent directories too. Options in children will override the options
     * inherited from their ancestors.
     *
     * @param $href string
     * @return array<mixed>
     */
    private function get_options(string $href) {
        if (!$this->context->query_option('custom.enabled', false)) {
            return [];
        }

        $file_prefix = $this->context->get_setup()->get('FILE_PREFIX');
        $root_path = $this->context->get_setup()->get('ROOT_PATH');

        // Find all options files, from the current path all the way to the root
        $option_files = [];
        $path = $this->context->to_path($href);
        do {
            $file = $path . '/' . $file_prefix . '.options.json';
            if (is_readable($file)) {
                $option_files[] = Json::load($file);
            }
            $path = Util::normalize_path(dirname($path));
        } while ($path !== $root_path && $path !== '/' && $href !== '/');

        return count($option_files) === 0 ? [] : array_merge(...array_reverse($option_files));
    }

    public function get_customizations($href) {
        if (!$this->context->query_option('custom.enabled', false)) {
            return [
                'header' => ['content' => null, 'type' => null],
                'footer' => ['content' => null, 'type' => null],
                'options' => (object)[],
            ];
        }

        $root_path = $this->context->get_setup()->get('FILE_PREFIX');
        $path = $this->context->to_path($href);

        $header = null;
        $header_type = null;
        $footer = null;
        $footer_type = null;

        $this->read_custom_file($path, 'header', $header, $header_type);
        $this->read_custom_file($path, 'footer', $footer, $footer_type);

        while ($header === null || $footer === null) {
            if ($header === null) {
                $this->read_custom_file($path, 'headers', $header, $header_type);
            }
            if ($footer === null) {
                $this->read_custom_file($path, 'footers', $footer, $footer_type);
            }
            if ($path === $root_path) {
                break;
            }
            $parent_path = Util::normalize_path(dirname($path));
            if ($parent_path === $path) {
                break;
            }

            // Stop once we reach the root
            if (
                $this->context->query_option('custom.stopSearchingAtRoot', true) &&
                $path === $this->context->get_setup()->get('ROOT_PATH')
            ) {
                break;
            }
            $path = $parent_path;
        }

        return [
            'header' => ['content' => $header, 'type' => $header_type],
            'footer' => ['content' => $footer, 'type' => $footer_type],
            'options' => (object)self::get_options($href),
        ];
    }
}
