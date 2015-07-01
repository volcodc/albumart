
var cVas = {
  imgCount: 50,
  coverAmt: testColumns * testRows,
  albumHeight: 100,
  albumWidth: 100,
  imgLoadCounter: 0,
  firstArray: [255,0,0],
  secondArray: [255,255,0],
  winWidth: (window.innerWidth > 0) ? window.innerWidth : screen.width,
  winHeight: (window.innerHeight > 0) ? window.innerHeight : screen.height
}

var testColumns = Math.floor(cVas.winWidth / cVas.albumWidth);
var testRows = Math.floor(cVas.winHeight / cVas.albumHeight);
var columnDiff = cVas.winWidth - (testColumns * cVas.albumWidth);
var columnExtension = columnDiff / testColumns;
var cubeWidth = Math.round(cVas.albumWidth + columnExtension);
var rowDiff = cVas.winHeight - (testRows * cVas.albumHeight);
var rowExtension = rowDiff / testRows;
var cubeHeight = Math.round(cVas.albumHeight + rowExtension);
var columns = Math.ceil(cVas.winWidth / cVas.albumWidth);
var rows = Math.ceil(cVas.winHeight / cVas.albumHeight);
cVas.coverAmt = testColumns * testRows;



var angularSpeed = 0.2; 
var lastTime = 0;
var initialX = ((cVas.winWidth / 2) - (cubeWidth / 2)) * -1;
var startX = initialX;
var startY = (cVas.winHeight / 2) - (cubeHeight / 2);
var currentAniID = 0;
var currentlyAnimating = false;
var firstTime = true;
var hasRun = false;

THREE.ImageLoader.prototype.load = function ( url, onLoad, onProgress, onError ) {

  var scope = this;
  var cached = THREE.Cache.get( url );
  if ( cached !== undefined ) {
    onLoad( cached );
    return;
  }
  var image = document.createElement( 'img' );
  image.addEventListener( 'load', function ( event ) {
    cVas.imgLoadCounter++;
    if(cVas.imgLoadCounter < cVas.coverAmt){
      var currentProgress = (cVas.imgLoadCounter / cVas.coverAmt) * 100;
      $('.progress-bar span').css('width', currentProgress + '%');
    }

    else if(cVas.imgLoadCounter == cVas.coverAmt){
      animate();
      $('.ajaxLoader').hide();
      $('.overlay').fadeOut('fast');
      window.testInterval = setInterval(addOverlay, 20);
    }
    THREE.Cache.add( url, this );
    if ( onLoad ) onLoad( this );
    scope.manager.itemEnd( url );
  }, false );
  if ( onProgress !== undefined ) {
    image.addEventListener( 'progress', function ( event ) {
      onProgress( event );
    }, false );
  }
  if ( onError !== undefined ) {
    image.addEventListener( 'error', function ( event ) {
      onError( event );
    }, false );
  }
  if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;
  image.src = url;
  scope.manager.itemStart( url );
  return image;
}
THREE.ImageUtils.crossOrigin = '';

function animate(){
  var currentCube = cubeArray[currentAniID];
  var currentReference = cubeReferenceArray[currentAniID];
  var time = (new Date()).getTime();
  if(firstTime){ lastTime = time; firstTime = false;}
  var timeDiff = time - lastTime;
  var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
  lastTime = time;
  

  if(currentCube.rotation.y >= 1.56 && currentReference === 0){
    currentCube.rotation.y = 1.56;
    cubeReferenceArray[currentAniID] = 1
    currentlyAnimating = false;
  }
  else if(currentCube.rotation.y >= 3.12 && currentReference === 1){
    currentCube.rotation.y = 3.12;
    cubeReferenceArray[currentAniID] = 2;
    currentlyAnimating = false;
  }
  else if(currentCube.rotation.y >= 4.68 && currentReference === 2){
    currentCube.rotation.y = 4.68;
    cubeReferenceArray[currentAniID] = 3;
    currentlyAnimating = false;
  }
  else if(currentCube.rotation.y >= 6.24 && currentReference === 3){
    currentCube.rotation.y = 0;
    cubeReferenceArray[currentAniID] = 0;
    currentlyAnimating = false;
  }
  else {
    cubeArray[currentAniID].rotation.y += angleChange;
  }
  if(!currentlyAnimating){
        currentlyAnimating = true;
        currentAniID = parseInt(Math.random() * cVas.coverAmt);
  }
  renderer.render(scene, camera);
  window.testMe = requestAnimationFrame(function(){
      animate();
  });
}

// renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(cVas.winWidth, cVas.winHeight);
$('.container').append(renderer.domElement);

// camera
var camera = new THREE.OrthographicCamera(-cVas.winWidth/2,cVas.winWidth/2,cVas.winHeight/2,-cVas.winHeight/2, -1000, 1000);

// scene
var scene = new THREE.Scene();


// add subtle ambient lighting
var ambientLight = new THREE.AmbientLight(0xbbbbbb);
scene.add(ambientLight);
//var testLight = new THREE.PointLight(0xff0000, 1, 100);
//testLight.position.set(0,0,1);
//scene.add(testLight);

// directional lighting
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

var cubeArray = [];
var cubeReferenceArray = [];

$(function(){

  $('#myCanvas').attr('width', cVas.winWidth).attr('height', cVas.winHeight);
  $('#myOverlay').attr('width', cVas.winWidth).attr('height', cVas.winHeight);

  var band = window.location.hash.split('#')[1];

  var feed = 'https://itunes.apple.com/search?term=' + band + '&media=music&entity=album';
  $.ajax({
    url: feed,
    dataType:'jsonp',
    jsonpCallback: 'testzorz'
  }).done(function(data){
    var results = data.results,
      counter = 0,
      amt = results.length,
      dupeAmt = Math.ceil(cVas.coverAmt/amt);

    if(dupeAmt > 1){
      results = replicateArray(results, dupeAmt);
    }
    var materialImgArray = [];
    for(var d = 0; d < amt; d++){
      materialImgArray.push(results[d].artworkUrl100);
    }
      
    for(var i = 0; i < testRows; i++){ //y
      for(var j = 0; j < testColumns; j++){ //x
       
        var materials = [];
        for(var k = 0; k < 6; k++){

          var randNum = parseInt(Math.random() * amt);
          var randMaterial = materialImgArray[randNum];
          var texture = THREE.ImageUtils.loadTexture(randMaterial);
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.LinearFilter;

          var material = new THREE.MeshLambertMaterial({
            map: texture
          });
          materials.push(material);
        }
        var cubeGeo = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeWidth, 1, 1, 1);
        var cube = new THREE.Mesh(cubeGeo, new THREE.MeshFaceMaterial(materials));
        cube.overdraw = true;
        cube.position.z = 0;
        cube.position.x = startX;
        cube.position.y = startY;
        scene.add(cube);
        cubeArray.push(cube);
        cubeReferenceArray.push(0);

        startX += cubeWidth;
        counter++;
      }
      startY -= cubeHeight;
      startX = initialX;
    }
    
  });

});

function updateArray(arr){
  if(arr[0] === 255){
    if(arr[1] === 255) arr[0]--; 
    else if((arr[1] > 0 && arr[1] < 255) || (arr[1] === 0 && arr[2] === 0) ) arr[1]++;
    else if(arr[2] < 255) arr[2]--;
    else arr[2]--;
  }
  else if(arr[0] < 255 && arr[0] > 0){
    if(arr[1] === 255) arr[0]--;
    else arr[0]++;
  }
  else if(arr[0] === 0){
    if(arr[1] === 255){ 
      if(arr[2] < 255 && arr[2] > 0)  arr[2]++;
      else if(arr[2] === 255) arr[1]--;
      else arr[2]++;
    }
    else if(arr[1] < 255 && arr[1] > 0){
      if(arr[2] === 255) arr[1]--;
      else arr[1]++;
    }
    else arr[0]++;
  }
}

function addOverlay(){
  updateArray(cVas.firstArray);
  updateArray(cVas.secondArray);
  
  var ctx = document.getElementById('myOverlay').getContext('2d');
  ctx.clearRect(0,0,cVas.winWidth,cVas.winHeight);

  var grd = ctx.createLinearGradient(0, 0, cVas.winWidth, 0);
  grd.addColorStop(0, "rgba(" + cVas.firstArray[0] + "," + cVas.firstArray[1] + "," + cVas.firstArray[2] + ",0.4)");
  grd.addColorStop(1, "rgba(" + cVas.secondArray[0] + "," + cVas.secondArray[1] + "," + cVas.firstArray[2] + ",0.4)");


  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, cVas.winWidth, cVas.winHeight);
  ctx.save();

}

function replicateArray(array, n) {
  var arrays = Array.apply(null, new Array(n));
  arrays = arrays.map(function() { return array });
  return [].concat.apply([], arrays);
}

      
