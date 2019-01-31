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
                newList.push({ id: null, deleted: false })
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

    deleteBinary (index: number) {
        const promise = new Promise((resolve, reject) => {
            axios.delete(`${baseUrl}Binary/${this.state.list[index].id}?_format=json`)
            .then((response: any) => {
                this.setState(() => {
                    const updatedList = _.clone(this.state.list)
                    updatedList[index] = { id: null, deleted: true }
                    return { list: updatedList }
                })
                this.getBinaryCount()
                resolve(response.data.id)
            }).catch((error: any) => {
                reject(error)
            })
        })
        return promise
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
                if (!this.state.list[index].deleted) {
                    return <div className="row" key={index}><p>{file.name}</p>{this.renderRowStatus(index)}{this.renderRowDelete(index)}</div>
                }
            })
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

    renderRowDelete (index: number) {
        if (!this.state.list[index].deleted) {
            return (
                <button onClick={() => this.deleteBinary(index)}>Cancel</button>
            )
        }
    }

    renderRowStatus (index: number) {
        return (
            <p>
                <span>
                    {this.state.list[index].id ? 'Uploaded' : 'In progress'}
                </span>
            </p>
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
                    updatedList[index] = { id: response.data.id }
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
