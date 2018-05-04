/*
 * Copyright 2013-2018  Martin Scharm <https://binfalse.de/contact/>
 * 
 * This file is part of the YOURLS-ChromeExtension.
 * https://github.com/binfalse/YOURLS-ChromeExtension
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

chrome.contextMenus.create({
	id: "yourls",
	title: "Shorten URL",
	contexts: ["all"]
});



function getSelectionText() {
	var text = "";
	if (window.getSelection) {
		text = window.getSelection().toString();
	} else if (document.selection && document.selection.type != "Control") {
		text = document.selection.createRange().text;
	}
	return text;
}


chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "yourls") {
		chrome.browserAction.openPopup();
	}
});



chrome.runtime.onMessage.addListener (function(request, sender, sendResponse)
{
	if (request.method == "shortenLink")
	{
		chrome.storage.local.get(null, function(settings) {
			
			var options = {
				action: 'shorturl',
				format: 'simple',
				url: request.url,
				signature: settings.signature
			};
			if (request.keyword)
				options.keyword = request.keyword;
			
			
			YOURLS (settings, options).then(function(result) {
				sendResponse (result);
			}, function(error) {
				sendResponse (error);
			});
		});
		
		return true;
	}
	else if (request.method == "getSelectionInTab" || request.method == "getSelection")
	{
		chrome.tabs.executeScript({
			code: '(' + getSelectionText.toString() + ')()'
		}, function (results) {
			if (Array.isArray (results) && results.length == 1)
				sendResponse ({selection: results[0]});
			else
				sendResponse ({selection: ""});
		});
		return true;
	}
	else if (request.method == "version")
	{
		var settings = request.settings;
		YOURLS(settings,
					 {
						 action: 'version',
				 signature: settings.signature,
					 },
				 '^.*<version>(\\d+\\.\\d+.*)<\\/version>.*$'
		).then(function(result) {
			chrome.storage.local.set(settings, function (){
				sendResponse (result);});
		}, function(error) {
			sendResponse (error);
		});
		return true;
	}
	
	return false;
});







function YOURLS(settings, options, expected) {
	
	var stripHtml = function (str) {
		var div = document.createElement("div");
		div.innerHTML = str;
		return div.textContent || div.innerText || "";
	}
	
	var expMatchString = expected || '^\\s*(\\S+)\\s*$';
	
	
	apiURLwSlash = settings.api;
	if (apiURLwSlash.substr(-1) != '/')
		apiURLwSlash += '/';
	var apiURL = apiURLwSlash + 'yourls-api.php';
	
	
	
	var qParams = '';
	for (var k in options) {
		if (options.hasOwnProperty(k)) {
			if (qParams.length) qParams += '&';
			qParams += k + '=' + encodeURIComponent(options[k]);
		}
	}
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		var rqTimer = setTimeout(
			function() {
				xhr.abort();
				reject({error: 'Request timed out'});
			}, (parseInt(settings.maxwait) || 5) * 1000
		);
		
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				clearTimeout(rqTimer);
				if ((xhr.status == 200) || (xhr.status == 201)) {
					var uMatch = xhr.responseText.match (new RegExp(expMatchString));
					if (uMatch) {
						resolve ({url: uMatch[1], originalRespons: xhr.responseText});
					} else {
						reject ({
							error: 'Invalid response from Server: ' + stripHtml (xhr.responseText),
							supp: {
								text: "Are you using an outdated YOURLS version?",
								links: []
							}
						});
					}
				} else {
					var err = {
						error: "Error: Server returned status " + xhr.status + " (" + stripHtml (xhr.statusText) + ")",
						supp: {
							text: "",
							links: []
						}
					};
					
					switch (xhr.status)
					{
						case 403:
							err.supp.text = "Seems like you are not allowed to access the API. Did you provide a correct signature? Please verify at " + apiURLwSlash + "admin/tools.php and double check the signature token in the extension's settings.";
							err.supp.links.push (apiURLwSlash + "admin/tools.php");
							err.supp.links.push ("extension's settings");
							break;
							
						case 404:
							err.supp.text = "Seems like we cannot find an YOURLS API at " + apiURL + "? Did you provide the correct Server URL? Please verify your settings. You should be able to access the admin interface at " + apiURLwSlash + "admin!? Do not append 'yourls-api.php' as we will do that! Double check the Server URL token in the extension's settings.";
							err.supp.links.push (apiURLwSlash + "admin");
							err.supp.links.push (apiURL);
							err.supp.links.push ("extension's settings");
							break;
							
						case 400:
							err.supp.text = "Is that a proper URL? YOURLS won't shorten URLs such as 'about:addons' etc. If you think this is an error please report the issue at https://github.com/binfalse/YOURLS-FirefoxExtension/issues and explain what you did.";
							err.supp.links.push ("https://github.com/binfalse/YOURLS-FirefoxExtension/issues");
							break;
							
						case 0:
							err.supp.text = "Experienced a general connection issue... Maybe your SSL certificate is not valid? Your server is down? You provided an illegal Server URL? Please verify your extension's settings and make sure that you can access the admin interface at " + apiURLwSlash + "admin. If you need further help open a new ticket at https://github.com/binfalse/YOURLS-FirefoxExtension/issues and explain what you did.";
							err.supp.links.push (apiURLwSlash + "admin");
							err.supp.links.push ("https://github.com/binfalse/YOURLS-FirefoxExtension/issues");
							err.supp.links.push ("extension's settings");
							break;
					}
					
					reject (err);
				}
			}
		};
		
		xhr.open('POST', apiURL, true);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.send(qParams);
	});
}






