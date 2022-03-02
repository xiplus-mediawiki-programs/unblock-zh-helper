mw.loader.load('http://localhost:3000/dist/style.css', 'text/css');
mw.loader.load('http://localhost:3000/dist/unblock-zh-helper.iife.js');

$('#firstHeading').text('unblock-zh-helper')
$('title').text('unblock-zh-helper')
$('#mw-content-text').html('<div id="app"></div>')

// mw.loader.load('http://localhost:3000/dist/load.js');
