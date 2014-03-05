(function makeSquirt(read, makeGUI) {
  var map = Function.prototype.call.bind(Array.prototype.map);

  (function injectReadability() {
    // set readability globals
    readStyle = 'style-newspaper';
    readMargin = 'margin-medium';
    readSize = 'size-medium';

    var script = document.createElement('script');
    script.src = window.location.hostname == 'localhost' ?
      '/readability.js' :
      '//rawgithub.com/cameron/squirt/master/readability.js';
    document.head.appendChild(script);
  })();

  (function injectStyles() {
    var stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', '//rawgithub.com/cameron/squirt/master/squirt.css');
    stylesheet.setAttribute('type', 'text/css');
    document.head.appendChild(stylesheet);
  })();

  document.addEventListener('readability.got-article', function(e){
    var text = '';
    map(e.value.querySelector("#story").children, function(node) {
      if(node.tagName == 'P') text += node.textContent;
    });

    makeGUI();
    read(text);
  });

})((function makeRead(textToNodes) {
  return function read(text) {
    var nodes = textToNodes(text);
    var lastNode = null;

    var nodeIdx = 0;
    var incrememntNodeIdx = function(increment){
      var ret = nodeIdx;
      nodeIdx += increment || 1;
      nodeIdx = Math.max(0, nodeIdx % nodes.length);
      return ret;
    }
    var ms;
    var waitAfterComma = 2;
    var waitAfterPeriod = 3;
    var lastChar, delay;
    var container = document.querySelector('.word-center');
    var jumped = false;
    var postJumpDelay = 1;

    var wpm = function(wpm){
      ms = 60 * 1000 / wpm ;
    }
    wpm(document.querySelector('#wpm').value);

    // control events
    document.addEventListener('squirt.wpm', function(e){
      wpm(e.value);
    });

    document.addEventListener('squirt.jump-back', function(e){
      // Jump back by `e.value` seconds. Then walk back to the
      // beginning of the sentence.
      if(e.value == -1) nodeIdx = 0;
      else {
        incrememntNodeIdx(-Math.floor(e.value * 1000 / ms));
        while(nodes[nodeIdx].word.indexOf('.') == -1 && nodeIdx != 0){
          incrememntNodeIdx(-1);
        }
        nodeIdx != 0 && incrememntNodeIdx();
      }
    });

    setTimeout(function nextNode() {
      lastNode && container.removeChild(lastNode);
      lastNode = nodes[incrememntNodeIdx()];
      if(lastNode == null) debugger;
      container.appendChild(lastNode);
      lastNode.center();
      lastChar = lastNode.word[lastNode.word.length - 1];
      delay = lastChar == '.' ? waitAfterPeriod :
        lastChar == ',' ? waitAfterComma :
        lastChar == ':' ? waitAfterComma :
        jumped ? waitAfterPeriod : 1;
      jumped = false;
      if(lastNode.word == "Mr." || lastNode.word == "Mrs." || lastNode.word == "Ms.") delay = 1;
      setTimeout(nextNode, ms * delay)
    }, ms);
  };

})((function makeTextToNodes(wordToNode) {
  return function textToNodes(text) {
    return text.split(' ')
           .map(function(word){
             var words = word.split('.');
             if(words.length > 1) words[0] += '.';
             if(words.length > 1 && !words[1].length) words.pop();
             return words;
           })
           .reduce(function(left, right){
             return left.concat(right[0]);
           }, [])
           .map(wordToNode);
  };

})(function wordToNode(word) {
  var node = document.createElement('div');
  node.classList.add('word');
  var span;

  var centerOnCharIdx =
    word.length == 1 ? 0 :
    (word.length == 2 ? 1 :
    (word.length == 3 ? 1 :
    Math.floor(word.length / 2) - 1));

  word.split('').map(function(char, idx) {
    span = document.createElement('span');
    span.textContent = char;
    node.appendChild(span);
    if(idx == centerOnCharIdx) span.classList.add('orp');
  });

  node.center = function() {
    var centerOnSpan = node.children[centerOnCharIdx];
    var val = centerOnSpan.offsetLeft + (centerOnSpan.offsetWidth / 2);
    node.style.left = "-" + val + "px";
  }
  node.word = word;
  return node;

})), function makeGui(){
  var div = function(cls){
    var d = document.createElement('div');
    d.classList.add(cls);
    return d;
  };
  var squirtWin = div('squirt-window');
  var port = div('word-port');
  var indicator = div('focus-indicator');
  var container = div('word-center');
  var controls = div('controls');

  squirtWin.appendChild(port);
  port.appendChild(container);
  container.appendChild(indicator);
  squirtWin.appendChild(controls);
  document.body.appendChild(squirtWin);

  (function make(controls){

    (function makeWPMSelect(){
      var wpmSelect = document.createElement('select');
      for(var wpm = 200; wpm < 1050; wpm += 50){
        var opt = document.createElement('option');
        opt.value = wpm;
        opt.text = wpm;
        wpm == 400 && (opt.selected = true);
        wpmSelect.add(opt);
      };
      wpmSelect.setAttribute('id', 'wpm');
      wpmSelect.onchange = function(evt){
        var e = new Event("squirt.wpm");
        e.value = evt.target.value;
        document.dispatchEvent(e);
      };
      controls.appendChild(wpmSelect);

      (["You're reading at", "words per minute."]).map(function(txt, idx){
        var label = document.createElement('label');
        label.textContent = txt;
        controls[idx ? 'appendChild' : 'insertBefore'](label, wpmSelect);
      });
    })();


    (function makeJumpLinks(){
      var jumps = document.createElement('div');
      jumps.classList.add('jump-links');
      var label = document.createElement('label');
      label.textContent = 'Jump back: ';
      jumps.appendChild(label);
      ([["Beginning",-1],
        ["8s", 8],
        ["16s", 16],
        ["30s", 30]]).map(function(link){
          var a = document.createElement('a');
          a.href = '#';
          a.onclick = function(){
            var e = new Event('squirt.jump-back');
            e.value = link[1];
            document.dispatchEvent(e);
          };
          a.textContent = link[0];
          jumps.appendChild(a);
        });
      controls.appendChild(jumps);
    })();
  })(controls);
});
