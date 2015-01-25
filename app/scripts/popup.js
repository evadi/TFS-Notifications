'use strict';

/**
 * Extend String object to include a format options
 * @return {string} Formatted string
 */
String.format = function() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {       
    var reg = new RegExp("\\{" + i + "\\}", "gm");             
    s = s.replace(reg, arguments[i + 1]);
  }

  return s;
}

$(function () {

	var controller = chrome.extension.getBackgroundPage();

	loadCheckin();

	/**
	 * Loads all preferences onto the page
	 */
	function loadCheckin() {

		var tfs = controller.tfs;
		var checkin = tfs.data.value[0];

		var checkinDate = new Date(checkin.createdDate);

		var displayDate = String.format("{0} @{1}", 
			checkinDate.toDateString(), 
			checkinDate.toLocaleTimeString());

		$("#user-photo").attr("src", checkin.checkedInBy.imageUrl)
		$("#user-name").html(checkin.checkedInBy.displayName);
		$("#checkin-date").html(displayDate);
		$("#checkin-comment").html(checkin.comment);

		$(".checkin").show();

	}

});
