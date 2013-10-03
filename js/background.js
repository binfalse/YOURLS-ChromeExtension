/*
 * Copyright 2013  Martin Scharm
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

function logg (text)
{
	loggg ("backgorund: " + text);
}

function loggg (text)
{
	//console.log (text);
}

function copyToClipboard (text)
{
	var views = chrome.extension.getViews();
	for (var i = 0; i < views.length; i++)
	{
		var view = views[i];
		var copyDiv = view.document.createElement('div');
		view.document.body.appendChild(copyDiv);
		copyDiv.innerText = text;
		copyDiv.unselectable = "off";
		copyDiv.focus();
		
		var range = view.document.createRange();
		range.selectNode(copyDiv);
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		
		logg ("div: " + copyDiv.innerHTML + " -- " + selection.toString ());
		view.document.execCommand("Copy", false, null);
		view.document.body.removeChild(copyDiv);
		logg ("copied");
		break;
	}
}

function shortenLink (url, keyword, sendResponse)
{
	var storedUrl = localStorage['yourls_url'];
	var storedSecret = localStorage['yourls_secret'];
	var maxwait = localStorage['yourls_wait'];
	
	if (!storedUrl || storedUrl.length < 3)
	{
		logg ("background sends message: shortenResult");
		chrome.tabs.getSelected(null, function(tab) {
			chrome.runtime.sendMessage({method : "shortenResult", shortenedUrl : "No API URL. Please update settings."}, function(response) {});
		});
		return;
	}
	
	if (storedUrl.substr (-1) != '/')
		storedUrl += '/';
	storedUrl += "yourls-api.php";
	
	var params = "action=shorturl&format=simple&url=" + encodeURIComponent (url) + "&signature=" + encodeURIComponent (storedSecret);
	
	if (keyword && keyword.length > 0)
		params += "&keyword=" + encodeURIComponent (keyword);
	
	if (!maxwait || maxwait < 1)
		maxwait = 2;
	maxwait *= 1000;
	
	var request = new XMLHttpRequest ();
	request.open ("POST", storedUrl, true);
	request.setRequestHeader ("Content-type", "application/x-www-form-urlencoded");
	
	var requestTimer = setTimeout (function () {
		request.abort ();
		logg ("background sends message: shortenResult");
		chrome.tabs.getSelected(null, function(tab) {
			chrome.runtime.sendMessage({method : "shortenResult", shortenedUrl : "Did not get an answer from server!"}, function(response) {});
		});
		return;
	}, maxwait);
	request.onreadystatechange = function ()
	{
		if (request.readyState != 4)
			return;
		clearTimeout (requestTimer);
		
		var result;
		if ((request.status == 200 || request.status == 201) && request.responseText.match(/^\s*\S+\s*$/))
		{
			copyToClipboard (request.responseText);
			result = request.responseText;
		}
		else if ((request.status == 200 || request.status == 201) && request.responseText.match(/^\s*$/))
		{
			result = "Failed. Maybe chosen key already in use!?";
		}
		else
		{
			result = "Failed. Do not understand the response from API!";
		}
		logg ("background sends message: shortenResult");
		sendResponse ({url : result});
	}
	request.send (params);
}


chrome.runtime.onMessage.addListener (function(request, sender, sendResponse)
{
	if (request.method == "getHTML")
	{
		sendResponse ({data: "<div class='___yourls_todo'><code id='___yourls_todo'></code></div>"
		+ (localStorage['yourls_keyword'] === "true" ? 
		"<div id='___yourls_keyword'><small>key word  :</small> <input type='text' id='___yourls_key' size='20'/> <input type='submit' id='___yourls_shortenbtn' value='shorten' /></div>" : "")
		+ "<div class='___yourls_done'><small>shortened :</small> <code id='___yourls_done'></code></div>"});
		return true;
	}
	else if (request.method == "shortenLink")
	{
		shortenLink (request.link, request.keyword, sendResponse);
		return true;
	}
	else if (request.method == "log")
	{
		loggg (request.message);
		sendResponse ({});
		return true;
	}
	else if (request.method == "getSiteURL")
	{
		chrome.tabs.getSelected(null, function(tab)
		{
			sendResponse ({url : tab.url});
		});
		return true;
	}
	else if (request.method == "getSelectionInTab" || request.method == "getSelection")
	{
		var sel = window.getSelection ().toString ();
		loggg ("selection in background: " + sel);
		sendResponse ({data: window.getSelection ().toString ()});
		return true;
	}
	return false;
});

