import { Request, Response } from 'express';
import * as fs from 'fs';
import { App } from './app';

export class Controller {

  static async handle(req: Request, res: Response, next) {
    try {
      var readable = fs.createReadStream('./data/processed-data.json');
      readable.pipe(res);
    } catch(ex) {
      next(ex);
    }
  }

  static generate(req: Request, res: Response, next) {
    try {
      App.handler();
      res.end();
    } catch(ex) {
      next(ex);
    }
  }

}
