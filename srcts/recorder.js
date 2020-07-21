//import { saveAs } from 'file-saver';
// set up basic variables for app
const record = document.querySelector(".record");
var stopRecord = document.querySelector(".stopRecord");
const record2 = document.querySelector(".record2");
const stopRecord2 = document.querySelector(".stopRecord2");
const down = document.querySelector(".down");
const soundClips = document.querySelector(".sound-clips");
const canvas = document.querySelector(".visualizer");
const mainSection = document.querySelector(".main-controls");

// disable stop button while not recording
stopRecord.disabled = true;
stopRecord2.disabled = true;
down.disabled = true;

// visualiser setup - create web audio api context and canvas
let audioCtx;
const canvasCtx = canvas.getContext("2d");
var zip = new JSZip();
//main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia supported.");

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    visualize(stream);

    record.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.style.background = "red";

      stopRecord.disabled = false;
      record.disabled = true;
    };

    stopRecord.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record.style.background = "";
      record.style.color = "";
      // mediaRecorder.requestData();

      stopRecord.disabled = true;
      record.disabled = false;
    };

    record2.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record2.style.background = "red";

      stopRecord2.disabled = false;
      record2.disabled = true;
    };

    stopRecord2.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record2.style.background = "";
      record2.style.color = "";
      // mediaRecorder.requestData();

      stopRecord2.disabled = true;
      record2.disabled = false;
    };

      down.onclick = function () {
      
      let zip = new JSZip();
      let n = soundClips.children.length;
      for (i = 0; i < n; i++) {
        var child = soundClips.children[i];
        let fileName = child.children[1].textContent;
        let src = child.children[0].src;
        zip.file(fileName + ".mp3", src);
      }
      zip.generateAsync({ type: "blob" }).then(function(content) {
        saveAs(content, "Sound.zip");
      });
    };

    mediaRecorder.onstop = function(e) {
      down.disabled = false;
      console.log("data available after MediaRecorder.stop() called.");

      const clipName = prompt("Enter a name for your sound?", "My unnamed sound");

      const clipContainer = document.createElement("article");
      const clipLabel = document.createElement("p");
      const audio = document.createElement("audio");
      const deleteButton = document.createElement("button");

      clipContainer.classList.add("clip");
      audio.setAttribute("controls", "");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete";

      if (clipName === null) {
        clipLabel.textContent = "My unnamed sound";
      } else {
        clipLabel.textContent = clipName;
      }

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      soundClips.appendChild(clipContainer);

      audio.controls = true;
      const blob = new Blob(chunks, { type: "audio/mp3; codecs=opus" });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");

      deleteButton.onclick = function(e) {
        let evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
        if (evtTgt.parentNode.parentNode.children.length === 0) down.disabled = true;
      };

      clipLabel.onclick = function() {
        const existingName = clipLabel.textContent;
        const newClipName = prompt("Enter a new name for your sound clip?");
        if (newClipName === null) {
          clipLabel.textContent = existingName;
        } else {
          clipLabel.textContent = newClipName;
        }
      };
    };

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    };
  };

  let onError = function(err) {
    console.log("The following error occured: " + err);
  };

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} else {
  console.log("getUserMedia not supported on your browser!");
}

function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw();

  function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}

window.onresize = function() {
  canvas.width = mainSection.offsetWidth;
};

window.onresize();
