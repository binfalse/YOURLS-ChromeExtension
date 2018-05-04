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

(function _yourlsOptions () {
	
	
	
	var loadOptions = function(e) {
		
		
		
		chrome.storage.local.get(null, function _gotOptions(result) {
			document.querySelector('#api').value = result.api || '';
			document.querySelector('#signature').value = result.signature || '';
			document.querySelector('#maxwait').value = result.maxwait || '4';
			document.querySelector('#keyword').checked = result.keyword || false;
			document.querySelector('#copy').checked = result.copy || false;
		}
		);
	};
	var buttonClick = function(e) {
		if (e && e.target) {
			e.preventDefault();
			
			var msg_title = document.querySelector('#message_title');
			var msg_supp = document.querySelector('#message_supp');
			msg_title.textContent = "";
			while (msg_supp.firstChild)
				msg_supp.removeChild(msg_supp.firstChild);
			
			if (document.querySelector('#api').value.length &&
				document.querySelector('#signature').value.length) {
				
				var settings = {};
				['api', 'signature', 'maxwait'].forEach(function(sKey) {
					settings[sKey] = document.querySelector('#'+sKey).value.trim ();
				});
				settings['keyword'] = document.querySelector('#keyword').checked;
				settings['copy'] = document.querySelector('#copy').checked;
				
				settings['maxwait'] = parseInt(settings['maxwait']);
				if (!settings['maxwait'] || settings['maxwait'] < 1) {
					settings['maxwait'] = 5;
				}
				document.querySelector('#maxwait').value = settings['maxwait'];
				
				settings['api'] = sanitiseApiUrl (settings['api']);
				document.querySelector('#api').value = settings['api'];
				
				document.querySelector('#signature').value = settings['signature'];
				
				chrome.runtime.sendMessage({method: "version", settings: settings}, function (response)
				{
					if (!response.error) {
						msg_title.textContent = "Success!";
						if (settings['api'].indexOf ("https://") != 0) {
							msg_supp.textContent = "You're connected to a YOURLS version " + response.url + ". WARNING: As you are not using HTTPS, we are submitting all requests in plain text over the network - including your signature! Please consider to secure your YOURLS instance with proper encryption.";
						} else {
							msg_supp.textContent = "You're connected to a YOURLS version " + response.url;
						}
					} else {
						msg_title.textContent = response.error;
						if (response.supp) {
							injectSupplemental (msg_supp, response.supp);
						}
					}
				});
			
			} else {
				msg_title.textContent = 'Please provide a proper API URL and your signature.';
				msg_supp.textContent = 'The Server URL is the URL to the YOURLS web interface. The signature can be obtained from the "Tools" page of the YOURLS web interface.';
			}
		}
	};
	document.addEventListener('DOMContentLoaded', loadOptions);
	document.getElementById('button').addEventListener('click', buttonClick);
})();

