import { useState } from "react";
import * as React from 'react';
import AudioAnalyser from "react-audio-analyser"

interface Props {
    startAudio: boolean;
    sentence: any;
    handleAddAudio: (state: object) => void;
}

export const AddRecord = (props: Props) => {
    const [status, setStatus] = useState("");
    const [disable, setDisable] = useState(true)
    const [audioSrc, setAudioSrc] = useState("")
    const [audioBlob, setAudioBlob] = useState(new Blob)

    const handleAddAudio = () => {
        props.handleAddAudio({
            fileId: props.sentence.fileId,
            id: props.sentence.id,
            src: audioSrc,
            blob: audioBlob
        })
    }


    const controlAudio = (status: any) => {
        if (status === "inactive") {
            setDisable(false)
        } else {
            setDisable(true)
        }
        setStatus(status)
        console.log("status", status)
    }

    const audioProps = {
        audioType: "audio/webm",
        audioOptions: { sampleRate: 24000 },
        status,
        audioSrc,
        audioBlob,
        timeslice: 1000,
        startCallback: (e: Blob) => {
            console.log("succ start", e)
        },
        pauseCallback: (e: Blob) => {
            console.log("succ pause", e)
        },
        stopCallback: (e: Blob) => {
            setAudioSrc(window.URL.createObjectURL(e))
            setAudioBlob(e)
            console.log("succ stop", e)
        },
        onRecordCallback: (e: Blob) => {
            console.log("recording", e)
        },
        errorCallback: (err: string) => {
            console.log("error", err)
        }
    }

    return (
        <div>
            {!props.startAudio ? <p>Tips: Click the sentence text to select it.</p> :
                <div>
                    <p>{props.sentence.text}</p>
                    <AudioAnalyser {...audioProps} >
                        <div className="btn-box">
                            {status !== "recording" &&
                                <button
                                    onClick={() => controlAudio("recording")}>Start</button>}
                            {status === "recording" &&
                                <button
                                onClick={() => controlAudio("paused")}>Pause</button>}
                                <button
                                onClick={() => controlAudio("inactive")}>Stop</button>
                            <button disabled={disable}
                                onClick={handleAddAudio}>Save</button>
                        </div>
                    </AudioAnalyser>
                </div>
            }
        </div>
    );
};