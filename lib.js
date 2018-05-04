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

// create a proper DOM link
function createLink (url, text) {
	if (!text)
		text = url;
	
	var a = document.createElement ('a');
	a.appendChild (document.createTextNode (text));
	a.title = text;
	a.href = url;
	return a;
}

// inject supplemental information into a DOM element
// this will create proper links for recognised and allowed link contents
function injectSupplemental (node, supp) {
	while (node.firstChild)
		node.removeChild(node.firstChild);
	
	if (!supp.text)
		return;
	
	if (supp.links && supp.links.length > 0) {
		var text = [supp.text];
		for (var i = 0; i < supp.links.length; i++) {
			for (var j = 0; j < text.length; j++) {
				var idx = text[j].indexOf (supp.links[i]);
				if (idx >= 0) {
					text.splice (j, 1, text[j].substring (0, idx), text[j].substring (idx, idx + supp.links[i].length), text[j].substring (idx + supp.links[i].length));
					j = j + 1;
				}
			}
		}
		
		var found = false;
		for (var j = 0; j < text.length; j++) {
			found = false;
			for (var i = 0; i < supp.links.length; i++) {
				if (text[j].indexOf (supp.links[i]) === 0 && text[j].length == supp.links[i].length){
					if (text[j].indexOf ("extension's settings") === 0) {
						var settingslink = createLink ("", text[j]);
						settingslink.addEventListener(
							'click',
							function(se) {
								chrome.runtime.openOptionsPage();
							}
						);
						node.appendChild (settingslink);
					} else {
						node.appendChild (createLink (text[j]));
					}
					found = true;
				}
			}
			if (!found)
				node.appendChild (document.createTextNode (text[j]));
		}
		
	} else {
		node.appendChild (document.createTextNode (supp.text));
	}
	
}

// returns server url including tailing slash
function sanitiseApiUrl (url) {
	
	// strip common postfixes from the server url
	var endStripper = [
	'yourls-api.php',
	'admin/tools.php',
	'admin/index.php',
	'admin/plugins.php',
	'admin/',
	'admin',
	'readme.html',
	];
	
	for (var i = 0; i < endStripper.length; i++)
		if (url.endsWith (endStripper[i]))
			url = url.substr (0, url.length - endStripper[i].length);
	
	if (url.substr(-1) != '/')
		url += '/';
	
	return url;
}


var communicationErrorMsg = {
	text: "This seems like a serious bug!? Could you please file a bug report at https://github.com/binfalse/YOURLS-FirefoxExtension/issues/new and explain what you did? This would help improving the add-on.",
	links: ["https://github.com/binfalse/YOURLS-FirefoxExtension/issues/new"]
};
