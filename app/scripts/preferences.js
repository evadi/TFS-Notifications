
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
		return preferences.cache.preferences;
	};

	/**
	 * Get a preference using a specified key name
	 * @param  {string} key Name of the preferences
	 * @return {object} Value of the preference
	 */
	this.get = function (key) {
		return preferences.cache.preferences[key];
	};

	/**
	 * Sets all preferences
	 * @param {object} value All preferences
	 */
	this.setAll = function (value) {
		var def = $.Deferred();
		var data = {};
		data["preferences"] = value;
		chrome.storage.sync.set(data, function () {
			preferences.cache = data;
			def.resolve();
		});

		return def.promise();
	};

	/**
	 * Sets a preference using a key
	 * @param {string} key Name of the preference
	 * @param {object} value Value to store as the preference
	 */
	this.set = function (key, value) {
		var all = this.getAll();
		all[key] = value;
		return this.setAll(all);
	};

	/**
	 * Loads all settings into cache to be easily accessed when needed
	 * @return {[type]}
	 */
	this.load = function () {
		var def = $.Deferred();

		chrome.storage.sync.get("preferences", function (result) {
			if (result.preferences) {
				preferences.cache = result;
			}
			else {
				//return some defaults;
				var defaults = {
					domain: "https://orchidsoft.visualstudio.com/DefaultCollection/_apis/tfvc/changesets?api-version=1.0&$top=5&maxCommentLength=1000",
					interval: 60000,
					notificationUsers: "",
					changeset: 0,
					active: true
				};
				preferences.cache.preferences = defaults;
				preferences.setAll(defaults);
			}

			def.resolve();
		});

		return def.promise();
	};

};