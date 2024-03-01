import authentication from './authentication.js';
import postToBlog from './posting.js';
import conversion from './conversion.js'

const md2blogger = async function(mdFile, blogUrl) {
    let [blogPost, authResult] = await Promise.all([conversion(mdFile), authentication()]);
    await postToBlog(blogUrl, blogPost, authResult);
}

export default md2blogger;