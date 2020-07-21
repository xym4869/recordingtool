import { Component } from "react";
import * as React from 'react';
import AudioItem from "./AudioItem"

class RecordList extends Component<any, any> {
    constructor(props: any) {
        super(props)
    }
    render() {
        let audioList = this.props.list.map((listItem: { id: string; name: string; src: string; blob: Blob}) =>
            <AudioItem audioId={listItem.id}
                key={listItem.id}
                name={listItem.name}
                src={listItem.src}
                changeName={this.props.changeName}
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