import * as chokidar from 'chokidar'
import * as fs from 'fs'
import * as React from 'react'
import * as _ from 'underscore'

import UploadedList from '../UploadedList/UploadedList'
import './DropZone.scss'

interface State {
    files: File[] | null
}

export default class DropZone extends React.Component<{}, State> {
    private fhirPath = 'FHIR'
    private homePath = require('os').homedir()
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
                    <p>
                        <strong>Drop your file</strong><br />
                        or<br />
                        <strong>click here to browse your folders</strong>
                    </p>
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

    componentWillMount () {
        this.initFHIRWatching()
    }

    convertFilelistToArray (filelist: FileList | null) {
        if (filelist) {
            const convertedArray: File[] = []
            Array.from(filelist).map((file: File, index: number) => {
                convertedArray.push(file)
            })
            return convertedArray
        } else {
            return null
        }
    }

    filterFiles (files: string[]) {
        const promise = new Promise((resolve, reject) => {
            const acceptedFiles = files.filter((file) => {
                const extension = '.pdf'
                const regex = new RegExp(extension + '$')
                const stats = fs.statSync(file.indexOf('/FHIR') !== -1 ? file : `${this.homePath}/${this.fhirPath}/${file}`)
                return regex.test(file) && stats.size <= 2000000
            })
            if (acceptedFiles.length) {
                const fileArray: File[] = []
                _.each(acceptedFiles, (file) => {
                    const data = fs.readFileSync(file.indexOf('/FHIR') !== -1 ? file : `${this.homePath}/${this.fhirPath}/${file}`, { encoding: 'utf-8' })
                    const f = new File([data], file, {
                        type: 'application/pdf'
                    })
                    fileArray.push(f)
                })
                this.uploadFiles(fileArray)
            }
            resolve(acceptedFiles)
        })
        return promise
    }

    initFHIRWatching () {
        this.readInFHIRDirectory().then(() => {
            this.watchFHIRDirectory()
        })
    }

    onClickFile ($event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
        this.inputElement.current.click()
    }

    onDragOver ($event: React.DragEvent<HTMLDivElement>) {
        $event.preventDefault()
    }

    onDropFile ($event: React.DragEvent<HTMLDivElement>): void {
        $event.preventDefault()
        this.uploadFiles(this.convertFilelistToArray($event.dataTransfer.files))
    }

    onFileChanged ($event: React.ChangeEvent<HTMLInputElement>) {
        this.uploadFiles(this.convertFilelistToArray($event.target.files))
    }

    readInFHIRDirectory () {
        const promise = new Promise((resolve, reject) => {
            fs.readdir(`${this.homePath}/${this.fhirPath}`, (err: any, files: string[]) => {
                if (err) {
                    alert(err)
                    reject(err)
                    return
                }
                this.filterFiles(files).then(() => {
                    resolve('Reading FHIR directory : OK')
                })
            })
        })
        return promise
    }

    uploadFiles (files: File[] | null) {
        if (files && files.length) {
            this.setState({ files })
        }
    }

    watchFHIRDirectory () {
        chokidar.watch(`${this.homePath}/${this.fhirPath}`, {
            persistent: true
        }).on('change', (path: string) => {
            this.filterFiles([path])
        })
    }
}
