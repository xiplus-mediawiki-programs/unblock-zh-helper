/* eslint indent: ["error", "tab"] */
if (
	mw.config.get('wgCanonicalSpecialPageName') === 'Blankpage' &&
	/\/unblock-zh-helper$/.test(mw.config.get('wgPageName'))
) {
	$('#firstHeading').text('unblock-zh-helper');
	$('title').text('unblock-zh-helper');
	$('#mw-content-text').html('<div id="app"></div>');

	mw.loader.using(['ext.gadget.site-lib', 'ext.gadget.morebits', 'mediawiki.api', 'mediawiki.jqueryMsg'], function () {
		var api = new mw.Api();
		api.loadMessagesIfMissing(['antispoof-name-illegal']).then(function () {
			mw.loader.load('http://localhost:3000/dist/style.css', 'text/css');
			mw.loader.load('http://localhost:3000/dist/unblock-zh-helper.iife.js');
		});
	});
}

/*

Usage:

mw.loader.load('http://localhost:3000/dist/load-local.js');

*/
