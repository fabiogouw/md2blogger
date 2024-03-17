import imageToBase64 from "image-to-base64";
import path from "path";
import fs from "fs";

const imagesExtractor = /!\[[^\]]*\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g
const isUrlExtractor = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

const getBasePathForImages = function (mdFile) {
    return path.dirname(path.resolve(mdFile));
}

const isUrl = function (imgPath) {
    return isUrlExtractor.exec(imgPath) != null;
}

const conversion = async function (mdFile) {
    let mdContent = fs.readFileSync(mdFile, 'utf8');
    let basePathForImages = getBasePathForImages(mdFile);
    let match;
    let images = []
    do {
        match = imagesExtractor.exec(mdContent);
        if (match) {
            let imagePath = match[1];
            if (!isUrl(imagePath)) {
                let imageAbsolutePath = path.resolve(basePathForImages, imagePath);
                let base64Content = await imageToBase64(imageAbsolutePath);
                images.push({
                    Image: imagePath,
                    Content: `data:image/jpg;base64,${base64Content}`
                });
            }
        }
    } while (match);
    return images;
}

export default conversion;