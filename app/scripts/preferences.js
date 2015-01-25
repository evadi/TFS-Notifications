
/**
 * Used to store and retrieve user preferences
 * @return {object} preferences object
 */
var preferences = new function () {

	this.cache = {};

	/**
	 * Gets all the preferences from the cache object
	 * @return {object} All preferences
	 */
	this.getAll = function () {
		return preferences.cache;
	};

	/**
	 * Get a preference using a specified key name
	 * @param  {string} key Name of the preferences
	 * @return {object} Value of the preference
	 */
	this.get = function (key) {
		return preferences.cache[key];
	};

	/**
	 * Sets a preference using a key. If the key already exists it will 
	 * update the value
	 * @param {string} key Name of the preference
	 * @param {object} value Value to store as the preference
	 */
	this.set = function (value) {
		var def = $.Deferred();
		chrome.storage.local.set({ "preferences": value }, function () {
			preferences.cache = value;
			def.resolve();
		});

		return def.promise();
	};

	/**
	 * Loads all settings into cache to be easily accessed when needed
	 * @return {[type]}
	 */
	this.load = function () {
		var def = $.Deferred();

		chrome.storage.local.get("preferences", function (result) {
			if (result.preferences) {
				preferences.cache = result.preferences;
			}
			else {
				//return some defaults;
				var defaults = {
					domain: "https://orchidsoft.visualstudio.com/DefaultCollection/_apis/tfvc/changesets?api-version=1.0&$top=5",
					interval: "60",
					notificationUsers: "",
					changset: "0"
				};
				preferences.cache = defaults;
				preferences.set(defaults);
			}

			def.resolve();
		});

		return def.promise();
	};

};

/**
 * Listens for changes to preferences and saves them to the cache
 */
chrome.storage.onChanged.addListener(function (changes, namespace) {

	for (var key in changes) {
		preferences.cache[key] = changes[key].newValue;
	}

});