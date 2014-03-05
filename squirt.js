var squirt = {};
(function(){
  (function makeSquirt(read, makeGUI) {
    var host = window.location.hostname == 'localhost' ? '/' :
      '//rawgithub.com/cameron/squirt/master/';

    makeEl('link', {
      rel: 'stylesheet',
      href: host + 'squirt.css',
      type: 'text/css'
    }, document.head);

    document.addEventListener('squirt.again', function(){
      startSquirt();
    });

    makeGUI();
    function startSquirt(){
      showGUI();
      var selection = window.getSelection();
      if(selection.type == 'Range') {
        return read((function getSelectedText(){
          var container = document.createElement("div");
          for (var i = 0, len = selection.rangeCount; i < len; ++i) {
            container.appendChild(selection.getRangeAt(i).cloneContents());
          }
          return container.textContent;
        })());
      }
      function readabilize(){
        read(readability.grabArticle().textContent);
      }
      if(!window.readability){
        makeEl('script', {
          src: host + 'readability.js'
        }, document.head);
        return document.addEventListener('readability.ready', readabilize);
      }
      readabilize();
    };
    startSquirt();
  })(makeRead(makeTextToNodes(wordToNode)), makeGUI);

  function makeRead(textToNodes) {
    return function read(text) {
      var nodes = textToNodes(text);
      var lastNode = null;

      var nodeIdx = 0;
      var incrememntNodeIdx = function(increment){
        var ret = nodeIdx;
        nodeIdx += increment || 1;
        nodeIdx = Math.max(0, nodeIdx);
        return ret;
      }
      var ms, timeoutId;
      var waitAfterComma = 2;
      var waitAfterPeriod = 3;
      var lastChar, delay;
      var container = document.querySelector('.word-center');
      map(container.children, function(child){
        child.classList.contains('word') && child.remove();
      });
      var jumped = false;
      var postJumpDelay = 1;

      var wpm = function(wpm){
        ms = 60 * 1000 / wpm ;
      }
      wpm(document.querySelector('#wpm').value);

      document.addEventListener('squirt.close', function(){
        clearTimeout(timeoutId);
      });

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

      timeoutId = setTimeout(function nextNode() {
        lastNode && container.removeChild(lastNode);
        var nextIdx = incrememntNodeIdx();
        if(nextIdx >= nodes.length) return;
        lastNode = nodes[nextIdx];
        container.appendChild(lastNode);
        lastNode.center();
        lastChar = lastNode.word[lastNode.word.length - 1];
        delay = lastChar == '.' ? waitAfterPeriod :
          lastChar == ',' ? waitAfterComma :
          lastChar == ':' ? waitAfterComma :
          jumped ? waitAfterPeriod : 1;
        jumped = false;
        if(lastNode.word == "Mr." || lastNode.word == "Mrs." || lastNode.word == "Ms.") delay = 1;
        timeoutId = setTimeout(nextNode, ms * delay)
      }, ms);
    };

  };

  function makeTextToNodes(wordToNode) {
    return function textToNodes(text) {
      return text.replace('\n', ' ').split(' ')
      // handle "...end of one.Next sentence..."
      // due to using textContent to extract -- does not add newlines
             .map(function(word){
               var words = word.split('.');
               if(words.length > 1) words[0] += '.';
               if(words.length > 1 && !words[1].length) words.pop();
               return words;
             })
             .reduce(function(left, right){
               return left.concat(right[0]);
             }, [])
             .filter(function(word){ return word.length; })
             .map(wordToNode);
    };
  }

  function wordToNode(word) {
    var node = makeDiv({'class': 'word'});
    var span;

    var centerOnCharIdx =
      word.length == 1 ? 0 :
      (word.length == 2 ? 1 :
          (word.length == 3 ? 1 :
              Math.floor(word.length / 2) - 1));

    word.split('').map(function(char, idx) {
      span = makeEl('span', {}, node);
      span.textContent = char;
      if(idx == centerOnCharIdx) span.classList.add('orp');
    });

    node.center = function() {
      var centerOnSpan = node.children[centerOnCharIdx];
      var val = centerOnSpan.offsetLeft + (centerOnSpan.offsetWidth / 2);
      node.style.left = "-" + val + "px";
    }
    node.word = word;
    return node;

  };

  function showGUI(){
    blur();
    document.getElementById('squirt').style.display = 'block';
  };

  function hideGUI(){
    unblur();
    document.getElementById('squirt').style.display = 'none';
  };

  function blur(){
    map(document.body.children, function(node){
      if(node.id != 'squirt')
        node.classList.add('squirt-blur');
    });
  };

  function unblur(){
    map(document.body.children, function(node){
      node.classList.remove('squirt-blur');
    });
  }

  function makeGUI(){

    var squirt = makeDiv({id: 'squirt'}, document.body);
    squirt.style.display = 'none';
    document.addEventListener('squirt.close', hideGUI);

    var obscure = makeDiv({class: 'obscure'}, squirt);
    obscure.onclick = function(){
      document.dispatchEvent(new Event('squirt.close'));
    };

    var squirtWin = makeDiv({'class': 'squirt-modal'}, squirt);
    var port = makeDiv({'class': 'word-port'}, squirtWin);
    var container = makeDiv({'class': 'word-center'}, port);
    var indicator = makeDiv({'class': 'focus-indicator'}, container);
    var controls = makeDiv({'class':'controls'}, squirtWin);

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
            a.onclick = function(clickEvt){
              var e = new Event('squirt.jump-back');
              e.value = link[1];
              document.dispatchEvent(e);
              clickEvt.preventDefault();
            };
            a.textContent = link[0];
            jumps.appendChild(a);
          });
        controls.appendChild(jumps);
      })();
    })(controls);
  };

  // utilites
  function map(listLike, f){
    return Array.prototype.map.call(listLike, f);
  }

  function makeEl(type, attrs, parent) {
    var el = document.createElement(type);
    for(var k in attrs){
      if(!attrs.hasOwnProperty(k)) continue;
      el.setAttribute(k, attrs[k]);
    }
    parent && parent.appendChild(el);
    return el;
  };

  function makeDiv(attrs, parent){
    return makeEl('div', attrs, parent);
  };
})();