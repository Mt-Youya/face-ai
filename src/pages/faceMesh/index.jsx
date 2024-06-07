import { FaceMesh } from "@mediapipe/face_mesh"
import { drawConnectors, drawFaceMesh } from "@mediapipe/drawing_utils"

function FaceMeshPage() {

    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    const contextRef = useRef({
        faceMesh: null,
    })

    function handleVideoLoadData() {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        contextRef.current.faceMesh.onResults(handleResults)
    }

    function handleResults(results) {
        const ctx = canvasRef.current.getContext("2d")
        ctx.save()
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)

        if (results.multiFaceMesh) {
            for (const faceMeshData of results.multiFaceMesh) {
                drawFaceMesh(ctx, faceMeshData.faceMesh, { lineWidth: 2, color: "green" })
                drawConnectors(ctx, faceMeshData.faceMesh, { lineWidth: 2, color: "green" })
            }
        }

        ctx.restore()
        requestAnimationFrame(contextRef.current.faceMesh.send({ image: videoRef.current }))
    }

    contextRef.current.faceMesh = new FaceMesh({
        locateFile: () => "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.min.js",
    })
    contextRef.current.faceMesh.setOptions({ maxNumFaces: 1 })
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRef.current.srcObject = stream
            })
            .catch(err => {
                console.error(err)
            })

    }, [])
    return (
        <>
            <h1> FaceMeshPage </h1>

            <video id="video" autoPlay ref={videoRef} onLoadedData={handleVideoLoadData}></video>
            <canvas id="canvas" ref={canvasRef}></canvas>
        </>
    )
}

export default FaceMeshPage
