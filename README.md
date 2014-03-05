# Squirt

A mashup of [Spritz](http://spritzinc.com)'s ORP speed reading technique and the [Readability](http://www.readability.com) bookmarklet.

# Install

Create a bookmarklet with the following JavaScript:

```JavaScript
javascript:(function(){if(window.squirt){return document.dispatchEvent(new Event('squirt.again'));}var s=document.createElement('script');s.src='//rawgithub.com/cameron/squirt/master/squirt.js';document.body.appendChild(s)})()
```

# Roadmap

- progress bar / scrubber
- zomg: eye tracking + auto-pause on look-away
- total words read / total time display at end
- red letter
- pause button
- single 10s back button
- page obscuration (w/blur?)
- mobile
- selection
