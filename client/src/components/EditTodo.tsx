import * as React from 'react'
import {
  Form,
  Button,
  Modal,
  Dimmer,
  Loader,
  Segment,
  Card,
  Image,
  Icon
} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import {
  getUploadUrl,
  uploadFile,
  patchNameTodo,
  getTodo
} from '../api/todos-api'
import { History } from 'history'
import { Todo } from '../types/Todo'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile
}
enum LoadingState {
  loading,
  error,
  loaded
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
  loading: LoadingState
  item?: Todo
}

export class EditTodo extends React.Component<EditTodoProps, EditTodoState> {
  state: EditTodoState = {
    file: undefined,
    name: '',
    uploadState: UploadState.NoUpload,
    confirmModal: false,
    loading: LoadingState.loading
  }

  componentDidMount(): void {
    getTodo(this.props.auth.getIdToken(), this.props.match.params.todoId)
      .then((item) => {
        this.setState({ item: item, loading: LoadingState.loaded })
      })
      .catch((err) => {
        this.setState({ loading: LoadingState.error })
      })
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
        await patchNameTodo(
          this.props.auth.getIdToken(),
          this.props.match.params.todoId,
          this.state.name
        )
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
  getCard() {
    return (
      <Card>
        <Image src={this.state.item?.attachmentUrl} wrapped ui={false} />
        <Card.Content>
          <Card.Header>Todo Infomation</Card.Header>
          <Card.Meta>
            <span className="date">{this.state.item?.dueDate}</span>
          </Card.Meta>
          <Card.Description>
            {this.state.item?.name}
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <a>
            <Icon name="checkmark" color={`${this.state.item?.done ? 'blue': 'grey'}`}/>
            {this.state.item?.done ? 'Done': 'Still working'}
          </a>
        </Card.Content>
      </Card>
    )
  }
  render() {
    if (this.state.loading === LoadingState.loading) {
      return (
        <Segment>
          <Dimmer active inverted>
            <Loader inverted content="Loading" />
          </Dimmer>
        </Segment>
      )
    }
    if (this.state.loading === LoadingState.error) {
      this.props.history.push('/')
    }
    if (this.state.loading === LoadingState.loaded) {
      return (
        <>
          <div>
            <section>{this.getCard()}</section>

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
}
