import "./index.css"

import {
    FaceLandmarker,
    FilesetResolver,
    DrawingUtils,
} from "/public/libs/task-vision@0.10.12"

function FaceLandMarker() {
    const videoWidth = 480

    const wrapperRef = useRef(null)
    const imageBlendRef = useRef(null)
    const videoBlendRef = useRef(null)
    const imageContainerRef = useRef(null)
    const canvasRef = useRef(null)
    const enableWebcamRef = useRef(null)
    const videoRef = useRef(null)

    const contextRef = useRef({
        faceLandmarker: null,
        runningMode: "VIDEO",
        enableWebcamButton: null,
        webcamRunning: false,
        lastVideoTime: -1,
        results: void 0,
    })
    const drawingUtilRef = useRef(null)

    async function createFaceLandmarker() {
        const filesetResolver = await FilesetResolver.forVisionTasks("")
        const { runningMode } = contextRef.current
        contextRef.current.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: `/face_landmarker.task`,
                delegate: "GPU",
            },
            outputFaceBlendshapes: true,
            runningMode,
            numFaces: 1,
        })
        wrapperRef.current.classList.remove("invisible")
    }

    function drawBlendShapes(el, blendShapes) {
        if (!blendShapes.length) {
            return
        }

        let htmlMaker = ""
        blendShapes[0].categories.forEach((shape) => {
            htmlMaker += `
              <li class="blend-shapes-item">
                <span class="blend-shapes-label">
                    ${shape.displayName || shape.categoryName}
                </span>
                <span class="blend-shapes-value" style="width: calc(${+shape.score * 100}% - 120px)">
                    ${(+shape.score).toFixed(4)}
                </span>
              </li>
            `
        })
        el.innerHTML = htmlMaker
    }

// Enable the live webcam view and start detection.
    function enableCam(event) {
        const { faceLandmarker, webcamRunning } = contextRef.current
        if (!faceLandmarker) {
            console.log("Wait! faceLandmarker not loaded yet.")
            return
        }

        if (webcamRunning === true) {
            contextRef.current.webcamRunning = false
            enableWebcamRef.current.innerText = "ENABLE PREDICTIONS"
        } else {
            contextRef.current.webcamRunning = true
            enableWebcamRef.current.innerText = "DISABLE PREDICTIONS"
        }

        // getUsermedia parameters.
        const constraints = {
            video: true,
        }

        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            videoRef.current.srcObject = stream
            videoRef.current.addEventListener("loadeddata", predictWebcam)
        })
    }

    async function predictWebcam() {
        const video = videoRef.current
        const radio = video.videoHeight / video.videoWidth
        video.style.width = videoWidth + "px"
        video.style.height = videoWidth * radio + "px"
        const canvasElement = canvasRef.current
        canvasElement.style.width = videoWidth + "px"
        canvasElement.style.height = videoWidth * radio + "px"
        canvasElement.width = video.videoWidth
        canvasElement.height = video.videoHeight
        // Now let's start detecting the stream.
        const { runningMode, lastVideoTime, results, webcamRunning } = contextRef.current
        if (runningMode === "IMAGE") {
            contextRef.current.runningMode = "VIDEO"
            await contextRef.current.faceLandmarker.setOptions({ runningMode: runningMode })
        }
        let startTimeMs = performance.now()
        if (lastVideoTime !== video.currentTime) {
            contextRef.current.lastVideoTime = video.currentTime
            contextRef.current.results = contextRef.current.faceLandmarker.detectForVideo(video, startTimeMs)
        }
        console.log(contextRef.current.results)
        if (contextRef.current.results.faceLandmarks) {
            for (const landmarks of contextRef.current.results.faceLandmarks) {
                drawingUtilRef.current.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                    { color: "#C0C0C070", lineWidth: 1 },
                )
                drawingUtilRef.current.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                    { color: "#FF3030" },
                )
                drawingUtilRef.current.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
                    { color: "#FF3030" },
                )
                drawingUtilRef.current.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                    { color: "#30FF30" },
                )
                drawingUtilRef.current.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
                    { color: "#30FF30" },
                )
                drawingUtilRef.current.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
                    { color: "#E0E0E0" },
                )
                drawingUtilRef.current.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LIPS,
                    { color: "#E0E0E0" },
                )
                drawingUtilRef.current.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
                    { color: "#FF3030" },
                )
                drawingUtilRef.current.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
                    { color: "#30FF30" },
                )
            }
        }
        drawBlendShapes(videoBlendRef.current, contextRef.current.results.faceBlendshapes)

        // Call this function again to keep predicting when the browser is ready.
        if (webcamRunning) {
            window.requestAnimationFrame(predictWebcam)
        }
    }

    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d")
        drawingUtilRef.current = new DrawingUtils(ctx)
        createFaceLandmarker()
    }, [])

    return (
        <>
            <h1>Face landmark detection using the MediaPipe FaceLandmarker task</h1>
            <section id="demos" className="invisible" ref={wrapperRef}>
                <div className="blend-shapes">
                    <ul ref={imageBlendRef} className="blend-shapes-list" id="image-blend-shapes"></ul>
                </div>

                <h2>Demo: Webcam continuous face landmarks detection</h2>
                <p>
                    Hold your face in front of your webcam to get real-time face landmarker detection.
                    <br />
                    Click <b> enable webcam</b> below and grant access to the webcam if prompted.
                </p>

                <div id="liveView" className="videoView">
                    <button ref={enableWebcamRef} id="webcamButton" className="mdc-button mdc-button--raised"
                            onClick={enableCam}
                    >
                        <span className="mdc-button__ripple"></span>
                        <span className="mdc-button__label">ENABLE WEBCAM</span>
                    </button>
                    <div className="relative">

                        <video ref={videoRef} id="webcam" className="absolute" autoPlay playsInline></video>
                        <canvas ref={canvasRef} className="output_canvas absolute" id="output_canvas"></canvas>
                    </div>
                </div>

                <div className="blend-shapes">
                    <ul ref={videoBlendRef} className="blend-shapes-list" id="video-blend-shapes"></ul>
                </div>
            </section>
        </>
    )
}

export default FaceLandMarker
// export default function() {
//     return <div>11</div>
// }