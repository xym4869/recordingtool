import React, { useState } from "react";
import { AddRecord } from "./AddRecord";
import { v1 as uuidv1 } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
require('./RecordModel.scss');

export interface textItem {
  fileId: string;
    id: string;
    No: string;
  index: number;
  text: string;
  src: string;
  hasAudio: boolean
}

export interface fileItem {
  uid: string;
  name: string;
  text: Array<textItem>;
}

function getBlob(url: string): Promise<Blob> {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
        };
        xhr.send();
    });
}

export const RecordModel = () => {
    const [file, setFile] = useState({} as fileItem);
    const [item, setItem] = useState({} as textItem);
    const [zipDisabled, setZipDisabled] = useState(true);
    const [startAudio, setStartAudio] = useState(false);
    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(false);

    const readFile = (e: any) => {
        const reader = new FileReader();
        const input = e.target.files[0];
        reader.readAsText(input);
        reader.onload = function (e: any) {
            let text: string = e.target.result;
            if (text.length === 0) {
                alert("This text is empty. Please choose again!")
            } else {
                let arr = text.split("\n");
                let newArr = arr.filter(i => i && i.trim());
                let itemList: textItem[] = [];
                let fileId = uuidv1();
                let updateFile: boolean = true;
                newArr.forEach((newtext, index) => {
                    const newItemArray = newtext.split("\t");
                    let newNo: string;
                    let newTextTemp: string;
                    try {
                        if (newItemArray.length > 2) {
                            updateFile = false;
                            alert("Document Format Error")
                            throw "Document format error";
                        }
                    } catch (str) {
                        console.log(str);
                    }
                    if (newItemArray.length === 1) {
                        newTextTemp = newItemArray[0];
                        const newIndex = index + 1;
                        newNo = ("0000" + newIndex).substr(-4);

                    } else if (newItemArray.length === 2) {
                        newNo = newItemArray[0];
                        newTextTemp = newItemArray[1];
                    }
                    let newItem = {
                        fileId: fileId,
                        id: uuidv1(),
                        No: newNo,
                        index: index,
                        text: newTextTemp,
                        src: "",
                        hasAudio: false
                    };
                    itemList.push(newItem);
                });
                if (updateFile) {
                    if (newArr.length === 1) {
                        setNextDisabled(true)
                    }
                    let newFile = {
                        uid: fileId,
                        name: input.name,
                        text: itemList,
                    };
                    setFile(newFile);
                    setItem(newFile.text[0])
                    setStartAudio(true)
                    setZipDisabled(true)
                }
            }
        };
    };

    const handleAddAudio = (newItem: textItem) => {
        setItem(newItem);
        let fileTemp = file;
        fileTemp.text.forEach(
            currText => {
                if (currText.id === newItem.id) {
                    currText.src = newItem.src;
                    currText.hasAudio = newItem.hasAudio;
                }
            }
        )
        setFile(fileTemp);
        setZipDisabled(false);
    };

    const getPrevItem = () => {
        setNextDisabled(false);
        if (item.index === 1)
            setPrevDisabled(true)
        const newItem = file.text[item.index - 1];
        setItem(newItem);
    }

    const getNextItem = () => {
        setPrevDisabled(false);
        if (item.index === (file.text.length - 2))
            setNextDisabled(true)
        const newItem = file.text[item.index + 1];
        setItem(newItem);
    }

    const deleteItem = () => {
        let fileTemp = file;
        if (file.text.length === 2) {
            setPrevDisabled(true);
            setNextDisabled(true);
        }
        if (item.index === file.text.length - 1 || item.index === file.text.length - 2) {
            setNextDisabled(true);
        }

        if (fileTemp.text.length !== 1) {
            if (item.index === file.text.length - 1) {
                const newItem = file.text[file.text.length - 2];
                setItem(newItem);
            } else {
                const newItem = file.text[item.index + 1];
                setItem(newItem);
            }
        } else {
            setFile({} as fileItem);
            setItem({} as textItem);
            setZipDisabled(true);
            setPrevDisabled(true);
            setNextDisabled(false);
            setStartAudio(false);
        }

        fileTemp.text = fileTemp.text.filter((text: textItem) => text.id !== item.id)
        for (let i = item.index; i < fileTemp.text.length; i++) {
            fileTemp.text[i].index = i;
        }
        setFile(fileTemp);

        let tempDis = true;
        fileTemp.text.forEach(textItem => {
            if (textItem.hasAudio) {
                tempDis = false;
            }
        });
        setZipDisabled(tempDis);
    }

    const downloadTextFile = () => {
        const textTemp = file.text;
        let str: string = "";
        textTemp.forEach((text: textItem) => {
            str = str + text.No + "\t" + text.text + "\n";
        });
        const saveFile = new File([str], file.name, { type: "text/plain;charset=utf-8" })
        saveAs(saveFile);
    }

    const downloadAllRecord = () => {
        const data = file.text;
        let zip = new JSZip();
        for (let i = 0; i < data.length; i++) {
            const obj = data[i];
            if (obj.hasAudio) zip.file(obj.No + ".wav", getBlob(obj.src));
        }
        zip.generateAsync({ type: "blob" }).then(function (content: Blob) {
            saveAs(content, "Sound.zip");
        });
    }

    return (
    <div className="container">
          <h1 className="text-center">Recording Page</h1>
            <input
                type="file"
                id="tts-input-text"
                accept="text/plain"
                onChange={readFile}
                onClick={(e: any) => (e.target.value = null)} />
            <input
                type="button"
                id="tts-input-button"
                value="Select recording script"
                onClick={() => document.getElementById('tts-input-text').click()} />
            <input type="text" value={file.name} id="tts-inputFileAgent" />
            
          {startAudio &&
              <div>
                <div className="tts-recordItem">
                    <h2>
                        {item.index + 1 + "/" + file.text.length} <br /> {item.text}
                    </h2>
                      <AddRecord sentence={item} handleAddAudio={handleAddAudio} />
                      <button disabled={prevDisabled} onClick={getPrevItem}>
                          Prev
                    </button>
                      <button disabled={nextDisabled} onClick={getNextItem}>
                      Next
                    </button>
                      <button onClick={deleteItem}>
                          Delete
                    </button>
                </div>
                  <button onClick={downloadTextFile}>
                      Export .txt
                </button>
                  <button disabled={zipDisabled} onClick={downloadAllRecord}>
                    Export .zip
                </button>
              </div>}
    </div>
  );
};
