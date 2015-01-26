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
	var tfs = controller.tfs;
	var onlineToggle = $("#toggleOnline");

	loadCheckin();
	setOnlineToggle();
	tfs.readItems();

	$("#changeset").click(function (e) {
		e.preventDefault();

		var url = $(e.currentTarget).attr("href");
		chrome.tabs.create({ url: url }, function(tab) {
		});

	});

	onlineToggle.click(function (e) {
		e.preventDefault();

		if (tfs.isOnline) {
			tfs.stop(true);
			setOnlineToggle();
		}
		else {
			tfs.isOnline = true;
			tfs.start(true);
			setOnlineToggle();
		}

	});

	function setOnlineToggle() {
		if (tfs.isOnline) {
			onlineToggle.html("Go offline");
		}
		else {
			onlineToggle.html("Go online");	
		}
	}

	/**
	 * Loads all preferences onto the page
	 */
	function loadCheckin() {

		if (tfs.data !== null) {
			var checkin = tfs.data.value[0];

			var checkinDate = new Date(checkin.createdDate);

			var displayDate = String.format("{0} @{1}", 
				checkinDate.toDateString(), 
				checkinDate.toLocaleTimeString());

			$("#user-photo").attr("src", checkin.checkedInBy.imageUrl)
			$("#user-name").html(checkin.checkedInBy.displayName);
			$("#checkin-date").html(displayDate);
			$("#checkin-comment").html(checkin.comment);
			$("#changeset").attr("href", checkin.url.replace("_apis/tfvc", "_versionControl"));

			$(".checkin").show();
		}
		else {
			//no tfs data is available
			$(".no-data").show();
		}

	}

});
