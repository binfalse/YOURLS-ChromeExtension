# YOURLS extension for Chromium

This is an extension for Chromium (Google's web browser) to interact with the open source URL shortener [Yourls](http://yourls.org/).

## Installation

The extension is available from Googles [web store](https://chrome.google.com/webstore/detail/yourls/nddaaiojgkoldnhnmkoldmkeocbooken).
To install the latest dev version just clone this repository and load this extension *unpacked* ([read more at Googles dev get-started-guide](http://developer.chrome.com/extensions/getstarted.html#unpacked))

Before you can start shortening URLs you need to do some configuration. To open the configuration page right-click the icon next to your address bar and choose *Options*, or open `chrome://extensions/` and click the *Options* link of the YOURLS entry. You'll see a page similar to the following image:

![Screenshot of the options page](http://binfalse.de/wp-content/uploads/2013/10/yourls-chrome-options.png)

* **API URL:** Specify the URL to your YOURLS instance. Don't forget the leading `http://`. For those of you familiar with YOURLS: **don't** include `yourls-api.php`, I'll take care of it ;)
* **Signature:** the signature is the secret for your YOURLS account, so you don't have to give anyone your credentials. You'll find the signature token of your account in the admin interface of your YOURLS installation.
* **How many seconds to wait for an answer?**: when you try to shorten a URL the extension will send an `XMLHTTPRequest` to the webserver running the YOURLS instance. Depending on the performance of network and webserver it may take some time to get an answer. Configure the max time to wait before the extension assumes that the request failed. In this case you'll get an error message.
* **Ask for a keyword:** check this box to provide a keyword for shortening. If it is checked you'll get a text field before the URL is sent to the webserver, otherwise the extensions shortens the URL immediately.

If the form is filled correctly save your settings and give it a try!

## Usage

The extension provides two different ways for interaction:

### The Icon in the Toolbar

Click the icon to shorten the URL of the web site you're currently visiting and a popup will appear. If you've configured the extension to ask for a keyword the popup will contain a textfield and a button. Just type the keyword into the field and press the button to start shortening. In case you didn't set the *Ask for a keyword* tick, the extension will shorten the URL immediately.

![The popup produced by the extension](http://binfalse.de/wp-content/uploads/2013/10/yourls-chrome-popup.png)


### The Context Menu

If you right-click a link on a page an entry in your context menu will appear saying *"Shorten Link"*. Klick this item to shorten the target of this link instead the URL of the current page.  
Furthermore, if you right-click selected text in the current page the extension adds a context menu entry *"Shorten Page"* to shorten the page using the selected text as keyword. (The selection will just appear in the textfield for the keyword, you still have to press the button to start shortening.)  
If you right-click a link while some other text is selected, the selected text will be used as keyword for shortening the link target.

![The resulting overlay after clicking the context menu](http://binfalse.de/wp-content/uploads/2013/10/yourls-chrome-rightclick.png)

### Last Words

Do not hesitate to contact me if you have questions or encounter any bugs. You will find some contact information at the [official page of this extension](http://binfalse.de/software/browser-extensions/yourls-chrome-extension/) and on my [website](http://binfalse.de/contact/).

## License
    Copyright 2013  Martin Scharm
    
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

