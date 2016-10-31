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
	chrome.runtime.sendMessage ({method: "log", message: "popup: " + text}, function (response) {});
}

function validURL (url)
{
	// just shorten urls that have a protocol and a domain
	return url.match (/^\S+\:\/\/[^\/]+\.\S+$/);
}

function shortLong (url)
{
	// long url? -> shorten it for display
	if (url.length > 45)
	{
		// remove http:// etc
		url = url.replace (/^\S+\:\/\//, "");
		// remove #anchor and ?key=value
		url = url.replace (/[#\?].+$/, "..")
		// remove everything between domain name and file name
		url = url.replace (/^([^\/]+)\/.*\/((?!\.\.)[^\/]+)(\/..)?$/,"$1/../$2$3");
		//url = splitURL (url);
	}
	// still too long?
	if (url.length > 45)
	{
		// replace some.sub.domain.tld with domain.tld
		url = url.replace (/^\S+\.([^.]+\.[^.]+)\//, "$1/");
		// replace verylongwords with very..words
		url = url.replace (/([^\/.]{5})[^\/.]{10,}([^\/.]{5})/g, "$1..$2");
		//url = reSplitURL (url);
	}
	return url;
}

function updateLong (str)
{
	var elem = document.getElementById ("___yourls_todo");
	if (!elem)
		return;
	elem.innerHTML=shortLong(str);
	elem.title=str;
}
function updateShort (str)
{
	var elem = document.getElementById ("___yourls_done");
	if (!elem)
		return;
	elem.innerHTML=str;
	elem.title=str;
}


function shorten (url)
{
	updateShort ("shortening...");
	
	var keyword;
	var keywordTF = document.getElementById("___yourls_key");
	if (keywordTF)
		keyword = keywordTF.value;
	
	logg ("popup sends message: shortenLink");
	chrome.runtime.sendMessage({method: "shortenLink", link: url, keyword: keyword}, function (response)
	{
		logg ("popup reveives message: shortenLink");
		updateShort (response.url);
		
		if (localStorage['yourls_qrcode']	== "true"){
			var createqrcode = new QRCode("qrcode", {
    			text: response.url,
    			width: 128,
    			height: 128,
    			colorDark : "#000000",
    			colorLight : "#ffffff",
    			correctLevel : QRCode.CorrectLevel.M
			});
			document.getElementById("qrcode").style.marginTop = '20px';	
		}	
		
		// select the short url -> ^c
		var range = document.createRange();
		range.selectNode(document.getElementById ("___yourls_done"));
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	});
}

function injectPage (url)
{
	var parent = document.getElementById ("___yourls_div");
	if (parent)
	{
		logg ("popup sends message: getHTML");
		chrome.runtime.sendMessage({method: "getHTML"}, function (response)
		{
			parent.innerHTML = response.data;
			
			// get url if we're in popup
			if (!url)
			{
				logg ("popup sends message: getSiteURL");
				chrome.runtime.sendMessage ({method: "getSiteURL"}, function (response)
				{
					url = response.url;
					logg ("got url: " + response.url);
					setup (url)
				});
			}
			else
				setup (url);
		});
	}
}
function setup (myURL)
{
	logg ("updated url: " + myURL);
	
	// is this url ok?
	if (!myURL || !validURL (myURL))
	{
		if (myURL)
			updateLong (myURL);
		else
			updateLong ("no url");
		updateShort ("won't shorten this url.");
		return;
	}
	
	// setup urls in form
	updateLong (myURL);
	updateShort ("loading...");
	
	// addSelection as default keyword if keyword-textfield
	var text = document.getElementById("___yourls_key"); 
	if (text && !document.getElementById("___yourls_body"))
			text.value = window.getSelection ().toString ();
	
	// add listener to keyword-button if it exists
	var keyBtn = document.getElementById("___yourls_shortenbtn");
	if (keyBtn)
	{
		updateShort ("waiting for keyword...");
		keyBtn.addEventListener("click", function ()
		{
			updateShort ("loading...");
			shorten (myURL);
		});
	}
	else
	{
		// if we're not waiting for a keyword let's shorten immediately
		shorten (myURL);
	}
}
function createOverlay (url)
{
	if (document.getElementById ("___yourls_overlay") || document.getElementById("___yourls_body"))
		return;
	
	var overlay = document.createElement ("div");
	overlay.id = "___yourls_overlay";
	var div = document.createElement ("div");
	div.id = "___yourls_div";
	overlay.appendChild (div);
	var input = document.createElement ("input");
	input.type = 'submit';
	input.value = 'close';
	input.addEventListener('click', function (e)
	{
		overlay.parentNode.removeChild(overlay);
	}); 
	overlay.appendChild (input);
	document.body.appendChild (overlay);
	injectPage (url);
}


document.addEventListener('DOMContentLoaded', function () {
	// issit the popup?
	if (document.getElementById("___yourls_body"))
	{
		injectPage ();
	}
});