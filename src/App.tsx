import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { AnswersList } from "./pages/AnswerList"
import { AnswerForm } from "./pages/AnswerForm"

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AnswersList />} />
          <Route path="/new" element={<AnswerForm />} />
          <Route path="/edit/:id" element={<AnswerForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
