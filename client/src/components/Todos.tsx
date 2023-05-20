import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
}

export const Todos = (props: TodosProps) => {
  const [state, setState] = React.useState<TodosState>({
    todos: [],
    newTodoName: '',
    loadingTodos: true
  })

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((state) => ({ ...state, newTodoName: event.target.value }))
  }

  const onEditButtonClick = (todoId: string) => {
    props.history.push(`/todos/${todoId}/edit`)
  }

  const calculateDueDate = (): string => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  const onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = calculateDueDate()
      const newTodo = await createTodo(
        props.auth.getIdToken(),
        {
          name: state.newTodoName,
          dueDate
        }
      )
      setState((current) => ({
        ...current,
        newTodoName: '',
        todos: [...current.todos, newTodo]
      }))
    } catch {
      alert('Todo creation failed')
    }
  }

  const onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(props.auth.getIdToken(), todoId)
      setState((current) => ({
        ...current,
        todos: current.todos.filter((todo) => todo.todoId !== todoId)
      }))
    } catch {
      alert('Todo deletion failed')
    }
  }

  const onTodoCheck = async (pos: number) => {
    try {
      const todo = state.todos[pos]
      await patchTodo(
        props.auth.getIdToken(),
        todo.todoId,
        {
          name: todo.name,
          dueDate: todo.dueDate,
          done: !todo.done
        }
      )

      setState((current) => ({
        ...current,
        todos: update(state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      }))
    } catch {
      alert('Todo deletion failed')
    }
  }

  React.useEffect(() => {
    getTodos(props.auth.getIdToken())
      .then((todos) => {
        setState((current) => ({
          ...current,
          todos,
          loadingTodos: false
        }))
      })
      .catch((e) => {
        alert(`Failed to fetch todos: ${(e as Error).message}`)
      })
  }, [props.auth])

  const renderLoading = () => {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  const renderTodosList = () => {
    return (
      <Grid padded>
        {state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl ? (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              ) : null}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  const renderTodos = () => {
    if (state.loadingTodos) {
      return renderLoading()
    }

    if (state.todos && state.todos.length > 0) {
      return renderTodosList()
    } else {
      return <h3>Your Todo list is empty</h3>
    }
  }

  const renderCreateTodoInput = () => {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  return (
    <div>
      <Header as="h1">TODOs</Header>

      {renderCreateTodoInput()}

      {renderTodos()}
    </div>
  )
}
