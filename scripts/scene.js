var container, stats;
var camera, scene, controls, renderer, objects;
var pointLight;
var roty;	
var sphere, skybox;
var materialP,particles, particleCount;

init();
animate();

function init() {
    init_tle(function() {
        roty = 0;

        //console.log(tle_data[1]);

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight,.01, 4000 );
        camera.position.set( 0, 0, 400 );

        controls = new THREE.OrbitControls( camera );
                                controls.damping = 0.2;
                                controls.addEventListener( 'change', render );

        scene = new THREE.Scene();

        createSats();

        // Grid
        var size = 500, step = 100;

        var geometry = new THREE.SphereGeometry( 100, 48, 48 );
        var geometryClouds = new THREE.SphereGeometry( 103, 48, 48 );
        var geometryBG = new THREE.SphereGeometry( 2000, 48, 48 );

        var material = new THREE.MeshPhongMaterial( {  map: THREE.ImageUtils.loadTexture( 'textures/earthmap4k.jpg' ) } );
        var materialClouds = new THREE.MeshPhongMaterial( {  map: THREE.ImageUtils.loadTexture( 'textures/earthcloudmap.jpg' )} );
        var materialBG = new THREE.MeshLambertMaterial( {  map: THREE.ImageUtils.loadTexture( 'textures/Panorama.jpg' ), color: 0x333333, emmisive: 0x666666} );

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

        skybox = new THREE.Mesh( geometryBG, materialBG);
        skybox.material.side = THREE.DoubleSide;
        scene.add( skybox );

        // Lights
        scene.add( new THREE.AmbientLight( 1 * 0x202020 ) );
        var directionalLight = new THREE.DirectionalLight( 1 * 0xffffff );
        directionalLight.position.x = 0.5;
        directionalLight.position.y = 0.5;
        directionalLight.position.z = 0.5;
        directionalLight.position.normalize();
        scene.add( directionalLight );

        pointLight = new THREE.PointLight( 0xffffff, 1 );
        scene.add( pointLight );

        renderer = new THREE.WebGLRenderer({ antialias: true, autoClear: true });
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
    });
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
    setTimeout(function() {
        requestAnimationFrame( animate );
        tle_update();

        roty+=0.00000243*speedupFactor;

        sphere.rotation.y=roty;
        sphereClouds.rotation.y=roty*.5;
        createSats();
    }, 1000/30);
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

function createSats(){ 

                var geoP= new THREE.Geometry({ verticesNeedUpdate: true});
                var geoC= new THREE.Geometry({ verticesNeedUpdate: true});

                var satVelocity = [];

                for ( i = 0; i < tle_data.length; i ++ ) {

                                                var vertex = new THREE.Vector3();

                                                vertex.x = tle_data[i].satellite_x*.0156;
                                                vertex.y = tle_data[i].satellite_z*.0156;
                                                vertex.z = tle_data[i].satellite_y*.0156;

                                                geoP.vertices.push( vertex );

                                                var velocity = new THREE.Vector3();

                                                velocity.x = tle_data[i].velocity_x;
                                                velocity.y = tle_data[i].velocity_y;
                                                velocity.z= tle_data[i].velocity_z;


                                                satVelocity.push(velocity);

                }

                for (var i=0; i<geoP.vertices.length; i++) {
                    for (var j=0; j<geoP.vertices.length; j++) {
                        if (i!=j) {
                            if (geoP.vertices[i].distanceTo(geoP.vertices[j]) < 3 && satVelocity[i].distanceTo(satVelocity[j])>.25) {
                                var vertex = new THREE.Vector3();

                                vertex.x = geoP.vertices[i].x;
                                vertex.y = geoP.vertices[i].y;
                                vertex.z = geoP.vertices[i].z;

                                geoC.vertices.push( vertex );
                            }
                        }
                    }
                }
                                

                        materialP = new THREE.PointCloudMaterial( { size: 1, sizeAttenuation: false, transparent: false } );
                        materialP.color.setHSL( 1.0, 0.0, 1 );
                        //console.log(geoP.vertices.length);

                        materialC = new THREE.PointCloudMaterial( { color: 0xFFFFFF,size: 10, sizeAttenuation: true, map: THREE.ImageUtils.loadTexture('textures/collision.png'), transparent: true, alphaTest: 0.01 } );

                        var particlesP = new THREE.PointCloud( geoP, materialP );
                        particlesP.sortParticles = true;
                        scene.add( particlesP );

                        var particlesC = new THREE.PointCloud( geoC, materialC );
                        scene.add( particlesC );
                                                           
}
