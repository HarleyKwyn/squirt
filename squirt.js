(function makeSquirt(read, makeGUI) {
  var map = Function.prototype.call.bind(Array.prototype.map);

  (function injectReadability() {
    // set readability globals
    readStyle = 'style-newspaper';
    readMargin = 'margin-medium';
    readSize = 'size-medium';

    var script = document.createElement('script');
    script.src = "https://raw.github.com/MHordecki/readability-redux/master/readability/readability.js";
    document.head.appendChild(script);
  })();

  (function injectStyles() {
    var stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', '//rawgithub.com/cameron/8dbe4de7a677581ff074/raw/squirt.css');
    stylesheet.setAttribute('type', 'text/css');
    document.head.appendChild(stylesheet);
  })();

  (function waitForReadability() {
    if(!document.getElementById('readabilityBody')){
      setTimeout(waitForReadability, 100);
      return;
    }
    var container = document.getElementById('story');
    var text = '';

    // re-enable after readability disables
    map(document.styleSheets, function(sheet){
      if(sheet.href.indexOf('squirt.css') != -1) sheet.disabled = false;
    });

    map(container.children, function(node) {
      if(node.tagName == 'P') text += node.textContent;
    });

    makeGUI();
    read(text);
  })();

})((function makeRead(textToNodes) {

  return function read(text) {
    var nodes = textToNodes(text);
    var lastNode = null;

    var currentNode = 0;
    var ms;
    var waitAfterComma = 2;
    var waitAfterPeriod = 3;
    var lastChar, delay;
    var container = document.querySelector('.word-port');
    var wpm = function(wpm){
      ms = 60 * 1000 / wpm ;
    }
    wpm(document.querySelector('#wpm').value);
    document.addEventListener('squirt.wpm', function(e){
      wpm(e.value);
    });

    setTimeout(function nextNode() {
      lastNode && container.removeChild(lastNode);
      lastNode = nodes[currentNode++ % nodes.length];
      container.appendChild(lastNode);
      lastNode.center();
      lastChar = lastNode.word[lastNode.word.length - 1];
      delay = lastChar == '.' ? waitAfterPeriod :
        lastChar == ',' ? waitAfterComma :
        lastChar == ':' ? waitAfterComma : 1;
      if(lastNode.word == "Mr." || lastNode.word == "Mrs." || lastNode.word == "Ms.") delay = 1;
      setTimeout(nextNode, ms * delay)
    }, ms);
  };

})((function makeTextToNodes(wordToNode) {

  return function textToNodes(text) {
    return text.split(' ').map(function(word){
      return wordToNode(word);
    });
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
  var container = div('word-port');
  var controls = div('controls');

  squirtWin.appendChild(container);
  squirtWin.appendChild(controls);
  document.body.appendChild(squirtWin);

  (function make(controls){
    var wpmSelect = document.createElement('select');
    for(var wpm = 200; wpm < 1050; wpm += 50){
      var opt = document.createElement('option');
      opt.value = wpm;
      opt.text = wpm + " wpm";
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
  })(controls);
});