var inboxMails = 0;
var gmailUrl = "https://mail.google.com/mail";
var feedUrl = gmailUrl + '/feed/atom';
var defaultInterval = 1000 * 60 * 10; /* ten minutes */

function updateInboxCount() {
	var barItems = safari.extension.toolbarItems;
	for (var i = 0; i < barItems.length; i++) {
		var item = barItems[i];
		item.badge = inboxMails;
		item.toolTip = 'GMail Inbox Checker (' + parseInt(inboxMails) + ' new mails)';
	}
}

function fetchInboxCount() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", feedUrl, true);
	xhr.onerror = function(evt) {
		// handle error
	}
	xhr.onreadystatechange = function(evt) {
		if (xhr.readyState != 4)
			return;
		var xml = xhr.responseXML;
		var count = xml.getElementsByTagName("fullcount")[0];
		inboxMails = parseInt(count.textContent);
		updateInboxCount();
	}
	xhr.send(null);
}

function setupChecker() {
	var interval = parseInt(safari.extension.settings['check-interval']);
	if (interval == undefined)
		interval = defaultInterval;
	interval = interval * 60 * 1000;
	if (document.checkInterval)
		window.clearInterval(document.checkInterval);
	document.checkInterval = window.setInterval(function(evt) {
		fetchInboxCount();
	}, interval);
}

safari.application.addEventListener("command", function(evt) {
	var tab = evt.target.browserWindow.openTab("foreground", undefined);
	tab.url = gmailUrl;
	tab.activate();
}, false);

safari.application.addEventListener("validate", function(evt) {
	updateInboxCount();
}, false);

safari.extension.settings.addEventListener("change", function(evt) {
	if (evt.key == "check-interval") {
		setupChecker();
	}
}, false);

setupChecker();
fetchInboxCount();
