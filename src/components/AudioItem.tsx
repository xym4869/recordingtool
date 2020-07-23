import { Component } from "react";
import * as React from 'react';
import { Row, Col} from 'antd';

class AudioItem extends Component<any, any> {
    constructor(props:any) {
        super(props)
        this.state = {
        }
        this.deleteAudio = this.deleteAudio.bind(this)
        this.selectSentence = this.selectSentence.bind(this)
    }
    selectSentence() {
        this.props.selectSentence(this.props.Id)
    }

    deleteAudio() {
        this.props.deleteRecord(this.props.Id)
    }

    downloadAudio() {
        saveAs(this.props.blob, this.props.index + ".webm")
    }

    render() {
        const index = this.props.index + 1;
        return(
            <li className="sentence">
                <Row>
                    <Col span={12}>
                        <p> {index  + '.' + this.props.text} </p>
                    </Col>
                    <Col span={12}>
                        {!this.props.audio ?
                            <p>This voice is not recorded</p>: 
                            <audio controls src={this.props.src} />}
                    </Col>
                    <Col span={12}>
                        <button onClick={this.selectSentence}>select</button>
                        <button className="deleteSentect" onClick={this.deleteAudio}>delete</button>
                        {this.props.audio && <button onClick={this.downloadAudio.bind(this)}>download</button>}
                    </Col>
                </Row>
            </li>
            )
    }
}
export default AudioItem;