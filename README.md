# Squirt

A mashup of [Spritz](http://spritzinc.com)'s ORP speed reading technique and the [Readability](http://www.readability.com) bookmarklet.

# Install

Create a bookmarklet with the following JavaScript:

```JavaScript
javascript:(function(){if(window.squirt){return document.dispatchEvent(new Event('squirt.again'));}var s=document.createElement('script');s.src='//rawgithub.com/cameron/squirt/master/squirt.js';document.body.appendChild(s)})()
```
