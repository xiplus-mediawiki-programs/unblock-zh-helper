/* eslint indent: ["error", "tab"] */
if (
	mw.config.get('wgCanonicalSpecialPageName') === 'Blankpage' &&
	/\/unblock-zh-helper$/.test(mw.config.get('wgPageName'))
) {
	$('#firstHeading').text('unblock-zh-helper');
	$('title').text('unblock-zh-helper');
	$('#mw-content-text').html('<div id="app"></div>');

	mw.loader.using(['ext.gadget.morebits', 'mediawiki.api', 'mediawiki.jqueryMsg'], function() {
		var api = new mw.Api();
		api.loadMessagesIfMissing(['antispoof-name-illegal']).then(function() {
			mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:Xiplus/js/unblock-zh-helper/style.css&action=raw&ctype=text/css', 'text/css');
			mw.loader.load('https://zh.wikipedia.org/w/index.php?title=User:Xiplus/js/unblock-zh-helper/unblock-zh-helper.iife.js&action=raw&ctype=text/javascript');
		});
	});
	mw.loader.load('ext.gadget.CollapsibleSidebar');
}
