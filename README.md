# Squirt

A mashup of [Spritz](http://spritzinc.com)'s ORP speed reading technique and the [Readability](http://www.readability.com) bookmarklet.

# Install

Create a bookmarklet with the following JavaScript:

```JavaScript
javascript:(function(){if(window.squirt){return document.dispatchEvent(new Event('squirt.again'));}var s=document.createElement('script');s.src='//rawgithub.com/cameron/squirt/master/squirt.js';document.body.appendChild(s)})()
```

### How to Install a Bookmarklet on a Mobile Browser

*Instructions are based on iOS Chrome/Safari, but should work elsewhere.*

- Open this page on your phone
- Copy the JavaScript above to your clipboard
- Bookmark the current page
- Open your bookmarks manager
  - In Chrome Mobile, bookmarks are accessible via the menu icon immediately to the right of the URL bar
  - On Safari Mobile, bookmarks are accessible via the book icon in the bottom toolbar
- Find the newly added bookmark, and tap edit
  - Chrome: top right (pencil icon)
  - Safari: bottom left ("Edit")
- Change the name to "Squirt"
- Clear the URL, and paste in the JavaScript, and save

That's it! In Chrome, to run the bookmarklet, tap the URL bar and clear the URL like you're going to navigate to another page. Instead, type the name of the bookmarklet, and tap it when it appears in the autocomplete list.
