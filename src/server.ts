import express, { NextFunction, Response, Request } from 'express';
import bodyParser from 'body-parser';
import Axios from "axios";
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  const validateImageURLQueryParams = (req: Request, res: Response, next: NextFunction) => {
    if (req.query.image_url) return next();
    else res.status(400).send('Please supply an "image_url" query parameter');
  };

  const isValidImageSource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Axios.get(req.query.image_url as string);
      next();
    } catch (error) {
      res.status(403).send('Invalid image source');
    }
  }

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get('/filteredimage', validateImageURLQueryParams, isValidImageSource, async (req: Request, res: Response) => {
    // image_url type is obtained from the generics passed into the Request type
    const { image_url } = req.query as { image_url: string; };
    try {
      const imagePath = await filterImageFromURL(image_url);
      res.status(200).sendFile(imagePath, () => {

        deleteLocalFiles([imagePath]);
      });
    } catch (error) {
      console.log((error as Error).stack);
      res.status(500).send('An error occured');
    }
  });

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();