var container, stats;
var camera, scene, controls, renderer, objects;
var pointLight;
var roty;	
var sphere;
var materialP,geoP,particles, particleCount;		

init();
animate();

function init() {
        roty = 0;
        particleCount = 500;

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight,.01, 2000 );
        camera.position.set( 0, 0, 400 );

        controls = new THREE.OrbitControls( camera );
                                controls.damping = 0.2;
                                controls.addEventListener( 'change', render );

        scene = new THREE.Scene();

        //Sats
        geoP= new THREE.Geometry();
        for ( i = 0; i < particleCount; i ++ ) {

                                        var vertex = new THREE.Vector3();
                                        vertex.x = 500 * Math.random() - 250;
                                        vertex.y = 500 * Math.random() - 250;
                                        vertex.z = 500 * Math.random() - 250;

                                        geoP.vertices.push( vertex );

                                }

        materialP = new THREE.PointCloudMaterial( { size: 5, sizeAttenuation: false, alphaTest: 0.5, transparent: true } );
                materialP.color.setHSL( 1.0, 0.0, 1 );

                particlesP = new THREE.PointCloud( geoP, materialP );
                scene.add( particlesP );

        // Grid
        var size = 500, step = 100;

        var geometry = new THREE.SphereGeometry( 100, 48, 48 );
        var geometryClouds = new THREE.SphereGeometry( 101, 48, 48 );

        var material = new THREE.MeshPhongMaterial( {  map: THREE.ImageUtils.loadTexture( 'textures/earthmap1k.jpg' ) } );
        var materialClouds = new THREE.MeshPhongMaterial( {  map: THREE.ImageUtils.loadTexture( 'textures/earthcloudmap.jpg' )} );

        material.specularMap = THREE.ImageUtils.loadTexture('textures/earthspec1k.jpg');
        material.bumpMap = THREE.ImageUtils.loadTexture('textures/earthbump1k.jpg');

        materialClouds.transparent = true;
        materialClouds.alphaMap = THREE.ImageUtils.loadTexture('textures/earthcloudmaptransI.jpg');

        sphere = new THREE.Mesh( geometry, material);
        sphere.material.side = THREE.DoubleSide;
        scene.add( sphere );

        sphereClouds = new THREE.Mesh( geometryClouds, materialClouds);
        sphereClouds.material.side = THREE.DoubleSide;
        sphere.add( sphereClouds );

        // Lights
        scene.add( new THREE.AmbientLight( 1 * 0x202020 ) );
        var directionalLight = new THREE.DirectionalLight( 1 * 0xffffff );
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random() - 0.5;
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        scene.add( directionalLight );

        pointLight = new THREE.PointLight( 0xffffff, 1 );
        scene.add( pointLight );

        renderer = new THREE.WebGLRenderer({ antialias: true });
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

        roty+=.001;

        requestAnimationFrame( animate );
        sphere.rotation.y=roty;
        sphereClouds.rotation.y=roty*.5;
        render();
        controls.update();
}

function render() { 
        var timer = Date.now() * 0.0001;
        camera.lookAt( scene.position );
        pointLight.position.x = 0;
        pointLight.position.y = 0;
        pointLight.position.z = 0;
        renderer.render( scene, camera );
}
