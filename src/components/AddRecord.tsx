import { useState, useEffect } from "react";
import * as React from "react";
import AudioAnalyser from "react-audio-analyser";
import { textItem } from "./RecordModel";

interface Props {
  sentence: textItem;
  handleAddAudio: (state: object) => void;
}

export const AddRecord = (props: Props) => {
  const [status, setStatus] = useState("");
    const [audioSrc, setAudioSrc] = useState(props.sentence.src);
    const [hasAudio, setHasAudio] = useState(props.sentence.hasAudio);
    const [disabled, setDisabled] = useState(!props.sentence.hasAudio);

    useEffect(() => {
        setAudioSrc(props.sentence.src);
        setHasAudio(props.sentence.hasAudio);
        setDisabled(!props.sentence.hasAudio);
    }, [props]);

    const handleAddAudio = () => {
        setHasAudio(true);
        const newItem: textItem = {
            fileId: props.sentence.fileId,
            id: props.sentence.id,
            index: props.sentence.index,
            text: props.sentence.text,
            src: audioSrc,
            hasAudio: true
        }
        props.handleAddAudio(newItem);
    };

    const controlAudio = (status: string) => {
        if (status === "inactive") {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
        setStatus(status);
        console.log("status", status);
    };

  const audioProps = {
    audioType: "audio/webm",
    audioOptions: { sampleRate: 24000 },
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
          setAudioSrc(window.URL.createObjectURL(e));
      console.log("succ stop", e);
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
              <p>{props.sentence.index + 1 + "." + props.sentence.text}</p>
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
                      <button disabled={disabled} onClick={handleAddAudio}>Save</button>
            </div>
            </AudioAnalyser>
        </div>
    </div>
  );
};
