
/**
 * Used to communicate with TFS
 * @return {[type]}
 */
var tfs = new function () {

	var timerId = 0;
	var hasUnreadItems = false;
	var errorCount = 0;
	
	/**
	 * Is the app online or offline
	 * @type {Boolean}
	 */
	this.isOnline = false;
	
	/**
	 * Array of notifications that have been generated. Will exist in array if
	 * the notifications are still active
	 * @type {Array}
	 */
	this.notifications = [];

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

		$.get(domain)
			.done(function(data) {
				errorCount = 0;
				showOnline("on");
				checkLatestFeed(data);
			})
			.fail(function () {
				errorCount++;
				
				if (errorCount == 10)
					tfs.stop(false);
				else
					showOffline("off");
			});

	};

	/**
	 * Starts the timer to load the feed
	 */
	this.start = function (byUser) {
		if (tfs.isOnline) {
			
			if (byUser)
 				preferences.set("active", true);

			tfs.load();

			timerId = window.setInterval(function () {
				if (tfs.isOnline) {
					tfs.load();
				}
			}, preferences.get("interval"));

		}
	};

	/**
	 * Stops the api runner
	 * @return {null}
	 */
	this.stop = function (byUser) {
 		window.clearInterval(timerId);
 		showOffline();

 		if (byUser)
 			preferences.set("active", false);
	};

	/**
	 * Show that the user has read any unread items
	 * @return {null}
	 */
	this.readItems = function () {
		hasUnreadItems = false;

		if (tfs.isOnline)
			showOnline();
		else
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
		tfs.isOnline = true;

		//only change the background if we don't have unread items
		if (!hasUnreadItems)
			chrome.browserAction.setBadgeBackgroundColor({ color: "#0f0" });	
	};

	/**
	 * Change the badge to indicate that the connection is live
	 */
	var showOffline = function () {
		chrome.browserAction.setBadgeText({text: "off"});
		tfs.isOnline = false;

		//only change the background if we don't have unread items
		if (!hasUnreadItems)
			chrome.browserAction.setBadgeBackgroundColor({ color: "#f00" });	
	};

	/**
	 * Change the badge to show that unread items are available
	 */
	var showUnreadItems = function () {
		chrome.browserAction.setBadgeBackgroundColor({ color: "#00f" });	
		hasUnreadItems = true;
	};

	/**
	 * Show a notification to users in the notification list
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
							message: checkIn.comment ? checkIn.comment : "No comment made",
							buttons: [
								{ title: "View changeset" }
							]
						};

						chrome.notifications.create("", options, function (notificationId) {
							var url = checkIn.url.replace("_apis/tfvc", "_versionControl").replace("changesets", "changeset");
							tfs.notifications[notificationId] = { changesetUrl: url };
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

/**
 * Listens for a button being clicked on a notification
 * @param  {string} notificationId ID of the notification the button was clicked on
 * @param  {integer} buttonIndex Index of the button that was clicked
 */
chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {

	var notification = tfs.notifications[notificationId];

	if (notification !== undefined) {
		//open a browser window to the url stored; notification.changesetUrl
		chrome.tabs.create({ url: notification.changesetUrl }, function(tab) {
		});
	}

});

/**
 * Listens for a notification being closed and removes it from the notification array
 */
chrome.notifications.onClosed.addListener(function (notificationId, byUser) {

	delete tfs.notifications[notificationId];	

});