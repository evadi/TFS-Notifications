'use strict';

$(function () {

	var controller = chrome.extension.getBackgroundPage();

	loadCheckin();

	/**
	 * Loads all preferences onto the page
	 */
	function loadCheckin() {

		var tfs = controller.tfs;
		//var checkin = tfs.data.value[0];

		// $("#title").val(checkin.checkedInBy.displayName);
		// $("#message").val(checkin.comment);

	}

});
