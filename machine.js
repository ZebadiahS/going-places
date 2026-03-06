window.tmState = {
   className: "neutral",
   probability: 0,
   index: -1
};

const URL = "https://teachablemachine.withgoogle.com/models/WG8CP4J4k/";

let model, webcam;
const THRESHOLD = 0.8;

async function init() {

   const modelURL = URL + "model.json";
   const metadataURL = URL + "metadata.json";

   model = await tmPose.load(modelURL, metadataURL);

   webcam = new tmPose.Webcam(400, 400, true);
   await webcam.setup();
   await webcam.play();

   document.body.appendChild(webcam.canvas);
   webcam.canvas.style.display = "none"; // Hide the webcam feed

   window.requestAnimationFrame(loop);
}

async function loop() {
   webcam.update();
   await predict();
   window.requestAnimationFrame(loop);
}

async function predict() {
   const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

   const prediction = await model.predict(posenetOutput);

   let maxProb = 0.7;
   let maxIndex = 3;

   for (let i = 0; i < prediction.length; i++) {
      if (prediction[i].probability > maxProb) {
         maxProb = prediction[i].probability;
         maxIndex = i;
      }
   }

   if (maxProb > THRESHOLD) {
      window.tmState.className = prediction[maxIndex].className;
      window.tmState.probability = maxProb;
      window.tmState.index = maxIndex;
   } else {
      window.tmState.className = "neutral";
      window.tmState.probability = 0;
      window.tmState.index = -1;
   }

   // Debug line
   // console.log(window.tmState);
}

init();