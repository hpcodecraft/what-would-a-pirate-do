var RENDER_MODE_WEBGL = 'webgl',
    RENDER_MODE_SPRITE = 'sprite',
    animationFrameRequest,
    render_mode = RENDER_MODE_SPRITE;

function setRenderMode(mode) {
  localStorage.wwapd_render_mode = mode;
  location.reload();
}

function hasWebGl() {
  var gl,
      canvas = document.createElement('canvas');

  try { gl = canvas.getContext("webgl"); }
  catch (x) { gl = null; }

  if(gl === null) {
    try { gl = canvas.getContext("experimental-webgl"); }
    catch (x) { gl = null; }
  }

  return gl === null ? false : true;
}

$(function() {

  if(hasWebGl()) render_mode = RENDER_MODE_WEBGL;
  if(localStorage.wwapd_render_mode) render_mode = localStorage.wwapd_render_mode;
  else localStorage.wwapd_render_mode = render_mode;

  var actions = [
    'swab the deck',
    'bury the booty',
    'guzzle grog',
    'plunder a sloop',
    'keelhaul a scurvy dog',
    'sing a chantey',
    'obtain a parrot',
    'loot and pillage',
  ];

  var initialized       = false,
      frame             = 0,
      stage             = $('#stage'),
      slots             = 8, // the number of fields on the wheel
      deg               = 1,
      coronaDeg         = 1,
      imgBackground,
      imgWheel,
      imgPointer,
      imgEyeGlow,
      imgFlameCorona,
      imgFlame,
      proton, // webgl only
      renderer, // webgl only
      emitter, // webgl only
      TO_RAD            = Math.PI/180,
      hit               = false,
      spinEnd           = 0,
      spinning          = false,
      flameFrame        = 0,
      images = [
        'img/background.png', 'img/wheel.png', 'img/pointer.png', 'img/eyeglow.png', 'img/flamecorona.png',
        'img/flame/Feuer_01_00000.png', 'img/flame/Feuer_01_00001.png', 'img/flame/Feuer_01_00002.png',
        'img/flame/Feuer_01_00003.png', 'img/flame/Feuer_01_00004.png', 'img/flame/Feuer_01_00005.png',
        'img/flame/Feuer_01_00006.png', 'img/flame/Feuer_01_00007.png', 'img/flame/Feuer_01_00008.png',
        'img/flame/Feuer_01_00009.png', 'img/flame/Feuer_01_00010.png', 'img/flame/Feuer_01_00011.png',
        'img/flame/Feuer_01_00012.png', 'img/flame/Feuer_01_00013.png', 'img/flame/Feuer_01_00014.png',
        'img/flame/Feuer_01_00015.png', 'img/flame/Feuer_01_00016.png', 'img/flame/Feuer_01_00017.png',
        'img/flame/Feuer_01_00018.png', 'img/flame/Feuer_01_00019.png', 'img/flame/Feuer_01_00020.png',
        'img/flame/Feuer_01_00021.png', 'img/flame/Feuer_01_00022.png'
      ];

  function renderFrame() {

    if(render_mode == RENDER_MODE_WEBGL) { drawFlameWebGl(); }
    else { drawFlameSprite(); }

    drawFlameCorona();

    if( spinning ) {
      if( Math.ceil(deg) < spinEnd ) rotate();
      else {
        drawResult();
        deg = 1;
        spinning = false;
      }
    }

    frame++;
    animationFrameRequest = requestAnimationFrame(renderFrame);
  }

  function resize() {
    $('#site-title').css('line-height', ($('header').height()*1.1)+'px' );
    $('footer').css('line-height', $('footer').height()+'px' );

    $('canvas').attr('width', stage.width() );
    $('canvas').attr('height', stage.height() );

    if( initialized ) { drawImageSprites(); }
  }

  function drawImageSprites() {
    drawBackground();
    drawWheel();
    drawPointer();
    if( hit ) drawResult();
  }

  function spin() {
    if( spinning ) return false;

    var canvas = document.getElementById('effects'),
        c      = canvas.getContext('2d');

    c.clearRect(0,0,canvas.width,canvas.height);

    var min = 0,
        max = 360,
        end,
        prespins = 2;

    spinning = true;
    end = Math.floor(Math.random() * (max - min + 1) + min);
    spinEnd = (prespins*360) + end - (end % (360/slots));

    var hitNo = Math.floor( end/(360/slots) );
    hit = actions[hitNo];
  }

  function init(images) {
    stage.click(spin);
    $(window).resize(resize).resize();
    $('#webgl').change(function() {
      var mode = $(this).prop('checked') ? 'webgl' : 'sprite';
      setRenderMode(mode);
    });

    imgBackground   = images[0];
    imgWheel        = images[1];
    imgPointer      = images[2];
    imgEyeGlow      = images[3];
    imgFlameCorona  = images[4];
    imgFlame        = images.slice(5);
    initialized = true;
    if(render_mode == RENDER_MODE_WEBGL) {
      createProton();
      $('#webgl').prop('checked', true);
    }
    drawImageSprites();
    renderFrame();
  }

  function rotate() {

    var easeOut = function(t, d) {
      return -1 *(t/=d)*(t-2) + 0;
    };

    var ease = +(easeOut(deg, spinEnd) * (spinEnd/deg) - 1).toFixed(2);
    var alpha = ease*2;
    if( ease > 0.5 ) alpha = (-ease+1)*2;

    drawWheel();
    drawEyeGlow(alpha);

    var rotateBy = Math.ceil(((360/slots)*ease)/4);
    rotateBy = (rotateBy<1)?1:rotateBy;
    deg += rotateBy;
  }

  function drawBackground() {

    var scale   = 1,
        canvas  = document.getElementById('background'),
        c       = canvas.getContext('2d'),
        s       = canvas.height/imgBackground.height,
        x       = canvas.width/2,
        y       = canvas.height*(1-scale),
        w       = imgBackground.width*s,
        h       = canvas.height;

    w*=scale;
    h*=scale;
    x-=w/2;

    c.drawImage( imgBackground, x, y, w, h );
  }

  function drawWheel() {
    var canvas  = document.getElementById('wheel'),
        c       = canvas.getContext('2d'),
        x       = canvas.width/2,
        y       = canvas.height/2,
        r       = canvas.height*0.9;

    c.clearRect(0,0,canvas.width,canvas.height);
    c.save();
    c.translate(x, y);
    c.rotate(deg * TO_RAD);
    c.drawImage( imgWheel, -(r/2), -(r/2), r, r );
    c.restore();
  }

  function drawPointer() {
    var canvas  = document.getElementById('pointer'),
        c       = canvas.getContext('2d'),
        r       = canvas.height*0.9,
        x       = canvas.width/2,
        y       = canvas.height/2,
        w       = r/4,
        h       = r*1.3;

    x-= w/2;
    y-= h*0.2;

    c.drawImage( imgPointer, x, y, w, h );
  }


  function drawEyeGlow( alpha ) {

    var canvas  = document.getElementById('effects'),
        c       = canvas.getContext('2d'),
        r       = canvas.height*0.9,
        x       = canvas.width/2,
        y       = canvas.height/2,
        w       = r/4,
        h       = r*0.1;

    x-= w/2;
    y-= h*0.23;

    c.clearRect(0,0,canvas.width,canvas.height);
    c.globalAlpha = alpha;
    c.drawImage( imgEyeGlow, x, y, w, h );
  }

  // draws the image sprite flame
  function drawFlameSprite() {
    var canvas  = document.getElementById('flame'),
        c       = canvas.getContext('2d'),
        r       = canvas.height*0.9,
        x       = canvas.width/2,
        y       = canvas.height/2,
        w       = r/22,
        h       = r/12;
        if( flameFrame == imgFlame.length ) flameFrame = 0;

    x-= w/2;
    y-= h*3.7;

    c.globalAlpha = 0.95;

    c.clearRect(0,0,canvas.width,canvas.height);
    c.drawImage( imgFlame[flameFrame], x, y, w, h );

    if( frame%3 === 0 ) flameFrame++;
  }

  // webgl init
  function createProton() {
    proton = new Proton();

    var canvas  = document.getElementById('flame');
    createImageEmitter(canvas);

    renderer = new Proton.Renderer('webgl', proton, canvas);
    renderer.blendFunc("SRC_ALPHA", "ONE");
    renderer.start();
  }

  // webgl particle emitter init
  function createImageEmitter(canvas) {

    var w = canvas.width,
        h = canvas.height,
        size = h/200,
        radius = size*1.25;



    emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.01, .015));
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Life(0.5, 1));
    emitter.addInitialize(new Proton.ImageTarget(['img/particle-2.png'], size));
    emitter.addInitialize(new Proton.Radius(radius));
    emitter.addInitialize(new Proton.V(new Proton.Span(1, 3), 0, 'polar'));
    emitter.addBehaviour(new Proton.Alpha(0.5, 0));

    //emitter.addBehaviour(new Proton.Color('#4F1500', '#0029FF'));
    emitter.addBehaviour(new Proton.Color('#ff4400', '#7627d7'));
    emitter.addBehaviour(new Proton.Scale(1, 0));
    emitter.addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, h*0.23, w, h*0.28), 'dead'));
    emitter.emit();
    proton.addEmitter(emitter);
  }

  // draws the webgl flame
  function drawFlameWebGl() {

    var canvas  = document.getElementById('flame'),
        x       = canvas.width*0.5,
        y       = canvas.height*0.28;

    emitter.p.x = x;
    emitter.p.y = y;

    proton.update();
  }

  function drawFlameCorona() {
    var canvas  = document.getElementById('flame-corona'),
        c       = canvas.getContext('2d'),
        r       = canvas.height*0.5,
        x       = canvas.width/2,
        y       = canvas.height/2,
        w       = r/2,
        h       = r/2;

    y-= h*0.95;

    c.clearRect(0,0,canvas.width,canvas.height);
    c.save();
    c.translate(x, y);
    c.rotate(coronaDeg * TO_RAD);
    c.drawImage( imgFlameCorona, -(r/2), -(r/2), r, r );
    c.restore();

    coronaDeg+=2;
  }

  function drawResult() {

    var canvas  = document.getElementById('effects'),
        c       = canvas.getContext('2d'),
        x       = canvas.width/2,
        y       = (canvas.height/2); //+(canvas.height*0.02);

    var lineHeight = canvas.height*0.2,
        maxWidth = canvas.width*0.9;

    c.globalAlpha   = 1;
    c.font          = 'normal '+(lineHeight*0.9)+'px "Trade Winds", cursive, serif';

    c.textAlign     = "center";
    c.textBaseline  = "middle";
    c.strokeStyle   = '#000';
    c.lineWidth     = 10;

    c.shadowColor = "#f00";
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 0;
    c.shadowBlur = 150;

    c.fillStyle = "rgba(0,0,0,0.5)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = '#e6e6e6';
    c.shadowColor = "#000";
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 0;
    c.shadowBlur = 15;

    var lineCount = wrapText(c, hit, x, y, maxWidth, lineHeight, true);
    y-= ((lineCount-1)/2)*lineHeight;
    wrapText(c, hit, x, y, maxWidth, lineHeight, false);
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight, dryRun) {
    var dry = dryRun || false;
    var words = text.split(' ');
    var lineArr = new Array(words.shift());
    var lineText = '';
    var lineCount = 1;

    function draw(t) {
      context.strokeText(t, x, y);
      context.fillText(t, x, y);
    }

    while(words.length > 0 ) {

      var word = words.shift();
      lineArr.push(word);

      var testWidth = context.measureText(lineArr.join(' ')).width;
      if( testWidth > maxWidth ) {

        var nextWord = lineArr.pop();
        if(!dry) draw(lineArr.join(' '));
        lineArr = new Array(nextWord);

        y += lineHeight;
        lineCount++;
      }

    }

    if(!dry) draw(lineArr.join(' '));
    return lineCount;
  }

  // from https://gist.github.com/eikes/3925183
  function imgpreload( imgs, callback ) {
    "use strict";
    var loaded = 0;
    var images = [];
    imgs = Object.prototype.toString.apply( imgs ) === '[object Array]' ? imgs : [imgs];
    var inc = function() {
      loaded += 1;
      if ( loaded === imgs.length && callback ) {
        callback( images );
      }
    };
    for ( var i = 0; i < imgs.length; i++ ) {
      images[i] = new Image();
      images[i].onabort = inc;
      images[i].onerror = inc;
      images[i].onload = inc;
      images[i].src = imgs[i];
    }
  }

  // start the app
  imgpreload(images, init);
});
