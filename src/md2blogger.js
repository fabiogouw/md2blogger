import authentication from './authentication.js';
import postToBlog from './posting.js';

let conversion = Promise.resolve({
    Content: "<h1>Test 32</h1>",
    Title: "Super new Teste"
});

const md2blogger = async function(mdFile, blogUrl) {
    let [blogPost, authResult] = await Promise.all([conversion, authentication()]);
    await postToBlog(blogUrl, blogPost, authResult);
}

export default md2blogger;