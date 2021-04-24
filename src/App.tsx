import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import * as handpose from '@tensorflow-models/handpose';
import * as posenet from '@tensorflow-models/posenet'
import '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

interface IApp {}

const App: React.FC<IApp> = () => {

  React.useEffect(() => {
    setupCamera()
  }, [])

  async function setupCamera() {

    const video: any = document.getElementById('video')
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: video.width,
        height: video.height,
        facingMode: 'user'
      }
    })
    video.srcObject = stream
    await video.play()
    const net = await posenet.load()
    const model = await handpose.load();
    const c: any = document.getElementById('canvasDraw')
    const ctx = c.getContext('2d');
    setInterval(async () => {
      ctx.clearRect(0, 0, c.width, c.height);
      const poses: any = await net.estimatePoses(video, {
        flipHorizontal: false,
        decodingMethod: 'single-person'
      })
      // const predictions = await model.estimateHands(video);
      // if (predictions.length > 0) {
      //   console.log(predictions[0])
      //   drawKeypoints(ctx, predictions[0].landmarks)
      // }
      let newKeypoints
      if (poses[0].score >= 0.4) {
        newKeypoints = poses[0].keypoints.filter((keypoint: any) => {
          if (keypoint.score > 0.7) {
            return keypoint
          }
        })
        drawKeypoints(ctx, newKeypoints)
        drawSkeleton(ctx, newKeypoints)
      }
    }, 100)
  }

  function drawKeypoints(ctx: any, keypoints: any) {
    keypoints.forEach(({ position }) => {
      const { x, y } = position
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI, false)
      ctx.fillStyle = "red"
      ctx.fill()
    })
  }
  function drawSkeleton(ctx: any, keypoints: any) {
    let leftShoulder: any = null
    let leftElbow: any = null
    let leftWrist: any = null
    let rightShoulder: any = null
    let rightElbow: any = null
    let rightWrist: any = null
    keypoints.forEach(({ part, position }) => {
      switch (part) {
        case 'leftShoulder':
          leftShoulder = position
          break;
        case 'leftElbow':
          leftElbow = position
          break
        case 'leftWrist':
          leftWrist = position
          break
        case 'rightShoulder':
          rightShoulder = position
          break
        case 'rightElbow':
          rightElbow = position
          break
        case 'rightWrist':
          rightWrist = position
          break
        default:
          break;
      }
    })
    if (rightShoulder && leftShoulder) {
      drawShoulders(ctx, rightShoulder, leftShoulder)
    }
    if (leftShoulder && leftElbow) {
      drawShoulderElbow(ctx, leftShoulder, leftElbow)
    }
    if (leftElbow && leftWrist) {
      drawElbowWrist(ctx, leftElbow, leftWrist)
    }
    if (rightShoulder && rightElbow) {
      drawShoulderElbow(ctx, rightShoulder, rightElbow)
    }
    if (rightElbow && rightWrist) {
      drawElbowWrist(ctx, rightElbow, rightWrist)
    }
  }

  function drawShoulders(ctx, rightShoulder, leftShoulder) {
    ctx.beginPath()
    ctx.moveTo(leftShoulder.x, leftShoulder.y)
    ctx.lineTo(rightShoulder.x, rightShoulder.y)
    ctx.lineWidth = 5
    ctx.strokeStyle = "red"
    ctx.stroke();
  }
  function drawShoulderElbow(ctx, shoulder, elbow) {
    ctx.beginPath()
    ctx.moveTo(shoulder.x, shoulder.y)
    ctx.lineTo(elbow.x, elbow.y)
    ctx.lineWidth = 5
    ctx.strokeStyle = "red"
    ctx.stroke();
  }
  function drawElbowWrist(ctx, elbow, wrist) {
    ctx.beginPath()
    ctx.moveTo(elbow.x, elbow.y)
    ctx.lineTo(wrist.x, wrist.y)
    ctx.lineWidth = 5
    ctx.strokeStyle = "red"
    ctx.stroke();
  }

  return (
    <div className='main'>
      <div className='title'><h1>By Diego Alzate</h1></div>
      <div className='tensorflow'>
        Tensorflow - Posenet
        <canvas id='canvasDraw' width='1000' height='800'></canvas>
        <video id='video' width='1000' height='800'></video>
      </div>
      <div>
        Your <FontAwesomeIcon icon={faCoffee} className='faCoffee' /> is hot and ready!
      </div>
    </div>
  )
}

export default App
