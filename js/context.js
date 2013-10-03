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
	chrome.runtime.sendMessage ({method: "log", message: "context: " + text}, function (response) {});
}

function shortenClick(info, tab)
{
	var inj = "\
	if (!document.getElementById ('___yourls_css'))\
	{\
		var css = document.createElement('link');\
		css.type = 'text/css';\
		css.rel = 'stylesheet';\
		css.id = '___yourls_css';\
		css.href = '"+chrome.extension.getURL('css/style.css')+"';\
		(document.head||document.documentElement).appendChild(css);\
	}\
	var s = document.createElement('script');\
	s.src='"+chrome.extension.getURL('js/popup.js')+"';\
	s.onload = function() {this.parentNode.removeChild(this);};\
	(document.head||document.documentElement).appendChild(s);\
	createOverlay('"+(info.linkUrl ? info.linkUrl : info.pageUrl)+"');";
	logg (inj);
	chrome.tabs.executeScript(null, {
		code:inj
	});
}

chrome.contextMenus.create({"title": "Shorten Link", "contexts":["link"], "onclick": shortenClick});
chrome.contextMenus.create({"title": "Shorten Page", "contexts":["selection"], "onclick": shortenClick});

