import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Liquid } from 'liquidjs';
import { db } from './db'
import { BingoModel } from './models';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
var engine = new Liquid();

engine.registerFilter(
  'hasNumber', 
  (numberSorted, listnumber) => { 
    return listnumber.find(
      (row: { number: Number; }) => { 
        if(row.number == numberSorted) return true; 
        return false; 
      }
    )
  })

engine.registerFilter(
  'resetNumber', (req, listnumber) => {
    return listnumber.findAndCountAll(
    BingoModel.destroy()
    )
    })

// register liquid engine
app.engine('liquid', engine.express()); 
app.set('views', './views');            // specify the views directory
app.set('view engine', 'liquid'); 
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req: Request, res: Response) => {
  // await BingoModel.sync({ alter: true });
  // const bingo = await BingoModel.create({ number: 1 })
  const listnumber = await BingoModel.findAndCountAll({raw:true})
  res.render('panel', {'listnumber': listnumber});
});

app.post(
  '/', 
   async (req, res) => {
    console.log(req.body.sorted)
    const bingonumber = await BingoModel.findAndCountAll({
      where: {
        number: req.body.sorted 
      }
    });
    console.log("bingonumber:")
    console.log(bingonumber.count)
    console.log(typeof bingonumber)
    console.log(":bingonumber")
    if (bingonumber.count === 0) {
      BingoModel.create({
        number: req.body.sorted 
      })
    }
    else {
      BingoModel.destroy({
        where: {
            number: req.body.sorted
        }
      })
    }  
    const listnumber = await BingoModel.findAndCountAll({raw:true})
  res.render('panel', {'listnumber': listnumber})
  });

app.get('/panelsorteds', async (req, res) => {
  const listnumber = await BingoModel.findAndCountAll({raw:true, order:[
    ['createdAt', 'DESC']
  ]})
  const currentPageUrl = req.originalUrl;
  res.render('panelsorteds', {'listnumber': listnumber, 'page': { 'url': currentPageUrl }})
});

app.post('/reset', async (req, res) => {
  try {
    const listnumbers = await BingoModel.findAll();
    for (const listnumber of listnumbers) {
      await listnumber.destroy();
      console.log('Registro excluído');
    }
    res.redirect('/')
  } 
  catch (error) {
    console.error('Ocorreu um erro:', error);
    res.status(500).send('Ocorreu um erro ao excluir os registros.');
  }
});

app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${8000}`);
});
