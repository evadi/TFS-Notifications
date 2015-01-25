'use strict';

//chrome.storage.local.clear();
start();

/**
 * Starts the app running
 * @return {null}
 */
function start() {

	//load preferences and wait before starting the application
	preferences.load()
		.done(function () {
			//start the timer. Timer interval based on user preference
			tfs.start();
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
	tfs.stop();
	preferences.setAll(pref)
		.done(function () {
			tfs.start();
		});
}