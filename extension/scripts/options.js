window.addEventListener("load", function() {
	// Attempt to copy settings from localStorage to synced storage.
	copySettings();
	
	// Load OS styles and set up chrome:// links when the page loads.
	loadOSStyles();
	setUpChromeLinks();
	
	// Fetch all settings.
	chrome.storage.sync.get(defaultSettings, function(settings) {
		// For each setting,
		for(setting in settings) {
			var dropDown = document.getElementById(setting + "Setting");
			// Set its drop-down.
			dropDown.value = settings[setting];
			
			// Add an event listener to its drop-down.
			dropDown.addEventListener("change", function(e) {
				setSetting(e.target.id.replace("Setting", ""), e.target.value);
			}, false);
			
			// Enable its drop-down.
			dropDown.disabled = false;
		}
	});
	
	// Add reset button event listener.
	document.getElementById("resetButton").addEventListener("click", function(e) {
		if(confirm("Are you sure you want to reset all your settings?  This cannot be undone!")) {
			chrome.storage.sync.clear();
			location.reload();
		}
	});
	// Enable the reset button.
	document.getElementById("resetButton").disabled = false;
	
	// Create a speech recognition instance.
	var speechInput = new webkitSpeechRecognition();
	speechInput.continuous = false;
	speechInput.interimResults = false;
	// Add an event listener for when speech recognition starts successfully.
	speechInput.onstart = function(e) {
		// At this point, the omnibox media icon should be displayed.  There is
		// no need for speech recognition to continue, so abort it.
		e.target.abort();
	};
	// Attempt to start speech recognition (and, as a result, display the omnibox media icon).
	speechInput.start();
}, false);

function setSetting(setting, value) {
	var newSettingObj = {};
	newSettingObj[setting] = value;
	chrome.storage.sync.set(newSettingObj, function() {
		if(chrome.runtime.lastError) {
			alert("Something went wrong: " + chrome.runtime.lastError);
		}
	});
}

/**
 * Load the stylesheet that will pick the correct font for the user's OS
 */
function loadOSStyles() {
	var osStyle = document.createElement('link');
	osStyle.rel = 'stylesheet';
	osStyle.type = 'text/css';
	if(navigator.userAgent.indexOf('Windows') !== -1) {
		osStyle.href = 'styles/options-win.css';
	} else if(navigator.userAgent.indexOf('Macintosh') !== -1) {
		osStyle.href = 'styles/options-mac.css';
	} else if(navigator.userAgent.indexOf('CrOS') !== -1) {
		osStyle.href = 'styles/options-cros.css';
		// Change the “Chrome” label to “Chrome OS” on CrOS.
		document.querySelector('.sideBar h1').innerText = 'Chrome OS';
	} else {
		osStyle.href = 'styles/options-linux.css';
	}
	document.head.appendChild(osStyle);
}
/**
 * Change any chrome:// link to use the goToPage function
 */
function setUpChromeLinks() {
	// Get the list of <a>s.
	var links = document.getElementsByTagName('a');
	// For each link,
	for(var i = 0; i < links.length; i++) {
		// if the URL begins with �chrome://�,
		if(links[i].href.indexOf('chrome://') === 0) {
			// tell it to goToPage onclick.
			links[i].onclick = goToPage;
		}
	}
}
/**
 * Use chrome.tabs.update to open a link Chrome will not open normally
 */
function goToPage(e) {
	// Prevent the browser from following the link.
	e.preventDefault();
	chrome.tabs.update({ url: e.target.href });
}