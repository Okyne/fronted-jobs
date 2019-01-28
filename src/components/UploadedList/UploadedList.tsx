import * as React from 'react'
import * as _ from 'underscore'
import axios from 'axios'

import './UploadedList.scss'

interface Props {
    list: FileList | null
}

interface State {
    list: any[]
}

export default class UploadedList extends React.Component<Props, State> {
    constructor (props: any) {
        super(props)
        this.state = {
            list: []
        }
        this.uploadFile = this.uploadFile.bind(this)
    }

    componentWillReceiveProps (props: Props) {
        Array.prototype.forEach.call(props.list, () => {
            this.setState({ list: [...this.state.list, { isSent: false }] })
        })
    }

    render () {
        return (
            <table className="uploadedlist">
                <tbody>
                    <tr>
                        <th colSpan={3}>Name</th>
                    </tr>
                    {this.renderFileItems()}
                </tbody>
            </table>
        )
    }

    renderButton (file: File, index: number) {
        return (
            <td>
                <button onClick={() => this.uploadFile(file, index)} disabled={this.state.list[index].isSent}>Upload this file</button>
            </td>
        )
    }

    renderStatus (index: number) {
        return (
            <td>
                {this.state.list[index].isSent ? 'Uploaded' : 'Not uploaded'}
            </td>
        )
    }

    renderFileItems () {
        if (this.props.list) {
            return Array.from(this.props.list).map((file: File, index: number) => {
                return <tr key={index}><td>{file.name}</td>{this.renderButton(file, index)}{this.renderStatus(index)}</tr>
            })
        } else {
            return <tr><td colSpan={3}>No file</td></tr>
        }
    }

    uploadFile (file: File, index: number) {
        const promise = new Promise((resolve, reject) => {
            axios.post('https://fhirtest.uhn.ca/baseDstu3/Binary', {
                file: file
            }).then((response) => {
                this.setState(() => {
                    const list = _.clone(this.state.list)
                    list[index] = { isSent: true }
                    return { list }
                })
                resolve(response.data.id)
            }).catch((error) => {
                reject(error)
            })
        })
        return promise
    }
}
