import { Component } from "react";
import * as React from 'react';
import AddRecord from "./AddRecord";
import RecordList from "./RecordList";
import DownloadZip from "./DownloadZip"

class RecordModel extends Component<any,any> {
    constructor(props: any) {
        super(props);
        this.state = {
            list: [],
            disabled : true
        }
        this.handleDeleteRecord = this.handleDeleteRecord.bind(this);
        this.handleAddAudio = this.handleAddAudio.bind(this);
        this.changeName = this.changeName.bind(this)
    }

    changeName(audioName: any) {
        let list = this.state.list;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === audioName[0])
                list[i].name = audioName[1]
        }
        this.setState({ list })
    }

    handleDeleteRecord(recordId:string) {
        let list = this.state.list;
        list = list.filter((record: { id: string; }) => record.id !== recordId)
        this.setState({ list })
        if (list.length === 0) {
            this.setState({
                disabled: true
            })
        }
    }

    handleAddAudio(audio: any) {
        let list = this.state.list;
        let newItem = {
            id: this.generateGUID(),
            name: audio[0],
            src: audio[1],
            blob: audio[2]
        }
        list = list.concat([newItem])
        this.setState({
            list: list,
            disabled: false
            })
    }

    generateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }

    render() {
        return (
            <div className="container">
                <h1 className="text-center">Recorder Page</h1>
                <AddRecord handleAddAudio={this.handleAddAudio} />
                <DownloadZip list={this.state.list} disabled={this.state.disabled}/>
                <RecordList list={this.state.list} changeName={this.changeName} deleteRecord={this.handleDeleteRecord}/>
            </div>
            )
    }
}

export default RecordModel;
