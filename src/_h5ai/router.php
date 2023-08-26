<?php

// full path of requested file
$path = dirname(__DIR__) . preg_replace('/\?(.*)/', '', $_SERVER['REQUEST_URI']);

// h5ai is required when user request a directory
if(file_exists($path) && is_dir($path))
{
    // directory must not contain index.php or index.html
    if(file_exists("$path/index.php") == false && file_exists("$path/index.html") == false)
    {
        // script name must be "tweaked" to detect path
        $_SERVER['SCRIPT_NAME'] = '/_h5ai/public/index.php';

        include __DIR__ . "/public/index.php";
        exit;
    }
}

// CSS is sent with text/html content type, so we need to fix it
if($path == __DIR__ . '/public/css/styles.css')
{
    header('Content-Type: text/css');
}

// return resource "as-is"
return false;