// import { OrbitControls } from 'https://unpkg.com/three@0.117.0/examples/jsm/controls/OrbitControls.js';

Vue.component('loader', {
    template: `
        <div style="display:flex;justify-content:center;align-items:center;margin-top:20px;">
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
            cubeParams: {
                length: null,
                width: null,
                height: null,
            },
            coneParams: {
                height: null,
                radius: null,
                segments: null,
            },
            rotationSpeed: {
                x: "0",
                y: "0.01",
                z: "0",
            },
            vertices: [],
            triangles: [],
            normals: [],
            type: null,
            loading: false,
            updated: false,
            smooth: false,
        }

    },
    async mounted() {
        let scene, camera, renderer, figure

        this.createScene()
        await this.getData()
        await this.sendData()
    },
    watch: {
        "coneParams.radius": function () {
            this.updated = true
        },
        "coneParams.height": function () {
            this.updated = true
        },
        type: async function () {
            this.updated = true

            await this.sendData()
        },
    },
    methods: {
        async getData () {
            this.loading = true
            const data = await request( '/api/triangulation' )
            this.cubeParams.length = data.Params.cubeParams.length
            this.cubeParams.width = data.Params.cubeParams.width
            this.cubeParams.height = data.Params.cubeParams.height
            this.coneParams.radius = data.Params.coneParams.radius
            this.coneParams.height = data.Params.coneParams.height
            this.coneParams.segments = data.Params.coneParams.segments
            this.type = data.Type
            this.loading = false
        },
        async sendData () {
            this.loading = true
            const resp = this.type === "cube" ?
                await request( '/api/triangulation', 'POST', { Params: this.cubeParams, Type: this.type } ) :
                await request( '/api/triangulation', 'POST', { Params: this.coneParams, Type: this.type } )
            let result = JSON.parse( resp )
            this.vertices = result[0]
            this.triangles = result[1]
            this.normals = result[2]
            await this.updateScene()
            this.loading = false
        },
        createScene () {
            function createLight( position, intensity = 1, color = 0xFFFFFF ) {
                let light = new THREE.DirectionalLight( color, intensity )
                light.position.set( ...position )
                light.target.position.set( 0, 0, 0 )
                scene.add(light)
                scene.add(light.target)
            }

            const contentElement = document.querySelector('.content')

            scene = new THREE.Scene()

            camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 )
            camera.position.set( 0, 100, 150 )
            camera.lookAt( scene.position )

            renderer = new THREE.WebGLRenderer( { antialias: true } )
            renderer.setPixelRatio( window.devicePixelRatio )
            renderer.setSize( window.innerWidth, window.innerHeight )
            contentElement.appendChild( renderer.domElement )

            createLight( [0, 30, 120], 1.2 )
            createLight( [-120, 100, 0] )
            createLight( [120, -20, -20] )
        },
        async updateScene() {
            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize( window.innerWidth, window.innerHeight )
            }

            function animate() {
                if(!this.updated) {
                    if (this.type === 'cone') {
                        camera.position.set(0, 70, 180)
                        camera.lookAt( 0, 20, 0 )
                    } else {
                        camera.position.set(0, 100, 150)
                        camera.lookAt( 0, 0, 0 )
                    }
                }

                figure.rotation.x += +this.rotationSpeed.x
                figure.rotation.y += +this.rotationSpeed.y
                figure.rotation.z += +this.rotationSpeed.z
                render()
                requestAnimationFrame( animate.bind(this) )
            }

            function render() {
                renderer.render( scene, camera )
            }

            scene.remove(scene.children.find(child => child.type === "Group"))

            const geometry = new THREE.Geometry()
            for(let vertice of this.vertices){
                geometry.vertices.push( new THREE.Vector3( vertice[0], vertice[1], vertice[2] ) )                       // coordinates of vertice
            }

            switch(this.type){
                case "cube":
                    for (let triangle of this.triangles) {
                        geometry.faces.push( new THREE.Face3( triangle[0], triangle[1], triangle[2] ) )                 // order of vertices
                    }
                    geometry.computeFaceNormals()
                    break
                case "cone":
                    let vertexNormals = []
                    this.normals.forEach( normal => {
                        vertexNormals.push( new THREE.Vector3( ...normal ) )
                    } )
                    if(!this.smooth){
                        for (let triangle of this.triangles) {
                            geometry.faces.push( new THREE.Face3( triangle[0], triangle[1], triangle[2] ) )             // order of vertices
                            geometry.computeFaceNormals()
                        }
                    } else {
                        for (let triangle of this.triangles) {
                            let normal = [ vertexNormals[ triangle[0] ], vertexNormals[ triangle[1] ], vertexNormals[ triangle[2] ] ]
                            geometry.faces.push( new THREE.Face3( triangle[0], triangle[1], triangle[2], normal ) )     // order of vertices
                        }
                    }
                    break
            }

            let materials = [
                new THREE.MeshPhongMaterial({
                    transparent: true,
                    shininess: 40,
                    side: THREE.FrontSide,
                    opacity: 1,
                    color: 0x555555,
                }),
                new THREE.MeshPhongMaterial({
                    transparent: true,
                    side: THREE.BackSide,
                    opacity: 0.4,
                    color: 0x555555,
                }),
            ]

            let figure = new THREE.Group()

            for ( let i = 0; i < materials.length; i ++ ) {
                figure.add( new THREE.Mesh( geometry, materials[i] ) )
            }

            scene.add( figure )

            window.addEventListener( 'resize', onWindowResize, false )

            animate.call(this)
            this.updated = false
        },
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