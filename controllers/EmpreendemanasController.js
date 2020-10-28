const { connect } = require('../models/Repository')
const empreendemanasModel = require('../models/EmpreendemanasSchema')
const { projetosModel } = require('../models/ProjetosSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'MIICXAIBAAKBgQCOl54HaBM/WiL/jPPdFGjm9f8VprUst1J+vs7G/YRGRHYLGqt+M/ljAhcROPy3FdaVi2smqqyZhf4d+EZ9lKM6LVed91sxvcyMFEp6x8R2KS9wIzUtJ6r1MAIKd8HURmbaN4V2TV/FLeOUANRCZ+QhYEy+eNbuVIJANYtXBUSn8QIDAQABAoGBAIuVS/MAJGdNuxjiSA5Q3mfIw03UhWIiirTb39rXbNbESbGRB/NguW38K8yGNoya6hY2BkwxowgeLKX11js0d5sSHgEgL+pDQtXshHu7vlYU0ksHwfmD/R8+ZHJH6F6L0vuzs4NoVK/8iQHFLboUjF2sORyuLHbBmFZQWhInet8pAkEA0OlL2uHCYhkNuokJ9H+OnJEqKS2BtYSkH3Hrh2opZg2HtvUtXEIxzmj/95CzxMXQtNJhQMK3ekvnF3Upcj2avwJBAK67i8OEKM2jerbFKrBqr6/kUkZeyHLA8I4L2C3/3nKPGUj/GAc2xxuK1XxnpC0e3Wqz5OMwzkWU4Ynblsdq2U8CQHu9U6LICbzVHh6YwP7C9xOhoBlXzPZZJGVDssA4j2DVLsednUqCIsIhy0s1uGUazi3sVpJnQwn7H1vzl6ME/j0CQAT7qj+4LCW5LM27j70aPcppW4NQPq0vHW0fn1moe2KO/CydwcSq5kC909rJZeA3ih755GQqRyeq2EfDMGidfncCQD770Za6sJP1/i1vcdoWuWYnhpiU8TNKjFb2vJEN598amcyJV9PlAAdEkszh6EDA76t6/yT6NoUn/y9x4YskzQo='

connect();

const getAllProjetos = (request, response) => {

  empreendemanasModel.find((error, empreendemanas) => {
    const arrayProjetos = [];

    if (error) {
      return response.status(500).send(error);
    }

    empreendemanas.map((index) => {
      arrayProjetos.push(index.projetos[0]);
    });

    return response.status(200).send(arrayProjetos);
  });
};

const getAll = (request, response) => {
  try {
    empreendemanasModel.find((error, empreendemanas) => {
      if (error) {
        return response.status(500).send(error);
      }

      return response.status(200).send(empreendemanas);
    });
  } catch (err) {
    return response.status(424).send({ message: err });
  }
};

const newEmpreendemana = (request, response) => {
  const encryptedPassword = bcrypt.hashSync(request.body.senha)
  request.body.senha = encryptedPassword
  request.body.permissao = 'comum'
  const registeredEmpreendemana = new empreendemanasModel(request.body)

  registeredEmpreendemana.save((error) => {

    if (error) {
      return response.status(500).send(error);
    }

    return response.status(201).send(registeredEmpreendemana)
  })
}


const login = async (request, response) => {
  const empreendemanaFound = await empreendemanasModel.findOne({ email: request.body.email })

  if (empreendemanaFound) {
    const correctPassword = bcrypt.compareSync(request.body.senha, empreendemanaFound.senha)

    if (correctPassword) {
      const token = jwt.sign(
        {
          permissao: empreendemanaFound.permissao
        },
        SECRET_KEY,
        { expiresIn: 6000 }
      );

      return response.status(200).send({ token });
    }

    return response.status(401).send('Mana, your password is incorrect!')
  }

  return response.status(404).send('Ooops! Empreendemana not found.')
}

const update = (request, response) => {
  const id = request.params.id;
  const updateEmpreendemana = request.body;
  const options = { new: true };

  try { empreendemanasModel.findByIdAndUpdate(
    id,
    updateEmpreendemana,
    options,
    (error, empreendemana) => {
      if (error) {
        return response.status(500).send(error);
      }

      if (empreendemana) {
        return response.status(200).send(empreendemana);
      }

      return response.status(404).send('Ooops! Empreendemana not found.')
    }
  );
};

const remove = (request, response) => {
  const id = request.params.id;

  try {empreendemanasModel.findByIdAndDelete(id, (error, empreendemana) => {
    if (error) {
      return response.status(500).send(error);
    }

    if (empreendemana) {
      return response.status(200).send('Empreendemana successfully deleted!')
    }

    return response.status(404).send('Ooops! We did not find this  empreendemana.')
  })
}
  
module.exports = {
  getAll,
  getAllProjetos,
  newEmpreendemana,
  remove,
  update,
  login,
};
