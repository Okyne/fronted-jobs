import * as React from 'react'

import UploadedList from '../UploadedList/UploadedList'
import './DropZone.scss'

interface State {
    files: FileList | null
}

export default class DropZone extends React.Component<{}, State> {
    private inputElement: any
    public state: State

    constructor (props: any) {
        super(props)
        this.state = {
            files: null
        }
        this.inputElement = React.createRef()
        this.onClickFile = this.onClickFile.bind(this)
        this.onDropFile = this.onDropFile.bind(this)
        this.onFileChanged = this.onFileChanged.bind(this)
    }

    render () {
        return (
            <section>
                <div
                    className="dropzone"
                    onDragOver={this.onDragOver}
                    onDrop={this.onDropFile}
                    onClick={this.onClickFile}
                >
                    <p>Drop your file or click here to browse your folders</p>
                    <input
                        type="file"
                        multiple={true}
                        ref={this.inputElement}
                        onChange={this.onFileChanged}
                    />
                </div>
                <UploadedList list={this.state.files} />
            </section>
        )
    }

    onClickFile ($event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        this.inputElement.current.click()
    }

    onDragOver ($event: React.DragEvent<HTMLDivElement>) {
        $event.preventDefault()
    }

    onDropFile ($event: React.DragEvent<HTMLDivElement>): void {
        $event.preventDefault()
        this.uploadFiles($event.dataTransfer.files)
    }

    onFileChanged ($event: React.ChangeEvent<HTMLInputElement>) {
        console.log($event.target.files)
        this.uploadFiles($event.target.files)
    }

    uploadFiles (files: FileList | null) {
        if (files) {
            this.setState({ files })
        }
    }
}
