import { Component } from "react";
import * as React from 'react';
import AddRecord from "./AddRecord";
import RecordList from "./RecordList";
import DownloadZip from "./DownloadZip"
import ReadText from "./ReadText"
import Item from "antd/lib/list/Item";

class RecordModel extends Component<any,any> {
    constructor(props: any) {
        super(props);
        this.state = {
            item: {},
            list: [],
            disabled: true,
            startAudio: false
        }
        this.handleAddText = this.handleAddText.bind(this)
        this.handleDeleteRecord = this.handleDeleteRecord.bind(this);
        this.handleAddAudio = this.handleAddAudio.bind(this);
        this.selectSentence = this.selectSentence.bind(this)
    }

    selectSentence(id: string) {
        let list = this.state.list;
        list = list.filter((sentence: { id: string }) => sentence.id === id)
        this.setState({
            item: list[0],
            startAudio: true
        })
    }

    handleAddText(textList: any) {
        let list: { id: string, index: number; text: string; src: string; blob: Blob; audio: boolean }[] = [];
        let textArray = textList.text;
        textArray.forEach((text: string, index: number) => {
            let Item = {
                id: this.generateGUID(),
                index: index,
                text: text,
                src: "",
                blob: new Blob,
                audio: false
            }
            list.push(Item)
        })
        this.setState({
            list
        })
    }

    handleDeleteRecord(recordId:string) {
        let list = this.state.list;
        list = list.filter((record: { id: string; }) => record.id !== recordId)
        this.setState({ list })
        if (this.state.item.id === recordId)
            this.setState({ item: {}, startAudio: false})
        let d = true
        list.forEach((item: { audio: any; }) => {
            if (item.audio)
                d = false;
        })
        this.setState({
            disabled: d
        })
    }

    handleAddAudio(audio: any) {
        let list = this.state.list;
        list.forEach((item: any) => {
            if (item.id === audio.id) {
                item.src = audio.src;
                item.blob = new Blob([audio.blob], { type: "audio/webm" });
                item.audio = true;
            }
        })
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
                <h1 className="text-center">Record Page</h1>
                <ReadText handleText={this.handleAddText} />
                <AddRecord startAudio={this.state.startAudio} sentence={this.state.item} handleAddAudio={this.handleAddAudio} />
                <DownloadZip list={this.state.list} disabled={this.state.disabled}/>
                <RecordList list={this.state.list} selectSentence={this.selectSentence} deleteRecord={this.handleDeleteRecord}/>
            </div>
            )
    }
}

export default RecordModel;
