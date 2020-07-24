//import * as JSZip from "jszip";
//import {saveAs} from 'file-saver';
// set up basic variables for app
const record = <HTMLInputElement> document.querySelector(".record");
const stopRecord = <HTMLInputElement> document.querySelector(".stopRecord");
const record2 = <HTMLInputElement> document.querySelector(".record2");
const stopRecord2 = <HTMLInputElement> document.querySelector(".stopRecord2");
const down = <HTMLInputElement> document.querySelector(".down");
const soundClips = <HTMLInputElement> document.querySelector(".sound-clips");
const canvas = <HTMLCanvasElement> document.querySelector(".visualizer");
const mainSection = <HTMLInputElement> document.querySelector(".main-controls");

// disable stop button while not recording
stopRecord.disabled = true;
stopRecord2.disabled = true;
down.disabled = true;

// visualiser setup - create web audio api context and canvas
let audioCtx: AudioContext;
const canvasCtx: CanvasRenderingContext2D = canvas.getContext("2d");

interface zipFile {
    name: string;
    src : string;
}

//main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia supported.");

  const constraints = { audio: true };
  let chunks:any[] = [];

  let onSuccess = function(stream: MediaStream) {
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
      let data: Array<zipFile> = [];
      let n = soundClips.children.length;
      for (let i = 0; i < n; i++) {
        let child = soundClips.children[i];
        let fileName = child.children[1].textContent;
          let src = (<HTMLAudioElement>child.children[0]).src;
          let file: zipFile = {
              name: fileName,
              src : src
          }
          data.push(file);
        }
        compile(data);
    };

    mediaRecorder.onstop = function() {
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
          let evtTgt = <HTMLElement> e.target;
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

  let onError = (err:string) => {
    console.log("The following error occured: " + err);
  };

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} else {
  console.log("getUserMedia not supported on your browser!");
}

function compile(data: Array<zipFile>) {
    let set = new Set();
    let flag = true;
    let zip = new JSZip();
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        if (set.has(obj.name)) {
            alert("There are recordings of same name. please change the name!");
            flag = false;
            break;
        }
        set.add(obj.name);
        zip.file(obj.name + ".mp3", getBlob(obj.src));
    }

    if (flag) {
        zip.generateAsync({ type: "blob" }).then(function (content: string | Blob) {
            saveAs(content, "Sound.zip");
        });
    }
}

function getBlob(url: string) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
        };
        xhr.send();
    })
};

function visualize(stream: MediaStream) {
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
