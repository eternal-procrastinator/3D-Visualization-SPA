function TriangulateCube(data) {
    let { length: L, width: W, height: H } = data
    const vertices = []
    let triangles
    let interL = +(L/2).toFixed(1)
    let interW = +(W/2).toFixed(1)
    let interH = +(H/2).toFixed(1)
    L = +L
    W = +W
    H = +H

    for (let i=-interL; i<=interL; i+=L){
        for (let j=-interH; j<=interH; j+=H){
            for (let k=-interW; k<=interW; k+=W){
                vertices.push([i,j,k])
            }
        }
    }

    triangles = [
        [1, 5, 3],
        [5, 7, 3],
        [0, 1, 2],
        [1, 3, 2],
        [4, 0, 6],
        [0, 2, 6],
        [5, 4, 7],
        [4, 6, 7],
        [3, 7, 2],
        [7, 6, 2],
        [0, 4, 1],
        [4, 5, 1]
    ]

    return [vertices, triangles]
}

function TriangulateCone(data) {
    let { radius: R, height: H, segments: N } = data
    const vertices = []
    const triangles = []
    const normals = []
    let interX, interZ, B = [0, -R*R/H, 0]
    let magnitude, interNorm

    vertices.push([0, +H, 0])
    normals.push([0, 1, 0])

    for(let i = 0; i < +N; i++){
        interZ = R * Math.cos( 2 * Math.PI * i / N )
        interX = R * Math.sin( 2 * Math.PI * i / N )

        magnitude = +(Math.sqrt( Math.pow( interX, 2 ) + Math.pow( -B[1], 2 ) + Math.pow( interZ, 2 ) )).toFixed(10)
        interNorm = [+(interX / magnitude).toFixed(10), +(-B[1] / magnitude).toFixed(10), +(interZ / magnitude).toFixed(10)]

        normals.push(interNorm)

        vertices.push([interX, 0, interZ])
    }

    for(let i = 1; i < +N; i++){
        triangles.push([0, i, i+1])
    }
    triangles.push([0, +N, 1])

    return [vertices, triangles, normals]
}

module.exports = { TriangulateCube, TriangulateCone }