import { Component } from "react";
import * as React from 'react';
import { Button } from "antd";
import AudioAnalyser from "react-audio-analyser"

class AddRecord extends Component<any, any> {
    constructor(props : any) {
        super(props)
        this.state = {
            status: "",
            disable1: true,
            disable2: true
        }
        this.handleAddAudio = this.handleAddAudio.bind(this)
    }

    handleAddAudio(e: number) {
        const recordName = prompt("Enter a name for your sound?", "My unnamed sound");
        let src;
        let blob;
        if (e === 1) {
            src = this.state.audioSrc;
            blob = this.state.audioBlob;
        } else if (e === 2) {
            src = this.state.audioSrc2;
            blob = this.state.audioBlob2;
        } else {
            throw new Error('Error, No Record File!!');
        }
        this.props.handleAddAudio([recordName, src, blob])
    }

    controlAudio(status: any) {
        if (status === "inactive") {
            this.setState({
                disable1: false
            })
        } else {
            this.setState({
                disable1: true
            })
        }
        this.setState({
            status
        }, () => {
            console.log("status", this.state)
        })
    }

    controlAudio2(status2: any) {
        if (status2 === "inactive") {
            this.setState({
                disable2: false
            })
        } else {
            this.setState({
                disable2: true
            })
        }
        this.setState({
            status2
        }, () => {
            console.log("status2", this.state)
        })
    }

    changeScheme(e: any) {
        this.setState({
            audioType: e.target.value
        })
    }
        
    render() {
        const { status, status2, audioSrc, audioSrc2, audioType, audioBlob, audioBlob2 } = this.state;
        const audioProps = {
            audioType,
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
        const audioProps2 = {
            audioType,
            // audioOptions: {sampleRate: 30000}, // 设置输出音频采样率
            status: status2,
            audioSrc: audioSrc2,
            audioBlob: audioBlob2,
            timeslice: 1200, // 时间切片
            startCallback: (e: Blob) => {
                console.log("succ start2", e)
            },
            pauseCallback: (e: Blob) => {
                console.log("succ pause2", e)
            },
            stopCallback: (e: Blob) => {
                this.setState({
                    audioSrc2: window.URL.createObjectURL(e),
                    audioBlob2: e
                })
                console.log("succ stop2", e)
            },
            onRecordCallback: (e: Blob) => {
                console.log("recording2", e)
            },
            errorCallback: (err: string) => {
                console.log("error", err)
            }
        }
        return (
            <div>
                <AudioAnalyser {...audioProps} >
                    <div className="btn-box">
                        {status !== "recording" &&
                            <Button type={"primary"} 
                            onClick={() => this.controlAudio("recording")}>开始</Button>}
                        {status === "recording" &&
                            <Button type={"primary"}
                            onClick={() => this.controlAudio("paused")}>暂停</Button>}
                        <Button type={"primary"}
                            onClick={() => this.controlAudio("inactive")}>停止</Button>
                        <Button type={"primary"} disabled={this.state.disable1}
                            onClick={() => this.handleAddAudio(1)}>保存</Button>
                    </div>
                </AudioAnalyser>
                <AudioAnalyser {...audioProps2}>
                    <div className="btn-box">
                        {status2 !== "recording" &&
                            <Button type={"primary"}
                            onClick={() => this.controlAudio2("recording")}>开始</Button>}
                        {status2 === "recording" &&
                            <Button type={"primary"}
                            onClick={() => this.controlAudio2("paused")}>暂停</Button>}
                        <Button type={"primary"}
                            onClick={() => this.controlAudio2("inactive")}>停止</Button>
                        <Button type={"primary"} disabled={this.state.disable2}
                            onClick={() => this.handleAddAudio(2)}>保存</Button>
                    </div>
                </AudioAnalyser>
                <p>选择输出格式</p>
                <select name="" id="" onChange={(e) => this.changeScheme(e)} value={audioType}>
                    <option value="audio/webm">audio/webm（default）</option>
                    <option value="audio/wav">audio/wav</option>
                    <option value="audio/mp3">audio/mp3</option>
                </select>
            </div>
        );
    }
}
export default AddRecord;