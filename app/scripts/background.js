'use strict';

//chrome.storage.local.clear();
start();

/**
 * Starts the app running
 * @return {null}
 */
function start() {
	//perform a stop for good measure
	tfs.stop();

	//load preferences and wait before starting the application
	preferences.load()
		.done(function () {
			//set the online setting based on the active preference
			tfs.isOnline = preferences.get("active");

			//start the timer. Timer interval based on user preference
			tfs.start(false);
		});

}

/**
 * Gets the preferences from the preference manager
 * @return {object} All preferences
 */
function getPreferences() {
	return preferences.getAll();
};

/**
 * Used by the options page to save preferences set by the user
 * @param  {object} preferences Object containing preferences
 * @return {null}
 */
function updatePreferences(pref) {
	tfs.stop(false);
	preferences.setAll(pref)
		.done(function () {
			tfs.start(false);
		});
}