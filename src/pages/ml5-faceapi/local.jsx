import ml5 from "ml5"

function Ml5FaceapiLocal() {
    const videoRef = useRef(null)
    const predictions = useRef(null)

    async function setup() {
        function modelLoaded() {
            console.log("Model Loaded!")
        }

        const face_mesh = ml5.facemesh(videoRef.current, modelLoaded)

        face_mesh.on("face", results => {
            predictions.current = results
            console.log(results)
        })
    }

    useEffect(() => {
        setup()
    }, [])

    return (
        <>
            <h1>Facemesh with Webcam</h1>

            <video ref={videoRef}></video>
        </>
    )
}

export default Ml5FaceapiLocal
