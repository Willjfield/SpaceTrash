var container, stats;
var camera, scene, controls, renderer, objects;
var pointLight;
var roty;	
var sphere,earth, skybox;
var earthMaterial;
var materialP,particles, particleCount, geoP, geoC, particlesP, particlesC;

var particleTrail = [];
var particleHeadArr = [];
var collisionArr = [];

var particleHead;

var lightDir= new THREE.Vector3(0.0,-.2,1.0);
var earthAxis = new THREE.Vector3(0,1,0);


init();
animate();

function map (val, in_min, in_max, out_min, out_max) {
  return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

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
                                controls.addEventListener( 'change',render);
			

        scene = new THREE.Scene();

       	createSats();

        // Grid
        var size = 500, step = 100;

       //Background
        var geometryBG = new THREE.SphereGeometry( 2000, 48, 48 );
        var materialBG = new THREE.MeshLambertMaterial( {  map: THREE.ImageUtils.loadTexture( 'textures/milkyway.png' ), color: 0xffffff, emmisive: 0xffffff} );

        skybox = new THREE.Mesh( geometryBG, materialBG);
        skybox.material.side = THREE.DoubleSide;
        scene.add( skybox );

	
        //Earth
        var earthGeo = new THREE.SphereGeometry(100,48,48);
        //var earthMaterial = new THREE.MeshLambertMaterial();
        earthMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() },
		texOffset: {type: "f", value: 0.2},
		sunDirection: { type: "v3", value: lightDir.applyAxisAngle(earthAxis,roty) },
                dayTexture: { type: "t", value: new THREE.ImageUtils.loadTexture( "textures/bluemarble_map_4096.jpg" ) },
                nightTexture: { type: "t", value: new THREE.ImageUtils.loadTexture( "textures/Earth_night_4096.jpg" ) },
		normalTexture: { type: "t", value: new THREE.ImageUtils.loadTexture( "textures/earthbump_4096.jpg") },
		cloudTexture: { type: "t", value: new THREE.ImageUtils.loadTexture("textures/earth_clouds.jpg")}
            },
            attributes: {
                vertexOpacity: { type: 'f', value: [] }
            },
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	   
        } );
	earthMaterial.uniforms.cloudTexture.value.wrapS = THREE.RepeatWrapping;

        earth = new THREE.Mesh(earthGeo,earthMaterial);
        scene.add(earth);
        // Lights
        scene.add( new THREE.AmbientLight( 1 * 0x202020 ) );
        var directionalLight = new THREE.DirectionalLight( 1 * 0xffffff );
        directionalLight.position.x = 0.5;
        directionalLight.position.y = 0.5;
        directionalLight.position.z = 0.5;
        directionalLight.position.normalize();
        //scene.add( directionalLight );

        pointLight = new THREE.PointLight( 0xffffff, .2 );
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
	changeRot = 0.00000243*speedupFactor;
        tle_update();
	//console.log(lightDir.angleTo(new THREE.Vector3(0,-.2,1)))
	lightDir = lightDir.applyAxisAngle(earthAxis,-changeRot)
	earthMaterial.uniforms.sunDirection.value = lightDir 
     	earthMaterial.uniforms.texOffset.value -= changeRot/10;	
	createSats();
    }, 1000/30);
	controls.update();

    render();
    
   if(particleHeadArr.length>0){
   	scene.remove(particleHeadArr[0]);
	particleHeadArr.shift();	
   }
    
    if(particleTrail.length>(1/Math.pow(speedupFactor,2))*1000){
    	scene.remove(particleTrail[0]);
	particleTrail.shift();
    }

    if(collisionArr.length>20){
    	scene.remove(collisionArr[0]);
	collisionArr.shift();
    }
}

function render() { 
    var timer = Date.now() * 0.0001;
    pointLight.position.x = 0;
    pointLight.position.y = 0;
    pointLight.position.z = 0;
    roty+=changeRot;

   earth.rotation.y=roty;
    renderer.render( scene, camera );
}

function createSats(){ 

                geoP= new THREE.Geometry({ verticesNeedUpdate: true});
                geoC= new THREE.Geometry({ verticesNeedUpdate: true});

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
                            if (geoP.vertices[i].distanceTo(geoP.vertices[j]) < 3 && satVelocity[i].distanceTo(satVelocity[j])>.5) {
                                var vertex = new THREE.Vector3();

                                vertex.x = geoP.vertices[i].x;
                                vertex.y = geoP.vertices[i].y;
                                vertex.z = geoP.vertices[i].z;

                                geoC.vertices.push( vertex );
                            }
                        }
                    }
                }
	                materialP = new THREE.PointCloudMaterial( { size: 3, sizeAttenuation: false, transparent: true, alpha: .5 } );
                        materialP.color.setHSL( 1.0, 0.0, 1 );
				
                        materialT = new THREE.PointCloudMaterial( { size: 1, sizeAttenuation: false, transparent: true, alpha: .5 } );
                       materialT.color.setHSL(.6,1,.6); 	

                        materialC = new THREE.PointCloudMaterial( { color: 0xFFFFFF,size: 30, sizeAttenuation: true, map: THREE.ImageUtils.loadTexture('textures/collision.png'), transparent: true, alphaTest: 0.01 } );

                        particleHead = new THREE.PointCloud( geoP, materialP );
                        particleHead.sortParticles = true;
			
			trailSection = new THREE.PointCloud(geoP,materialT);
			trailSection.sortParticles = true;		
			particleTrail.push(trailSection);
			for(p in particleTrail){
				scene.add(particleTrail[p])
			}
			
			particleHeadArr.push(particleHead)
			for(p in particleHeadArr){
				scene.add(particleHeadArr[p])
			}


                        particlesC = new THREE.PointCloud( geoC, materialC );
                        collisionArr.push(particlesC)
			for(c in collisionArr){
				scene.add(collisionArr[c])
			}
                                                           
}

