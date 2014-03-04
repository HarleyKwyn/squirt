# Squirt

A mashup of [Spritz](http://spritzinc.com)'s ORP speed reading technique and the [Readability](http://www.readability.com) bookmarklet.

# Install

### Mobile

Create a bookmark and paste the following JavaScript into the URL field:

```JavaScript
javascript:(function(){ s = document.createElement('script'); s.src = '//raw.github.com/cameron/squirt/master/squirt.js'; document.body.appendChild(s); }()
```

### Desktop

Drag <a href="javascript:(function(){s = document.createElement('script'); s.src = '//raw.github.com/cameron/squirt/master/squirt.js'; document.body.appendChild(s);}()">Squirt</a> to your bookmark bar, navigate to an article you'd like to read, and click the bookmarklet.

# Roadmap

- progress bar / scrubber
- zomg: eye tracking + auto-pause on look-away
- total words read / total time display at end
