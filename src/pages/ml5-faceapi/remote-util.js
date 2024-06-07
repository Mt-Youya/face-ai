export const width = 1080
export const height = 720

export function createCanvas(w, h) {
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    return canvas
}

export function useDraw(state) {
    const detectionsRef = useRef(null)

    function gotResults(err, result) {
        if (err) {
            console.log(err)
            return
        }

        detectionsRef.current = result

        // Clear part of the canvas
        state.ctx.fillStyle = "#000000"
        state.ctx.fillRect(0, 0, width, height)

        state.ctx.drawImage(state.video, 0, 0, width, height)

        if (detectionsRef.current) {
            if (detectionsRef.current.length > 0) {
                drawBox(detectionsRef.current)
                drawLandmarks(detectionsRef.current)
            }
        }
        state.faceapi.detect(gotResults)
    }

    function drawBox(detections) {
        for (let i = 0; i < detections.length; i += 1) {
            const alignedRect = detections[i].alignedRect
            const x = alignedRect._box._x
            const y = alignedRect._box._y
            const boxWidth = alignedRect._box._width
            const boxHeight = alignedRect._box._height

            state.ctx.beginPath()
            state.ctx.rect(x, y, boxWidth, boxHeight)
            state.ctx.strokeStyle = "#a15ffb"
            state.ctx.stroke()
            state.ctx.closePath()
        }
    }

    function drawLandmarks(detections) {
        for (let i = 0; i < detections.length; i += 1) {
            const mouth = detections[i].parts.mouth
            const nose = detections[i].parts.nose
            const leftEye = detections[i].parts.leftEye
            const rightEye = detections[i].parts.rightEye
            const rightEyeBrow = detections[i].parts.rightEyeBrow
            const leftEyeBrow = detections[i].parts.leftEyeBrow

            drawPart(mouth, true)
            drawPart(nose, false)
            drawPart(leftEye, true)
            drawPart(leftEyeBrow, false)
            drawPart(rightEye, true)
            drawPart(rightEyeBrow, false)
        }
    }

    function drawPart(feature, closed) {
        state.ctx.beginPath()
        for (let i = 0; i < feature.length; i += 1) {
            const x = feature[i]._x
            const y = feature[i]._y

            if (i === 0) {
                state.ctx.moveTo(x, y)
            } else {
                state.ctx.lineTo(x, y)
            }
        }

        if (closed === true) {
            state.ctx.closePath()
        }
        state.ctx.stroke()
    }

    return {
        modelReady() {
            state.faceapi.detect(gotResults)
        },
    }
}
