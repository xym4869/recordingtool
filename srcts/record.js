"use strict";
exports.__esModule = true;
//var JSZip = require("jszip");
//var file_saver_1 = require("file-saver");
// set up basic variables for app
var record = document.querySelector(".record");
var stopRecord = document.querySelector(".stopRecord");
var record2 = document.querySelector(".record2");
var stopRecord2 = document.querySelector(".stopRecord2");
var down = document.querySelector(".down");
var soundClips = document.querySelector(".sound-clips");
var canvas = document.querySelector(".visualizer");
var mainSection = document.querySelector(".main-controls");
// disable stop button while not recording
stopRecord.disabled = true;
stopRecord2.disabled = true;
down.disabled = true;
// visualiser setup - create web audio api context and canvas
var audioCtx;
var canvasCtx = canvas.getContext("2d");
//main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.");
    var constraints = { audio: true };
    var chunks_1 = [];
    var onSuccess = function (stream) {
        var mediaRecorder = new MediaRecorder(stream);
        visualize(stream);
        record.onclick = function () {
            mediaRecorder.start();
            console.log(mediaRecorder.state);
            console.log("recorder started");
            record.style.background = "red";
            stopRecord.disabled = false;
            record.disabled = true;
        };
        stopRecord.onclick = function () {
            mediaRecorder.stop();
            console.log(mediaRecorder.state);
            console.log("recorder stopped");
            record.style.background = "";
            record.style.color = "";
            // mediaRecorder.requestData();
            stopRecord.disabled = true;
            record.disabled = false;
        };
        record2.onclick = function () {
            mediaRecorder.start();
            console.log(mediaRecorder.state);
            console.log("recorder started");
            record2.style.background = "red";
            stopRecord2.disabled = false;
            record2.disabled = true;
        };
        stopRecord2.onclick = function () {
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
            var data = [];
            var n = soundClips.children.length;
            for (var i = 0; i < n; i++) {
                var child = soundClips.children[i];
                var fileName = child.children[1].textContent;
                var src = child.children[0].src;
                var file = {
                    name: fileName,
                    src: src
                };
                data.push(file);
            }
            compile(data);
        };
        mediaRecorder.onstop = function () {
            down.disabled = false;
            console.log("data available after MediaRecorder.stop() called.");
            var clipName = prompt("Enter a name for your sound?", "My unnamed sound");
            var clipContainer = document.createElement("article");
            var clipLabel = document.createElement("p");
            var audio = document.createElement("audio");
            var deleteButton = document.createElement("button");
            clipContainer.classList.add("clip");
            audio.setAttribute("controls", "");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete";
            if (clipName === null) {
                clipLabel.textContent = "My unnamed sound";
            }
            else {
                clipLabel.textContent = clipName;
            }
            clipContainer.appendChild(audio);
            clipContainer.appendChild(clipLabel);
            clipContainer.appendChild(deleteButton);
            soundClips.appendChild(clipContainer);
            audio.controls = true;
            var blob = new Blob(chunks_1, { type: "audio/mp3; codecs=opus" });
            chunks_1 = [];
            var audioURL = window.URL.createObjectURL(blob);
            audio.src = audioURL;
            console.log("recorder stopped");
            deleteButton.onclick = function (e) {
                var evtTgt = e.target;
                evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
                if (evtTgt.parentNode.parentNode.children.length === 0)
                    down.disabled = true;
            };
            clipLabel.onclick = function () {
                var existingName = clipLabel.textContent;
                var newClipName = prompt("Enter a new name for your sound clip?");
                if (newClipName === null) {
                    clipLabel.textContent = existingName;
                }
                else {
                    clipLabel.textContent = newClipName;
                }
            };
        };
        mediaRecorder.ondataavailable = function (e) {
            chunks_1.push(e.data);
        };
    };
    var onError = function (err) {
        console.log("The following error occured: " + err);
    };
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
}
else {
    console.log("getUserMedia not supported on your browser!");
}
function compile(data) {
    var set = new Set();
    var flag = true;
    var zip = new JSZip();
    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        if (set.has(obj.name)) {
            alert("There are recordings of same name. please change the name!");
            flag = false;
            break;
        }
        set.add(obj.name);
        zip.file(obj.name + ".mp3", getBlob(obj.src));
    }
    if (flag) {
        zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, "Sound.zip");
        });
    }
}
function getBlob(url) {
    return new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
        };
        xhr.send();
    });
}
;
function visualize(stream) {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    var source = audioCtx.createMediaStreamSource(stream);
    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);
    //analyser.connect(audioCtx.destination);
    draw();
    function draw() {
        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        canvasCtx.fillStyle = "rgb(200, 200, 200)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(0, 0, 0)";
        canvasCtx.beginPath();
        var sliceWidth = (WIDTH * 1.0) / bufferLength;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = (v * HEIGHT) / 2;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            }
            else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
}
window.onresize = function () {
    canvas.width = mainSection.offsetWidth;
};
