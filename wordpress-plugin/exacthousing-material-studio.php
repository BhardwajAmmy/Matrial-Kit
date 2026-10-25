<?php
/**
 * Plugin Name: ExactHousing Material Studio
 * Description: Interactive procedural 3D room configurator with independent material controls.
 * Version: 1.0.0
 * Author: ExactHousing
 */
if (!defined('ABSPATH')) { exit; }

function ehx_material_studio_shortcode() {
    static $instance = 0;
    $instance++;
    $base = plugin_dir_url(__FILE__);
    $template_path = plugin_dir_path(__FILE__) . 'assets/template.html';
    if (!file_exists($template_path)) {
        return '<p>ExactHousing Material Studio template is missing.</p>';
    }
    $markup = file_get_contents($template_path);
    if ($markup === false) {
        return '<p>ExactHousing Material Studio could not read its template.</p>';
    }
    $id = 'ehx-material-studio-' . $instance;
    $styles = '<link rel="stylesheet" href="' . esc_url($base . 'assets/studio.css') . '">';
    $import_map = '<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"}}</script>';
    $script = '<script type="module" src="' . esc_url($base . 'assets/studio.js') . '"></script>';
    $wrapper = '<div class="ehx-site" id="' . esc_attr($id) . '">' . $markup . '</div>';
    return $styles . $import_map . $wrapper . $script;
}
add_shortcode('exacthousing_studio', 'ehx_material_studio_shortcode');
