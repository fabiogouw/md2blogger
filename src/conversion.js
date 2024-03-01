import markdownit from 'markdown-it';
import markdownitContainer from 'markdown-it-container';
import fs from 'fs';

const metadataExtractor = /(---\n)(.+?)(---\n)/s;
const metadataTitleExtractor = /(title: )(.+?)(\n)/s;

const conversion = function (mdFile) {
    let md = markdownit()
        .use(markdownitContainer, 'note', {

            validate: function (params) {
                return params.trim().match(/^note\s+(.*)$/);
            },

            render: function (tokens, idx) {
                var m = tokens[idx].info.trim().match(/^note\s+(.*)$/);

                if (tokens[idx].nesting === 1) {
                    // opening tag
                    return `<div class="${ md.utils.escapeHtml(m[1]) }">`;

                } else {
                    // closing tag
                    return '</div>\n';
                }
            }
        });

    const mdContent = fs.readFileSync(mdFile, 'utf8');
    let metadataMatch = metadataExtractor.exec(mdContent);
    if(metadataMatch && metadataMatch.length === 4) {
        let metadata = metadataMatch[2]
        let titleMatch = metadataTitleExtractor.exec(metadata);
        if(titleMatch && titleMatch.length === 4) {
            let content = mdContent.replace(metadataMatch[0], "")
            return Promise.resolve({
                Title: titleMatch[2],
                Content: md.render(content)
            });
        }
        return Promise.reject(new Error("No title blog provided in metadata."));
    }
    return Promise.reject(new Error("No blog post metadata provided in the markdown file."));
}

export default conversion;