import axios from 'axios';

// instance d'axios qui permet de recup les credentials
// a partir de ce qui est set ds le back
export default axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
})

// pour typer directement ce qu'on fait au dessus et eviter multiples import
export type { AxiosResponse } from 'axios';