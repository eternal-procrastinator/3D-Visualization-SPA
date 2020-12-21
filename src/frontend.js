Vue.component('loader', {
    template: `
        <div style="display:flex;justify-content:center;align-items:center;">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    `
})

new Vue({
    el: '#app',
    data () {
        return {
            params: {
                length: null,
                width: null,
                height: null
            },
            vertices: [],
            triangles: [],
            loading: false
        }
    },
    async mounted() {
        await this.getData()
        await this.sendData()
    },
    methods: {
        async getData () {
            this.loading = true
            const data = await request('/api/triangulation')
            this.params.length = data.length
            this.params.width = data.width
            this.params.height = data.height
            this.loading = false
        },
        async sendData () {
            this.loading = true
            const resp = await request('/api/triangulation', 'POST', this.params)
            let res = JSON.parse(resp)
            this.vertices = res[0]
            this.triangles = res[1]
            await this.getData()
            await this.createScene()
            this.loading = false
        },
        createScene () {
            const contentElement = document.querySelector('.content')
            if(document.querySelector('.content canvas') !== null) contentElement.lastElementChild.remove()

            let camera, scene, renderer;

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
            camera.position.set( 20, 100, 150 );
            camera.lookAt( scene.position );

            const geometry = new THREE.Geometry();
            for(let vert of this.vertices){
                geometry.vertices.push(new THREE.Vector3(vert[0], vert[1], vert[2]))
            }

            for(let triangle of this.triangles){
                console.log(triangle[0], triangle[1], triangle[2])
                geometry.faces.push(new THREE.Face3(triangle[0], triangle[1], triangle[2]))
            }

            geometry.faceVertexUvs[0].push(
                // front
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
                // right
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
                // back
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
                // left
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
                // top
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
                // bottom
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
                [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
            );

            geometry.computeFaceNormals();
            const material = new THREE.MeshPhongMaterial({color: 0x555555});
            //const material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
            const cube = new THREE.Mesh( geometry, material );
            scene.add( cube );

            {
                const color = 0xFFFFFF;
                const intensity = 1;
                const light = new THREE.DirectionalLight(color, intensity);
                light.position.set(0, 0, 120);
                light.target.position.set(0, 0, 0);
                scene.add(light);
                scene.add(light.target);
            }
            {
                const color = 0xFFFFFF;
                const intensity = 1;
                const light = new THREE.DirectionalLight(color, intensity);
                light.position.set(-120, 100, 20);
                light.target.position.set(0, 0, 0);
                scene.add(light);
                scene.add(light.target);
            }
            {
                const color = 0xFFFFFF;
                const intensity = 1;
                const light = new THREE.DirectionalLight(color, intensity);
                light.position.set(120, -80, -20);
                light.target.position.set(0, 0, 0);
                scene.add(light);
                scene.add(light.target);
            }

            renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            contentElement.appendChild( renderer.domElement );

            window.addEventListener( 'resize', onWindowResize, false );

            animate()

            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize( window.innerWidth, window.innerHeight );
            }

            function animate() {
                cube.rotation.y += 0.005
                render();
                requestAnimationFrame( animate );
            }

            function render() {
                renderer.render( scene, camera );
            }
        }
    }
})

async function request (url, method = 'GET', data = null) {
    try {
        const headers = {}
        let body

        if (data) {
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(data)
        }

        let response = await fetch(url, {
            method,
            headers,
            body
        })

        return await response.json()
    } catch (e) {
        console.warn('Error: ', e.message)
    }
}