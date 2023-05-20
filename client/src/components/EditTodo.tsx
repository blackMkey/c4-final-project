import * as React from 'react'
import { Form, Button, Modal } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/todos-api'
import { History } from 'history'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
  history: History
}

interface EditTodoState {
  file: any
  uploadState: UploadState
  name: string
  confirmModal: boolean
}

export class EditTodo extends React.Component<EditTodoProps, EditTodoState> {
  state: EditTodoState = {
    file: undefined,
    name: '',
    uploadState: UploadState.NoUpload,
    confirmModal: false
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }
  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      name: event.target.value
    })
  }
  handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault()
    console.log('this.state.nam', this.state.name, !this.state.name)
    if (!this.state.file && !this.state.name) {
      alert('File should be selected')
      return
    }
    this.setState({
      confirmModal: !this.state.confirmModal
    })
  }

  updateTodo = async () => {
    try {
      if (this.state.file) {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(
          this.props.auth.getIdToken(),
          this.props.match.params.todoId
        )

        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)
      }

      if (this.state.name) {
        console.log('UPDATE TO DO NAMEEEE')
      }

      this.props.history.push('/')
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }
  getModalContent() {
    const file = this.state.file ? 'Image' : ''
    const and = this.state.file && this.state.name ? ' and ' : ' '
    const name = this.state.name ? 'File Name' : ''
    return 'Do you want to update ' + file + and + name + '.'
  }
  render() {
    return (
      <>
        <div>
          <h1>Update Todo Infomation</h1>

          {this.state.uploadState === UploadState.NoUpload && (
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <label>Name</label>
                <input
                  type="text"
                  placeholder="File name"
                  onChangeCapture={this.handleNameChange}
                />
              </Form.Field>
              <Form.Field>
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  placeholder="Image to upload"
                  onChange={this.handleFileChange}
                />
              </Form.Field>

              <Button
                loading={this.state.uploadState !== UploadState.NoUpload}
                type="submit"
              >
                Upload
              </Button>
            </Form>
          )}
        </div>
        <Modal open={this.state.confirmModal}>
          <Modal.Header>
            {this.state.uploadState === UploadState.NoUpload
              ? this.getModalContent()
              : 'Uploading'}
          </Modal.Header>
          <Modal.Content>
            {this.state.uploadState === UploadState.NoUpload &&
              this.getModalContent()}
            {this.state.uploadState === UploadState.FetchingPresignedUrl && (
              <p>Uploading image metadata</p>
            )}
            {this.state.uploadState === UploadState.UploadingFile && (
              <p>Uploading file</p>
            )}
          </Modal.Content>
          {this.state.uploadState === UploadState.NoUpload ? (
            <Modal.Actions>
              <Button
                onClick={(e) => this.setState({ confirmModal: false })}
                negative
              >
                Cancle
              </Button>
              <Button onClick={(e) => this.updateTodo()} positive>
                Update
              </Button>
            </Modal.Actions>
          ) : null}
        </Modal>
      </>
    )
  }
}
