import React, { useState, useMemo, useEffect, memo, useCallback, useRef } from 'react';
import "./App.css"
import reducer from "./reducers.js"
import { createSet, createAdd, createRemove, createToggle } from "./action"
let idIns = Date.now();
const TO_KEY = "_$KEY_";
function bindActionCreators(actionCreators, dispatch) {//创建一个绑定dispath函数
  // {
  // add:dispath(add(1))
  // remove:dispath(remove(1))
// }
  const res = {}
  for (let key in actionCreators) {
    res[key] = function (...args) {
      const actionCreator = actionCreators[key];//得到每个函数
      const action = actionCreator(...args);//调用得到返回
      dispatch(action)//触发派发
    }
  }
  // {
  // add:add(1)
  // remove:remove(1)
// }
  return res
}
function App() {
  const [todos, setTodos] = useState([]);
  const [incrementCount, setIncrementCount] = useState(0)
  const dispatch = useCallback((action) => {
    const state = { todos, incrementCount }
    const setter = {
      todos: setTodos,
      incrementCount: setIncrementCount
    }
    const newState = reducer(state, action)
    for (let key in newState) {
      setter[key](newState[key])
    }
  }, [todos, incrementCount])
  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem(TO_KEY) || "[]");
    // setTodos(todos)
    // dispatch({type:"set",payload:todos})
    dispatch(createSet(todos))
  }, [])
  useEffect(() => {
    localStorage.setItem(TO_KEY, JSON.stringify(todos))
  }, [todos])

  return (
    <div className="container">
      <Control {
        ...bindActionCreators({ addTodo: createAdd }, dispatch)
      } />
      <ToDolists {
        ...bindActionCreators({
          removeTodo: createRemove,
          toggleTodo: createToggle
        }, dispatch)
      } todos={todos} />
    </div>
  )
}

const Control = memo(function Control(props) {
  const { addTodo } = props;
  const InputRef = useRef();
  const onSubmit = (e) => {
    e.preventDefault();
    const inputVal = InputRef.current.value.trim();
    addTodo({
      id: ++idIns,
      text: inputVal,
      complete: false
    })
    InputRef.current.value = ""
  }
  return (
    <div>
      <h1>todo</h1>
      <form onSubmit={onSubmit}>
        <input type="text" ref={InputRef} className="input-container" placeholder="请输入需要做的事情" />
      </form>
    </div>
  )
})

const ToDolists = memo(function ToDolists(props) {
  const { removeTodo, toggleTodo, todos } = props;
  return (
    <ul className="ul">
      {todos.map(item => <TodoItem todo={item} key={item.id} removeTodo={removeTodo} toggleTodo={toggleTodo} />)}
    </ul>
  )
})
const TodoItem = memo(function TodoItem(props) {
  const { removeTodo, toggleTodo, todo: { id, text, complete } } = props;
  const onChange = () => {
    toggleTodo(id)
  }
  const onRemove = () => {
    removeTodo(id)
  }
  return (
    <li className="li">
      <input type="checkbox" checked={complete} onChange={onChange} />
      <label className={complete ? "complete" : ""}>{text}</label>
      <button onClick={onRemove}>&#xd7;</button>
    </li>)
})
export default App;

