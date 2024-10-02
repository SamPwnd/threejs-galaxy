import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ 
    width: 360
})
gui.close()

// Canvas
const canvas = document.querySelector('canvas.webgl')

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/6.png')


// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 500000
parameters.size = 0.07
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.4
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'
parameters.galaxyRotation = 0.05
parameters.starsRotation = 0.02
parameters.stars = 25000
parameters.starColor = '#f4f4d4'

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {

    // Destroy old galaxy
    if(points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    // Geometry
    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++){
        const i3 = i * 3

        // Positions
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))


    // Material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        map: particleTexture,
        transparent: true,
        alphaMap: particleTexture
    })

    // Points
    points = new THREE.Points(geometry, material)
    scene.add(points)
}
generateGalaxy()

/**
 * Bg Stars
 */
let starsGeometry = null
let starsMaterial = null
let stars = null

const generateStars = () => {
    // Destroy old background stars
    if(stars !== null) {
        starsGeometry.dispose()
        starsMaterial.dispose()
        scene.remove(stars)
    }

    // Stars geometry
    starsGeometry = new THREE.BufferGeometry()
    const starsPositions = new Float32Array(parameters.stars * 3)

    for (let j = 0; j < parameters.stars; j++) {
        const j3 = j * 3

        starsPositions[j3    ] = (Math.random() - 0.5) * 20
        starsPositions[j3 + 1] = (Math.random() - 0.5) * 20
        starsPositions[j3 + 2] = (Math.random() - 0.5) * 20
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3))

    // Stars material
    starsMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: particleTexture,
        transparent: true,
        alphaMap: particleTexture,
        color: parameters.starColor
    })

    // Stars
    stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)
}
generateStars()

const galaxyFolder = gui.addFolder('Galaxy Parameters')
const starsFolder = gui.addFolder('Background Stars Parameters')

galaxyFolder.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
galaxyFolder.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
galaxyFolder.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
galaxyFolder.add(parameters, 'galaxyRotation').min(0.01).max(1).step(0.01).onFinishChange(generateGalaxy)
starsFolder.add(parameters, 'starsRotation').min(0.01).max(2).step(0.01).onFinishChange(generateStars)
starsFolder.add(parameters, 'stars').min(0).max(1000000).step(100).onFinishChange(generateStars)
starsFolder.addColor(parameters, 'starColor').onChange(generateStars)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    if (points) {
        points.rotation.y = elapsedTime * parameters.galaxyRotation
    }
    if (stars) {
        stars.rotation.y = - (elapsedTime * parameters.starsRotation)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()