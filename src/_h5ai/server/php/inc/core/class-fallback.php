<?php

class Fallback {

    private $setup;
    private $app;

    public function __construct($app) {

        $this->setup = $app->get_setup();
        $this->app = $app;
    }

    private function get_current_path() {

        $current_href = Util::normalize_path(parse_url($this->setup->get('REQUEST_URI'), PHP_URL_PATH), true);
        $current_path = $this->app->to_path($current_href);

        if (!is_dir($current_path)) {
            $current_path = Util::normalize_path(dirname($current_path), false);
        }

        return $current_path;
    }

    public function get_html($path = null) {

        if (!$path) {
            $path = $this->get_current_path();
        }

        $app_href = $this->setup->get('APP_HREF');

        $cache = [];
        $folder = Item::get($this->app, $path, $cache);
        $items = $folder->get_content($cache);
        uasort($items, ['Item', 'cmp']);

        $html = '<table>';

        $html .= '<tr>';
        $html .= '<th class="fb-i"></th>';
        $html .= '<th class="fb-n"><span>Name</span></th>';
        $html .= '<th class="fb-d"><span>Last modified</span></th>';
        $html .= '<th class="fb-s"><span>Size</span></th>';
        $html .= '</tr>';

        if ($folder->get_parent($cache)) {
            $html .= '<tr>';
            $html .= '<td class="fb-i"><img src="' . $app_href . 'client/images/fallback/folder-parent.png" alt="folder-parent"/></td>';
            $html .= '<td class="fb-n"><a href="..">Parent Directory</a></td>';
            $html .= '<td class="fb-d"></td>';
            $html .= '<td class="fb-s"></td>';
            $html .= '</tr>';
        }

        foreach ($items as $item) {
            $type = $item->is_folder ? 'folder' : 'file';

            $html .= '<tr>';
            $html .= '<td class="fb-i"><img src="' . $app_href . 'client/images/fallback/' . $type . '.png" alt="' . $type . '"/></td>';
            $html .= '<td class="fb-n"><a href="' . $item->href . '">' . basename($item->path) . '</a></td>';
            $html .= '<td class="fb-d">' . date('Y-m-d H:i', $item->date) . '</td>';
            $html .= '<td class="fb-s">' . ($item->size !== null ? intval($item->size / 1000) . ' KB' : '' ) . '</td>';
            $html .= '</tr>';
        }

        $html .= '</table>';

        return $html;
    }
}
