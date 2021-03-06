﻿import { useState, useEffect } from "react";
import * as React from "react";
import AudioAnalyser from "react-audio-analyser";
import { textItem } from "./RecordModel";
import { resampler } from "./audio-resampler";
import { audioBufferToWav } from "./audiobuffer-to-wav";

interface Props {
    sentence: textItem;
    handleAddAudio: (state: textItem) => void;
}

export const AddRecord = (props: Props) => {
    const [status, setStatus] = useState("");
    const [audioSrc, setAudioSrc] = useState(props.sentence.src);
    const [hasAudio, setHasAudio] = useState(props.sentence.hasAudio);

    useEffect(() => {
        setAudioSrc(props.sentence.src);
        setHasAudio(props.sentence.hasAudio);
    }, [props]);

    const controlAudio = (status: string) => {
        if (status == "inactive")
            setHasAudio(true);
        setStatus(status);
        console.log("status", status);
    };

    const handleAudioResample = (src: string) => {
        const targetSampleRate = 16000;
        resampler(src, targetSampleRate, function (event: any) {
            //return audioBuffer
            const audioBuffer = event.getAudioBuffer();
            //Add Wav Header in AudioBuffer
            const audioWavBuffer = audioBufferToWav(audioBuffer);

            //Or return blob url
            const audioURL = event.getFileURL();
        });
    };

    const audioProps = {
        audioType: "audio/wav",
        //audioOptions: { sampleRate: 16000 },
        status,
        audioSrc: audioSrc,
        audioBlob: new Blob(),
        timeslice: 1000,
        startCallback: (e: Blob) => {
            console.log("succ start", e);
        },
        pauseCallback: (e: Blob) => {
            console.log("succ pause", e);
        },
        stopCallback: (e: Blob) => {
            const src = window.URL.createObjectURL(e)
            setAudioSrc(src);
            const newItem: textItem = {
                fileId: props.sentence.fileId,
                id: props.sentence.id,
                No: props.sentence.No,
                index: props.sentence.index,
                text: props.sentence.text,
                src: src,
                hasAudio: true
            }
            props.handleAddAudio(newItem);
            console.log("succ stop", e);
            //handleAudioResample(src);
        },
        onRecordCallback: (e: Blob) => {
            console.log("recording", e);
        },
        errorCallback: (err: string) => {
            console.log("error", err);
        },
    };

    return (
        <div>
            <div>
                <AudioAnalyser {...audioProps}>
                    <div className="btn-box">
                        {status !== "recording"
                            && !hasAudio
                            && < button onClick={() => controlAudio("recording")}>Start</button>}
                        {status !== "recording"
                            && hasAudio
                            && < button onClick={() => controlAudio("recording")}>ReRecord</button>}
                        {status === "recording" && <button onClick={() => controlAudio("paused")}>Pause</button>}
                        <button onClick={() => controlAudio("inactive")}>Stop</button>
                    </div>
                </AudioAnalyser>
            </div>
        </div>
    );
};