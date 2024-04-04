import {Fragment, h} from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function Diagram({document, onOpenFrame}) {
    let image = '';
    if (document.documentID) {
        const svg = encodeURIComponent(document.diagramCode);
        image = html`
            <div class="image">
                <img src="data:image/svg+xml,${svg}" alt="${document.title}"/>
            </div>`;
    }

    const onEdit = () => {
        onOpenFrame(
            `${MC_BASE_URL}/app/projects/${document.projectID}/diagrams/${document.documentID}/version/v.${document.major}.${document.minor}/edit`);
        return false;
    };

    const editButton = html`
        <button type="button" onClick="${onEdit}">Edit diagram</button>`;

    return html`
        <${Fragment}>
            ${image}
            <div class="select ${image ? 'selected' : ''}">
                ${image ? editButton : ''}
                <button type="button" onClick="${() => onOpenFrame(
                        `${MC_BASE_URL}/app/plugins/confluence/select`)}">
                    ${image ? 'Replace' : 'Select'} diagram
                </button>
            </div>
        </${Fragment}>
    `;
}
