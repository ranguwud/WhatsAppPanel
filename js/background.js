/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Declare variables
var messageStore = {};


// Remove response headers that prevent embedding in a frame
browser.webRequest.onHeadersReceived.addListener(removeResponseHeaders, {"urls": ["*://*.web.whatsapp.com/*"]}, ["blocking", "responseHeaders"]);
// Set frame class name.
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("background-iframe").className = browser.extension.getURL("").split("/")[2];
}, false);

// Add event listeners
window.addEventListener("message", receiveMessages, false);


// Remove response headers that prevent embedding in a frame
function removeResponseHeaders(details) {
    if (details.tabId > -1)
        return;
    var headers = details.responseHeaders;
    var indices = new Array();
    for (var i = 0; i < headers.length; ++i) {
        var name = headers[i].name.toLowerCase();
        if (name === 'x-frame-options' || name === 'frame-options') {
            indices.push(i);
        }
    }
    for (var i = indices.length - 1; i >= 0; --i) {
        headers.splice(indices[i], 1);
    }
    return {"responseHeaders": headers};
}

// Receive messages from inject.js
function receiveMessages(event) {
    if (event.origin !== "https://web.whatsapp.com")
        return;
    var message = JSON.parse(event.data);
    
    if ("badge" in message) {
        browser.browserAction.setBadgeText({text: message["badge"]});
    }
    if ("debug" in message) {
        console.log("DEBUG:", message["debug"]);
    }
}

// React to opening popup
function popupOpened() {
    browser.browserAction.setBadgeText({text: ""});
    document.getElementById("background-iframe").src = "about:blank";
}

// React to closing popup
function popupClosed() {
    document.getElementById("background-iframe").src = "https://web.whatsapp.com/";
}
