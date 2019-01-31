import * as React from 'react'
import * as _ from 'underscore'
import axios from 'axios'

import './UploadedList.scss'

const baseUrl = 'https://fhirtest.uhn.ca/baseDstu3/'

interface Props {
    list: File[] | null
}

interface State {
    binaryCount: number,
    list: any[]
}

export default class UploadedList extends React.Component<Props, State> {
    constructor (props: any) {
        super(props)
        this.state = {
            binaryCount: 0,
            list: []
        }
        this.uploadFile = this.uploadFile.bind(this)
    }

    static getDerivedStateFromProps (nextProps: Props, prevState: State) {
        if (nextProps.list && nextProps.list.length && prevState.list.length !== nextProps.list.length) {
            const newList: any[] = []
            _.each(nextProps.list, () => {
                newList.push({ isSent: false })
            })
            return { list: newList }
        } else {
            return null
        }
    }

    componentDidUpdate (prevProps: Props) {
        if (this.props.list !== prevProps.list && this.props.list) {
            _.each(this.props.list, (file: File, index: number) => {
                this.uploadFile(file, index)
            })
        }
    }

    getBinaryCount () {
        const promise = new Promise((resolve, reject) => {
            axios.get(`${baseUrl}Binary?_pretty=true&_summary=count`)
            .then((response) => {
                this.setState({ binaryCount: response.data.total })
                resolve(response.data.total)
            }).catch((error) => {
                reject(error)
            })
        })
        return promise
    }

    render () {
        return (
            <div className="uploadedlist">
                {this.renderRow()}
                {this.renderRowBinaryCount()}
            </div>
        )
    }

    renderRow () {
        if (this.props.list) {
            return this.props.list.map((file: File, index: number) => {
                return <div className="row" key={index}><p>{file.name}</p><p>{this.renderRowStatus(index)}</p></div>
            })
        } else {
            return <div className="row row-empty"><p>No file</p></div>
        }
    }

    renderRowBinaryCount () {
        if (this.state.binaryCount) {
            return (
                <div className="row row-end">
                    <p>Binaries currently on the server</p>
                    <p>
                        <span>{this.state.binaryCount}</span>
                    </p>
                </div>
            )
        }
    }

    renderRowStatus (index: number) {
        return (
            <span>
                {this.state.list[index].isSent ? 'Uploaded' : 'In progress'}
            </span>
        )
    }

    uploadFile (file: File, index: number) {
        const promise = new Promise((resolve, reject) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('resourceType', 'Binary')
            const config = {
                headers: {
                    'content-type': 'application/fhir+json'
                }
            }
            axios.post(`${baseUrl}Binary?_format=json`, formData, config)
            .then((response) => {
                this.setState(() => {
                    const updatedList = _.clone(this.state.list)
                    updatedList[index] = { isSent: true }
                    return { list: updatedList }
                })
                this.getBinaryCount()
                resolve(response.data.id)
            }).catch((error) => {
                reject(error)
            })
        })
        return promise
    }
}
