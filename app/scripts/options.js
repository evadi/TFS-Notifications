"use strict";

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
};

$(function () {

	var controller = chrome.extension.getBackgroundPage();

	$("#save").click(function (e) {
		e.preventDefault();

		var data = {};
		data.domain = "";
		data.interval = 0;
		data.notificationUsers = "";
		data.changeset = 0;
		data.active = controller.getPreferences().active;

		var domain = $("#domain").val();
		if (domain !== ""){
			domain += "/DefaultCollection/_apis/tfvc/changesets?api-version=1.0&$top=5&maxCommentLength=1000";
			data.domain = domain;
		}

		var interval = $("#interval").val();
		if (interval !== "") {
			data.interval = parseInt(interval) * 1000;
		}

		var notificationUsers = $("#notificationUsers").val();
		if (notificationUsers !== "") {
			data.notificationUsers = notificationUsers;
		}

		var changeset = $("#changeset").val();
		if (changeset !== "") {
			data.changeset = parseInt(changeset);
		}

		controller.updatePreferences(data);

		$("#saved").html("Saved");
		window.setTimeout(function () {
			$("#saved").html("");
		}, 5000);

	});

	/**
	 * Loads all preferences onto the page
	 */
	function loadOptions() {

		var preferences = controller.getPreferences();

		var domainParts = preferences.domain.split("/");
		var domain = String.format("{0}//{1}", domainParts[0], domainParts[2]);

		$("#domain").val(domain);
		$("#interval").val(preferences.interval / 1000);
		$("#notificationUsers").val(preferences.notificationUsers);
		$("#changeset").val(preferences.changeset);

	}

	//load options onto the page for editing
	loadOptions();

});