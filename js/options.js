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

function isInt (str)
{
	var n = ~~Number(str);
	return String(n) === str && n >= 0;
}
function RestoreOptions ()
{
	var url   = document.getElementById ('url');
	var secret = document.getElementById ('secret');
	var keyword = document.getElementById ('keyword');
	var wait = document.getElementById ('wait');
	
	if (typeof localStorage['yourls_url'] !== 'undefined')
		url.value   = localStorage['yourls_url'];
	if (typeof localStorage['yourls_secret'] !== 'undefined')
		secret.value = localStorage['yourls_secret'];
	if (typeof localStorage['yourls_keyword'] !== 'undefined')
		keyword.checked = localStorage['yourls_keyword'] === "true";
	if (typeof localStorage['yourls_wait'] !== 'undefined')
		wait.value = localStorage['yourls_wait'];
	
}
function SaveOptions (e)
{
	var url   = document.getElementById ('url');
	var secret = document.getElementById ('secret');
	var info  = document.getElementById ('info');
	var keyword = document.getElementById ('keyword');
	var wait = document.getElementById ('wait');
	
	localStorage['yourls_url'] = url.value;
	localStorage['yourls_secret'] = secret.value;
	localStorage['yourls_keyword'] = keyword.checked;
	if (isInt (wait.value))
		localStorage['yourls_wait'] = wait.value;
	
	info.innerHTML = "Settings saved!";
	
	setTimeout (function () { info.innerHTML = ''; }, 2500);
}

document.addEventListener('DOMContentLoaded', function ()
{
	RestoreOptions ();
	document.getElementById("save").addEventListener('click', SaveOptions); 
});