import { audioBufferToWav } from "./audiobuffer-to-wav";

const getArrayBuffer = (url: string): Promise<ArrayBuffer> => {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
        };
        xhr.send();
    });
};

export const resampleAudioBuffer = (audioBuffer: AudioBuffer, targetSampleRate: number, oncomplete: Function) => {
    const numCh_ = audioBuffer.numberOfChannels;
    const numFrames_ = (audioBuffer.length * targetSampleRate) / audioBuffer.sampleRate;

    let offlineContext_ = new OfflineAudioContext(numCh_, numFrames_, targetSampleRate);
    let bufferSource_ = offlineContext_.createBufferSource();
    bufferSource_.buffer = audioBuffer;

    offlineContext_.oncomplete = function (event) {
        const resampeledBuffer = event.renderedBuffer;
        if (typeof oncomplete === "function") {
            oncomplete({
                getAudioBuffer: function () {
                    return resampeledBuffer;
                },
                getFileURL: function () {
                    const wavBlob = new Blob([new DataView(audioBufferToWav(resampeledBuffer))], {
                        type: "audio/wav",
                    });
                    return URL.createObjectURL(wavBlob);
                },
            });
        }
    };
    bufferSource_.connect(offlineContext_.destination);
    bufferSource_.start(0);
    offlineContext_.startRendering();
};

export const resampler = (src: string, targetSampleRate: number, oncomplete: Function) => {
    const audioContext = new AudioContext();
    getArrayBuffer(src).then(arrayBuffer => {
        audioContext.decodeAudioData(arrayBuffer, function (audioBeforeBuffer) {
            resampleAudioBuffer(audioBeforeBuffer, targetSampleRate, function (event: any) {
                if (typeof oncomplete === "function") {
                    oncomplete({
                        getAudioBuffer: function () {
                            return event.getAudioBuffer();
                        },
                        getFileURL: function () {
                            return event.getFileURL();
                        },
                    });
                }
            });
        });
    });
};
