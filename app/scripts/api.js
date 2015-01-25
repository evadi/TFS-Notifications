
/**
 * Used to communicate with TFS
 * @return {[type]}
 */
var tfs = new function () {

	this.data = {};

	/**
	 * Make a call to TFS online to get the latest changeset information
	 * @return {null}
	 */
	this.load = function() {

		var domain = preferences.get("domain");
		console.log("making api request from " + domain);

		$.get(domain)
			.done(function(data) {
				tfs.data = data;
				console.log(data);
				showOnline("on");
				checkLatestFeed(data);
			})
			.fail(function () {
				showOffline("off");
			});

	};

	/**
	 * Stops the api runner
	 * @return {null}
	 */
	this.stop = function () {

	};

	/**
	 * Checks the latest feed to see if any changesets have been made
	 * since the last check
	 * @param  {object} data Data returned from TFS
	 * @return {null}
	 */
	var checkLatestFeed = function (data) {
		showUnreadItems();
		showNotification(data);
	};

	/**
	 * Change the badge to indicate that the connection is live
	 */
	var showOnline = function () {
		chrome.browserAction.setBadgeText({text: "on"});
		chrome.browserAction.setBadgeBackgroundColor({ color: "#0f0" });	
	};

	/**
	 * Change the badge to indicate that the connection is live
	 */
	var showOffline = function () {
		chrome.browserAction.setBadgeText({text: "off"});
		chrome.browserAction.setBadgeBackgroundColor({ color: "#f00" });	
	};

	/**
	 * Change the badge to show that unread items are available
	 */
	var showUnreadItems = function () {
		chrome.browserAction.setBadgeText({text: "chk"});
		chrome.browserAction.setBadgeBackgroundColor({ color: "#00f" });	
	};

	/**
	 * Show a notification
	 */
	var showNotification = function (data) {
		
		chrome.notifications.getPermissionLevel(function (level) {
			if (level == "granted"){
				var checkIn = data.value[1];
				var options = {
					type: "basic",
					iconUrl: checkIn.checkedInBy.imageUrl,
					title: "Check-in by " + checkIn.checkedInBy.displayName,
					message: checkIn.comment ? checkIn.comment : "No comment made"
				};

				chrome.notifications.create("", options, function () {

				});		
			}
		});
		
	};
	
};