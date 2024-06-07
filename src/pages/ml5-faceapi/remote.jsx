import { createCanvas, height, useDraw, width } from "./remote-util.js"
import { faceApi } from "ml5"

function Ml5Faceapi() {
    const wrapperRef = useRef(null)
    const detectionsRef = useRef(null)

    const contextRef = useRef({
        video: null,
        canvas: null,
        ctx: null,
        faceapi: null,
    })

    const { modelReady } = useDraw(contextRef.current, detectionsRef)

    async function make() {
        // get the video
        contextRef.current.video = await getVideo()
        contextRef.current.canvas = createCanvas(width, height)
        const { canvas, video } = contextRef.current
        wrapperRef.current.appendChild(canvas)
        contextRef.current.ctx = canvas.getContext("2d")
        const detectionOption = {
            withLandmarks: true,
            withDescriptors: false,
            MODEL_URLS: {
                Mobilenetv1Model: "/models",
                FaceLandmarkModel: "/models",
                FaceRecognitionModel: "/models",
            },
        }
        contextRef.current.faceapi = faceApi(video, detectionOption, modelReady)
    }

    async function getVideo() {
        // Grab elements, create settings, etc.
        const videoElement = document.createElement("video")
        videoElement.setAttribute("style", "display: none;")
        videoElement.width = width
        videoElement.height = height
        wrapperRef.current.appendChild(videoElement)

        // Create a webcam capture
        videoElement.srcObject = await navigator.mediaDevices.getUserMedia({ video: true })
        videoElement.play()
        return videoElement
    }

    useEffect(() => {
        make()
    }, [])

    return (
        <div ref={wrapperRef}>
            <h1>FaceApi Landmarks Demo</h1>
        </div>
    )
}

export default Ml5Faceapi
