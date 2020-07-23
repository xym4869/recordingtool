import { Component } from "react";
import * as React from 'react';
import { Button } from "antd";
import AudioAnalyser from "react-audio-analyser"

class AddRecord extends Component<any, any> {
    constructor(props : any) {
        super(props)
        this.state = {
            status: "",
            disable: true,
        }
        this.handleAddAudio = this.handleAddAudio.bind(this)
    }

    handleAddAudio() {
        let src = this.state.audioSrc;
        let blob = this.state.audioBlob;
        this.props.handleAddAudio({ id: this.props.sentence.id, src: src, blob: blob })
    }

    controlAudio(status: any) {
        if (status === "inactive") {
            this.setState({
                disable: false
            })
        } else {
            this.setState({
                disable: true
            })
        }
        this.setState({
            status
        }, () => {
            console.log("status", this.state)
        })
    }
        
    render() {
        const { status, audioSrc, audioBlob} = this.state;
        const audioProps = {
            audioType: "audio/webm",
            // audioOptions: {sampleRate: 30000}, // 设置输出音频采样率
            status,
            audioSrc,
            audioBlob,
            timeslice: 1000, // 时间切片
            startCallback: (e: Blob) => {
                console.log("succ start", e)
            },
            pauseCallback: (e: Blob) => {
                console.log("succ pause", e)
            },
            stopCallback: (e: Blob) => {
                this.setState({
                    audioSrc: window.URL.createObjectURL(e),
                    audioBlob: e
                })
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
                {!this.props.startAudio ? <p>Tips: Click the sentence text to select it.</p> :
                    <div>
                        <p>{this.props.sentence.text}</p>
                        <AudioAnalyser {...audioProps} >
                            <div className="btn-box">
                                {status !== "recording" &&
                                    <Button type={"primary"} 
                                    onClick={() => this.controlAudio("recording")}>Start</Button>}
                                {status === "recording" &&
                                    <Button type={"primary"}
                                    onClick={() => this.controlAudio("paused")}>Pause</Button>}
                                <Button type={"primary"}
                                    onClick={() => this.controlAudio("inactive")}>Stop</Button>
                                <Button type={"primary"} disabled={this.state.disable}
                                    onClick={this.handleAddAudio}>Save</Button>
                            </div>
                        </AudioAnalyser>
                        </div>
                }
            </div>
        );
    }
}
export default AddRecord;