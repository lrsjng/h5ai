<?php

class Fallback {
    private $context;

    public function __construct($context) {
        $this->context = $context;
    }

    public function get_html($path = null) {
        if (!$path) {
            $path = $this->context->get_current_path();
        }
        $fallback_images_href = $this->context->get_setup()->get('PUBLIC_HREF') . 'images/fallback/';

        $cache = [];
        $folder = Item::get($this->context, $path, $cache);
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
            $html .= '<td class="fb-i"><img src="' . $fallback_images_href . 'folder-parent.png" alt="folder-parent"/></td>';
            $html .= '<td class="fb-n"><a href="..">Parent Directory</a></td>';
            $html .= '<td class="fb-d"></td>';
            $html .= '<td class="fb-s"></td>';
            $html .= '</tr>';
        }

        foreach ($items as $item) {
            $type = $item->is_folder ? 'folder' : 'file';

            $html .= '<tr>';
            $html .= '<td class="fb-i"><img src="' . $fallback_images_href . $type . '.png" alt="' . $type . '"/></td>';
            $html .= '<td class="fb-n"><a href="' . $item->href . '">' . basename($item->path) . '</a></td>';
            $html .= '<td class="fb-d">' . date('Y-m-d H:i', $item->date) . '</td>';
            $html .= '<td class="fb-s">' . ($item->size !== null ? intval($item->size / 1000) . ' KB' : '' ) . '</td>';
            $html .= '</tr>';
        }

        $html .= '</table>';

        return $html;
    }
}
