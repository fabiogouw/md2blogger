import authentication from './authentication.js';

let conversion = Promise.resolve("");

let posting = Promise.resolve("");

const md2blogger = function() {
    return Promise.all([conversion, authentication()])
        .then(posting)
        .catch(ex => console.log(ex));
}

export default md2blogger;