
/**
 * Used to communicate with TFS
 * @return {[type]}
 */
var tfs = new function () {

	var timerId = 0;

	/**
	 * Cache of the last feed to be retrieved
	 */
	this.data = null;

	/**
	 * Make a call to TFS online to get the latest changeset information
	 * @return {null}
	 */
	this.load = function() {

		var domain = preferences.get("domain");
		console.log("making api request from " + domain);

		$.get(domain)
			.done(function(data) {
				console.log(data);
				showOnline("on");
				checkLatestFeed(data);
			})
			.fail(function () {
				showOffline("off");
			});

	};

	/**
	 * Starts the timer to load the feed
	 */
	this.start = function () {
		tfs.load();

		window.setInterval(function () {
			tfs.load();
		}, preferences.get("interval"));
	};

	/**
	 * Stops the api runner
	 * @return {null}
	 */
	this.stop = function () {
 		window.clearInterval(timerId);
 		showOffline();
	};

	/**
	 * Checks the latest feed to see if any changesets have been made
	 * since the last check
	 * @param  {object} data Data returned from TFS
	 * @return {null}
	 */
	var checkLatestFeed = function (data) {
		var checkIn = data.value[0];
		if (checkIn.changesetId > preferences.get("changeset")) {
			showUnreadItems();
			showNotifications(checkIn);
		};

		//set the cache
		tfs.data = data;

		//update the preferences
		preferences.set("changeset", checkIn.changesetId);
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
	var showNotifications = function (checkIn) {
		
		//check to see if the latest checkin has been carried out by
		//someone in the notification users list
		var csvUsers = preferences.get("notificationUsers");
		if (csvUsers !== undefined || csvUsers !== "") {
			var users = csvUsers.split(',');
			var checkInName = checkIn.checkedInBy.displayName.toLowerCase();
			var match = contains(checkInName, users);

			if (match) {
				chrome.notifications.getPermissionLevel(function (level) {
					if (level == "granted"){
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
			}
		}
		
	};

	/**
	 * Allows checking if an item exists in a javascript object
	 * @param  {string} item  Item to check for
	 * @param  {object} obj Object to check in
	 * @return {bool} True if item exists, otherwise false
	 */
	function contains(item, obj) {
	    for (var i = 0; i < obj.length; i++) {
	        if (obj[i].trim() === item.trim()) {
	            return true;
	        }
	    }
	    return false;
	}
	
};