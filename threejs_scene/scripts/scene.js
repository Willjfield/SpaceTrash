var container, stats;
var camera, scene, renderer, objects;
var pointLight;
var roty;	
var sphere;		

init();
animate();

function init() {
        roty = 0;

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.position.set( 0, 0, 400 );

        scene = new THREE.Scene();

        // Grid
        var size = 500, step = 100;
        var geometry = new THREE.SphereGeometry( 100, 48, 48 );
        var material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/earthmap1k.jpg' ) } );
        sphere = new THREE.Mesh( geometry, material);
        sphere.material.side = THREE.DoubleSide;
        scene.add( sphere );

        // Lights
        scene.add( new THREE.AmbientLight( Math.random() * 0x202020 ) );
        var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random() - 0.5;
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene.add( directionalLight );

        pointLight = new THREE.PointLight( 0xffffff, 1 );
        scene.add( pointLight );

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        var debugCanvas = document.createElement( 'canvas' );
        debugCanvas.width = 512;
        debugCanvas.height = 512;
        debugCanvas.style.position = 'absolute';
        debugCanvas.style.top = '0px';
        debugCanvas.style.left = '0px';

        container.appendChild( debugCanvas );

        debugContext = debugCanvas.getContext( '2d' );
        debugContext.setTransform( 1, 0, 0, 1, 256, 256 );
        debugContext.strokeStyle = '#000000';

        window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
}

function loadImage( path ) {
        var image = document.createElement( 'img' );
        var texture = new THREE.Texture( image, THREE.UVMapping )
        image.onload = function () { texture.needsUpdate = true; };
        image.src = path;
        return texture;
}

function animate() {
        roty+=.01;
        requestAnimationFrame( animate );
        sphere.rotation.y=roty;
        render();
}

function render() { 
        var timer = Date.now() * 0.0001;
        camera.lookAt( scene.position );
        pointLight.position.x = 0;
        pointLight.position.y = 0;
        pointLight.position.z = 0;
        renderer.render( scene, camera );
}
