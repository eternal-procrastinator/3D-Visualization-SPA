function Triangulate(data) {
    let { length: L, width: W, height: H } = data
    const vertices = []
    let triangles
    let interL = (L/2).toFixed(1)
    let interW = (W/2).toFixed(1)
    let interH = (H/2).toFixed(1)
    L = +L
    W = +W
    H = +H

    for (let i=-interL; i<=interL; i+=L){
        for (let j=-interH; j<=interH; j+=H){
            for (let k=-interW; k<=interW; k+=W){
                // console.log(i, j, k)
                // console.log('')
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

module.exports = { Triangulate }