/*
  DESAFIO 1

  Aplicação para armazenar projetos e suas tarefas utilizando Express.

*/

const express = require('express')
const fs = require('fs');

const server = express()

server.use(express.json())

const pathProjects = './projects.json';

var projects = [];
loadProjects();

//console.log(JSON.stringify(projects))

function newId() {
  let mId = 0

  for (proj of projects) {
    let iId = parseInt(proj.id)
    if (iId>mId) {
      mId = iId
    }
  }

  mId++

  return mId.toString()
}

function getProjectIndex(id) {
  let index = false;
  let i = -1;
  for (let proj of projects) {
    i++
    if (proj.id==id) {
      index = i
      break
    }
  }
  return index
}

// Middlewares
// -----------
//
// Crie um middleware que será utilizado em todas rotas que recebem o ID do projeto nos parâmetros da URL que verifica se o projeto com aquele ID existe. Se não existir retorne um erro, caso contrário permita a requisição continuar normalmente;

// Crie um middleware global chamado em todas requisições 
// que imprime (console.log) 
// uma contagem de quantas requisições foram feitas na aplicação até então;
//
acessos = 0;
//
server.use((req, res, next) => {
  acessos++;
  console.log(`Solicitações: ${acessos}`);

  return next();
})


function projectIdExists(req, res, next) {
  const { id } = req.params

  req.id = id;
  req.index = getProjectIndex(id);

  if (req.index===false || req.index<0 || req.index>=projects.length) {
    return res.status(400).json({ message: "Project don't exists" })
  }

  return next();
}

function loadProjects() {
  projects = []

  try {
    if (fs.existsSync(pathProjects)) {
      var teste = fs.readFile(pathProjects, 'utf8', (err, data) => {
        if (err) {
          console.log(err)
        }
        else {
          projects = JSON.parse(data);
        }
      })
    }
  }
  catch(err) {
    console.warn(err)
  }
}

function saveProjects() {
  fs.writeFileSync(pathProjects, JSON.stringify(projects), 'utf8');
}

// ROTAS
// =====

// POST /projects:
// ---------------
//   A rota deve receber id e title dentro do corpo 
//   e cadastrar um novo projeto dentro de um array no seguinte formato:
//     { id: "1", title: 'Novo projeto', tasks: [] }
//
server.post('/projects', (req, res) => {
  const { title, tasks } = req.body

  const nId = newId()

  projects.push({
    id: nId,
    title: title,
    tasks: tasks,
  })

  saveProjects();

  return res.json(projects)
})

// GET /projects: 
// Rota que lista todos projetos e suas tarefas;
//
server.get('/projects', (req, res) => {
  return res.json(projects)
})

// PUT /projects/:id: 
// A rota deve alterar apenas o título do projeto 
// com o id presente nos parâmetros da rota;
//
server.put('/projects/:id', projectIdExists, (req, res) => {
  const { title } = req.body
  projects[req.index].title = title
  
  saveProjects();

  return res.json(projects)
})

// DELETE /projects/:id: 
// A rota deve deletar o projeto com o id presente nos parâmetros da rota;
//
server.delete('/projects/:id', projectIdExists, (req, res) => {
  projects.splice(req.index, 1)

  saveProjects();

  return res.send();
})

// POST /projects/:id/tasks: 
// A rota deve receber um campo title 
// e armazenar uma nova tarefa no array de tarefas de um projeto específico 
// escolhido através do id presente nos parâmetros da rota;
//
server.post('/projects/:id/tasks', projectIdExists, (req, res) => {
  const { title } = req.body  

  projects[req.index].tasks.push(title)

  saveProjects();

  return res.json(projects)
})

server.listen(3334)


