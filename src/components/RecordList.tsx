import { Component } from "react";
import * as React from 'react';
import AudioItem from "./AudioItem"

class RecordList extends Component<any, any> {
    constructor(props: any) {
        super(props)
    }
    render() {
        let audioList = this.props.list.map((listItem: { id: string; index: number; text: string; src: string; blob: Blob; audio: boolean }) =>
            <AudioItem Id={listItem.id}
                key={listItem.id}
                index={listItem.index}
                text={listItem.text}
                src={listItem.src}
                blob={listItem.blob}
                audio={listItem.audio}
                selectSentence={this.props.selectSentence}
                deleteRecord={this.props.deleteRecord}/>
        )
        return (
            <ul className="list-group">
                {audioList}
            </ul>
            )
    }
}
export default RecordList;