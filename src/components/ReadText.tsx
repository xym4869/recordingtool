import { Component } from "react";
import * as React from 'react';
import { List, Input, Button } from "antd"

class ReadText extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            fileList: []
        }
    }

    readFile(e: any) {
        const reader = new FileReader();
        let input = e.target.files[0];
        reader.readAsText(input);
        reader.onload = function (e: { target: { result: any; }; }) {
            let text = e.target.result;
            let arr = (text as string).split("\n");
            let newArr = arr.filter(i => i && i.trim())
            let item = {
                uid: this.generateGUID(),
                name: input.name,
                text: newArr
            }
            let list = this.state.fileList;
            list.push(item);
            this.setState({ fileList: list });
        }.bind(this);
    }

    //read(e: any) {
    //    let input = e.target.files[0];
    //    fs.readFile(input.name, { encoding: 'utf-8' }, function (err, data) {
    //        let arr = data.split("\n");
    //        let item = {
    //            uid: this.generateGUID(),
    //            name: input.name,
    //            text: arr
    //        }
    //        let list = this.state.fileList;
    //        list.push(item);
    //        this.setState({ list });
    //    })
    //}

    load(name: string) {
        let xhr = new XMLHttpRequest(),
            okStatus = document.location.protocol === "file:" ? 0 : 200;
        xhr.open('GET', name, false);
        xhr.overrideMimeType("text/html;charset=utf-8");//默认为utf-8
        xhr.send(null);
        return xhr.status === okStatus ? xhr.responseText : null;
    }

    
    uploadFile(file: File) {
        return new Promise(function (resolve, reject) {
            let reader = new FileReader()
            reader.readAsText(file)
            reader.onload = function () {
                resolve(this.result)
            }
        })
    }

    selectFile(uid: string) {
        let list = this.state.fileList;
        list = list.filter((file: { uid: string; }) => file.uid === uid)
        console.log(list.text)
        this.props.handleText(list[0])
    }

    deleteFile(uid: string) {
        let list = this.state.fileList;
        list = list.filter((file: { uid: string; }) => file.uid !== uid)
        this.setState({ fileList:list });
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
            <div>
                <Input type="file" title='select .txt file'
                    accept='text/plain' onChange={this.readFile.bind(this)} />
                {this.state.fileList.length !== 0 && 
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.fileList}
                    renderItem={(item: { uid: string; name: string; }) => (
                        <List.Item actions={[<Button onClick={() => this.selectFile(item.uid)}>select</Button>,
                            <Button onClick={() => this.deleteFile(item.uid)}>delete</Button>]}>
                            {item.name}
                        </List.Item>
                    )}
                    />}
                </div>
            )
    }
}
export default ReadText;