import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { Login } from './routes/Login'
import { Home } from './routes/Home'

import './App.css'

export const App = () => {
  return (
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  )
}
