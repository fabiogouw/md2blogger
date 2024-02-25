import authentication from './authentication.js';

let conversion = Promise.resolve("");

let posting = Promise.resolve("");

const md2blogger = async function() {
    let [htmlContent, authResult] = await Promise.all([conversion, authentication()]);
    
    /*return Promise.all([conversion, authentication()])
        .then(posting)
        .catch(ex => console.log(ex));*/
    return "ok";
}

export default md2blogger;