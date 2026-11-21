import './style.css'
import * as THREE from 'three'

// Create Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x20242c)

// Create Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
)

camera.position.set(3, 2, 5)
camera.lookAt(0, 0, 0)

// Create Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
})

renderer.setSize(
    window.innerWidth,
    window.innerHeight
)

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
)

document.querySelector('#app')
    .appendChild(renderer.domElement)

// Create Light
const light = new THREE.DirectionalLight(
    0xffffff,
    2
)

light.position.set(5, 5, 5)
scene.add(light)

scene.add(
    new THREE.AmbientLight(0xffffff, 1)
)

// Create Cube
const geometry = new THREE.BoxGeometry()

const material = new THREE.MeshStandardMaterial({
    color: 0x44aa88
})

const cube = new THREE.Mesh(
    geometry,
    material
)

scene.add(cube)

// Animation Loop
function animate() {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderer.render(scene, camera)
}

animate()

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect =
        window.innerWidth / window.innerHeight

    camera.updateProjectionMatrix()

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    )
})