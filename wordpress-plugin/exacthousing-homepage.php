<?php
/**
 * Plugin Name: ExactHousing Integrated 3D Homepage
 * Description: Full ExactHousing homepage with a small real-time 3D material study and the original scroll-driven home-making story.
 * Version: 1.0.1
 * Author: ExactHousing
 */
if (!defined('ABSPATH')) { exit; }

function ehx_integrated_homepage_shortcode() {
    static $instance = 0;
    $instance++;
    $base = plugin_dir_url(__FILE__);
    $template = plugin_dir_path(__FILE__) . 'assets/template-full.html';
    if (!file_exists($template)) {
        return '<p>ExactHousing homepage template is missing.</p>';
    }
    $markup = file_get_contents($template);
    if ($markup === false) {
        return '<p>ExactHousing homepage could not be loaded.</p>';
    }
    $markup = str_replace('id="ehx-home-story"', 'id="ehx-home-story-' . $instance . '"', $markup);
    $css = '<link rel="stylesheet" href="' . esc_url($base . 'assets/story.css?ver=1.0.1') . '">';
    $map = '<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"}}</script>';
    $room = '<script type="module" src="' . esc_url($base . 'assets/material-room.js?ver=1.0.1') . '"></script>';
    $story = '<script type="module" src="' . esc_url($base . 'assets/story.js?ver=1.0.1') . '"></script>';
    return $css . $map . $markup . $room . $story;
}
add_shortcode('exacthousing_homepage', 'ehx_integrated_homepage_shortcode');
