import { useEffect, useRef } from "react"
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision"
// import wasm from "@mediapipe/tasks-vision/wasm?raw"
import "./index.css"

const modelAssetPath = `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`
const wasm = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
const imgs = ["https://assets.codepen.io/9177687/female-4572747_640.jpg", "https://assets.codepen.io/9177687/idea-gcbe74dc69_1920.jpg"]

function FaceDetection() {
    const demosSectionRef = useRef(null)
    const webcamRef = useRef(null)
    const webcamBtnRef = useRef(null)
    const liveViewRef = useRef(null)

    const contextRef = useRef({
        faceDetector: undefined,
        runningMode: "IMAGE",
        enableWebcamButton: undefined,
        children: [],
        lastVideoTime: -1,
    })

    // Initialize the object detector
    async function initializefaceDetector() {
        const vision = await FilesetResolver.forVisionTasks("/public/")
        contextRef.current.faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: { modelAssetPath, delegate: "GPU" },
            runningMode: contextRef.current.runningMode,
        })
        demosSectionRef.current.classList.remove("invisible")
    }

    const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia

    async function enableCam(event) {
        if (!contextRef.current.faceDetector) {
            alert("Face Detector is still loading. Please try again..")
            return
        }

        // Hide the button.
        // contextRef.current.enableWebcamButton.classList.add("removed")

        // getUsermedia parameters
        const constraints = {
            video: true,
        }

        // Activate the webcam stream.
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(function(stream) {
                webcamRef.current.srcObject = stream
                webcamRef.current.addEventListener("loadeddata", predictWebcam)
            })
            .catch((err) => {
                console.error(err)
            })
    }

    async function predictWebcam() {
        // if image mode is initialized, create a new classifier with video runningMode
        if (contextRef.current.runningMode === "IMAGE") {
            contextRef.current.runningMode = "VIDEO"
            await contextRef.current.faceDetector.setOptions({ runningMode: "VIDEO" })
        }
        const startTimeMs = performance.now()

        // Detect faces using detectForVideo
        if (webcamRef.current.currentTime !== contextRef.current.lastVideoTime) {
            contextRef.current.lastVideoTime = webcamRef.current.currentTime
            const detections = contextRef.current.faceDetector.detectForVideo(webcamRef.current, startTimeMs).detections
            displayVideoDetections(detections)
        }

        // Call this function again to keep predicting when the browser is ready
        requestAnimationFrame(predictWebcam)
    }

    function displayVideoDetections(detections) {
        // Remove any highlighting from previous frame.

        for (let child of contextRef.current.children) {
            liveViewRef.current.removeChild(child)
        }
        contextRef.current.children.splice(0)

        // Iterate through predictions and draw them to the live view
        for (let detection of detections) {
            const p = document.createElement("p")
            p.innerText = `Confidence: ${Math.round(parseFloat(detection.categories[0].score + "") * 100)}% . `
            p.style = `
                left: ${(webcamRef.current.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX)}px;  
                top: ${(detection.boundingBox.originY - 30)}px;   
                width: ${(detection.boundingBox.width - 10)}px;
            `

            const highlighter = document.createElement("div")
            highlighter.setAttribute("class", "highlighter")
            highlighter.style = `
                left: ${webcamRef.current.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX}px;  
                top: ${detection.boundingBox.originY}px;   
                width: ${detection.boundingBox.width - 10}px;
                height: ${detection.boundingBox.height}px;
            `

            liveViewRef.current.appendChild(highlighter)
            liveViewRef.current.appendChild(p)

            // Store drawn objects in memory so they are queued to delete at next call
            contextRef.current.children.push(highlighter)
            contextRef.current.children.push(p)
            for (let keypoint of detection.keypoints) {
                const keypointEl = document.createElement("spam")
                keypointEl.className = "key-point"
                keypointEl.style.top = `${keypoint.y * webcamRef.current.offsetHeight - 3}px`
                keypointEl.style.left = `${webcamRef.current.offsetWidth - keypoint.x * webcamRef.current.offsetWidth - 3}px`
                liveViewRef.current.appendChild(keypointEl)
                contextRef.current.children.push(keypointEl)
            }
        }
    }

    useEffect(() => {
        const hasMedia = hasGetUserMedia()
        if (hasMedia) {
            contextRef.current.enableWebcamButton = webcamBtnRef.current
            contextRef.current.enableWebcamButton.addEventListener("click", enableCam)
        } else {
            console.warn("getUserMedia() is not supported by this browser")
        }
        initializefaceDetector()

    }, [])

    return (
        <>
            <h1>使用 MediaPipe Face Detector 任务进行人脸检测</h1>

            <section id="demos" className="invisible" ref={demosSectionRef}>

                <h2>演示：网络摄像头连续人脸检测</h2>
                <p>从网络摄像头检测人脸。准备好后，单击下面的“启用网络摄像头”并接受对网络摄像头的访问。 </p>

                <div id="liveView" className="videoView" ref={liveViewRef}>
                    <button id="webcamButton" className="mdc-button mdc-button--raised" onClick={enableCam}
                            ref={webcamBtnRef}
                    >
                        <span className="mdc-button__ripple"></span>
                        <span className="mdc-button__label">启用网络摄像头</span>
                    </button>
                    <video id="webcam" ref={webcamRef} autoPlay playsInline></video>
                </div>
            </section>
        </>
    )
}

export default FaceDetection
