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

(function _yourlsExtension() {
	
	var updateSource = function(msg) {
		var target = document.getElementById('source_url');
		while (target.firstChild)
			target.removeChild(target.firstChild);
		target.appendChild(document.createTextNode(msg));
	};
	
	var updateResult = function(msg, placeholder, docopy) {
		var element = document.getElementById('result_url');
		if (element) {
			element.value = msg;
			element.placeholder = placeholder;
			if (docopy) {
				element.select();
				document.execCommand('copy');
			}
		}
	};
	
	var updateError = function(error, errsupp) {
		var title = document.getElementById('message_title');
		var supp = document.getElementById('message_supp');
		title.textContent = error;
		supp.textContent = "";
		if (errsupp)
			injectSupplemental (supp, errsupp);
	};
	
	
	var shorten = function (settings, long_url, keyword) {
		var options = {
			action: 'shorturl',
			format: 'simple',
			url: long_url,
			signature: settings.signature
		};
		
		if (keyword && keyword.length > 1)
			options.keyword = keyword;
		
		updateResult("", 'Contacting server...');
		
		chrome.runtime.sendMessage({method: "shortenLink", url: long_url, keyword: keyword}, function (response)
		{
			if (response.url) {
				updateResult (response.url, "", settings.copy);
			}
			if (response.error) {
				updateError (response.error, response.supp);
			}
		});
	}
	
	var _gotSettings = function(settings) {
		if (settings.api && settings.signature) {
			var _haveTab = function(tabs) {
				
				chrome.runtime.sendMessage({method: "getLinkTarget"}, function (response) {
					var long_url = tabs[0].url;
					if (response.linkTarget) {
						long_url = response.linkTarget;
					}
					updateSource(long_url);
					
					document.getElementById('admin').addEventListener(
						'click',
						function(se) {
							window.open(settings.api + "admin/");
						}
					);
					
					
					if (settings.keyword) {
						chrome.runtime.sendMessage({method: "getSelection"}, function (response) {
							document.getElementById('keyword').value = response.selection;
						});
						
						updateResult("", "Waiting for keyword...");
						document.getElementById('keyword_submit').addEventListener(
							'click',
							function(se) {
								shorten (settings, long_url, document.getElementById('keyword').value);
							}
						);
					} else {
						var keywordrow = document.getElementById('keyword_row');
						keywordrow.parentNode.removeChild(keywordrow);
						updateResult("", "Working...");
						shorten (settings, long_url);
					}
					
				});
			};
			var _tabQueryError = function(error) {
				updateSource('Cannot get current tab URL!');
				updateResult('Error:' + error.message, "");
			};
			chrome.tabs.query({active: true, currentWindow: true}, _haveTab);//, _tabQueryError);
		} else {
			updateSource('Extension not configured');
			updateResult('Go to chrome://extensions/ or click "settings"', "");
		}
	};
	var _optionsError = function(err) {
		updateSource('Options not set');
		updateResult(err.message);
	}
	
	document.getElementById('result_url').addEventListener(
		'select',
		function(se) {
			document.execCommand('Copy');
		}
	);
	
	document.getElementById('result_copy').addEventListener(
		'click',
		function(se) {
			document.getElementById('result_url').select();
			document.execCommand('copy');
		}
	);
	
	
	
	
	document.getElementById('settings').addEventListener(
		'click',
		function(se) {
			chrome.runtime.openOptionsPage();
		}
	);
	
	chrome.storage.local.get(null, _gotSettings);
})();



