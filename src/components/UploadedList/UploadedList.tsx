import * as React from 'react'
import * as _ from 'underscore'
import axios from 'axios'

import './UploadedList.scss'

const baseUrl = 'https://fhirtest.uhn.ca/baseDstu3/'

interface Props {
    list: FileList | null
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
            <table className="uploadedlist">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th colSpan={2}>&nbsp;</th>
                    </tr>
                    {this.renderRow()}
                    {this.renderRowBinaryCount()}
                </tbody>
            </table>
        )
    }

    renderRow () {
        if (this.props.list) {
            return Array.from(this.props.list).map((file: File, index: number) => {
                return <tr key={index}><td>{file.name}</td>{this.renderRowButton(file, index)}{this.renderRowStatus(index)}</tr>
            })
        } else {
            return <tr><td colSpan={3}>No file</td></tr>
        }
    }

    renderRowBinaryCount () {
        if (this.state.binaryCount) {
            return (
                <tr>
                    <td colSpan={2}>Binaries currently on the server</td>
                    <td>{this.state.binaryCount}</td>
                </tr>
            )
        } else {
            return <tr><td colSpan={3}>&nbsp;</td></tr>
        }
    }

    renderRowButton (file: File, index: number) {
        return (
            <td>
                <button onClick={() => this.uploadFile(file, index)} disabled={this.state.list[index].isSent}>Upload this file</button>
            </td>
        )
    }

    renderRowStatus (index: number) {
        return (
            <td>
                {this.state.list[index].isSent ? 'Uploaded' : 'Not uploaded'}
            </td>
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
