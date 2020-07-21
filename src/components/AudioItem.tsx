import { Component } from "react";
import * as React from 'react';
import { Row, Col} from 'antd';

class AudioItem extends Component<any, any> {
    constructor(props:any) {
        super(props)
        this.state = {
            name: this.props.name
        }
        this.deleteAudio = this.deleteAudio.bind(this)
        this.changeName = this.changeName.bind(this)
    }
    deleteAudio() {
        this.props.deleteRecord(this.props.audioId)
    }
    changeName() {
        const newName = prompt("Enter a new name for your sound clip?");
        if (newName !== null) {
            this.setState({
                name: newName
            })
        }
        this.props.changeName([this.props.audioId, newName])
    }
    render() {
        return(
            <li className="list-group-item">
                <Row>
                    <Col span={12}>
                        <p onClick={this.changeName}> {this.state.name} </p>
                    </Col>
                    <Col span={12}>
                        <audio controls src={this.props.src}/>
                    </Col>
                    <Col span={12}>
                        <button className="pull-right" onClick={this.deleteAudio}>删除</button>
                    </Col>
                </Row>
            </li>
            )
    }
}
export default AudioItem;