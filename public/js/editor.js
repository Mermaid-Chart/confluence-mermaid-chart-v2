import { h, render, Fragment } from 'https://esm.sh/preact';
import { useState, useEffect, useRef } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';
import {IMAGE_SIZES} from '/js/constatnts.js';

const html = htm.bind(h);
let JWTToken;
window.AP.context.getToken((t) => {
  JWTToken = t;
})

function Diagram ({document, onOpenFrame}) {
  let image = '';
  if (document.documentID) {
    const svg = encodeURIComponent(document.diagramCode)
    image = html`<div class="image">
       <img src="data:image/svg+xml,${svg}" alt="${document.title}" />
    </div>`;
    // const params = new URLSearchParams({...props.document, jwt: JWTToken});
    // image = html`<div class="image">
    //     <img src="/diagram?${params.toString()}" alt="${props.document.title}" />
    // </div>`;
  }

  const onEdit = () => {
    onOpenFrame(`${mcEditorEditUrl}${document.projectID}/diagrams/${document.documentID}/version/v.${document.major}.${document.minor}/edit`);
    return false
  }

  const editButton = html`<button type="button" onClick="${onEdit}">Edit diagram</button>`;

  return html`
      <${Fragment}>
        ${image}
        <div class="select ${image ? "selected" : ''}">
          ${image ? editButton : ""}
          <button type="button" onClick="${() => onOpenFrame(mcEditorUrl)}">${image ? "Replace" : "Select"} diagram</button>
        </div>
      </${Fragment}>
  `
}

function App () {
  const [iframeURL, setIframeURL] = useState("");
  const [data, setData] = useState({
    caption: "",
    size: "small",
  });
  const dataRef = useRef();
  useEffect(() => {
    dataRef.current = data;
  }, [Object.values(data)])

  useEffect(() => {
    if (data.documentID) {
      window.AP.dialog.getButton('submit').enable();
    } else {
      window.AP.dialog.getButton('submit').disable();
    }
  }, [data.documentID]);

  const onOpenFrame = (url) => {
    // eslint-disable-next-line no-undef
    setIframeURL(url);
  }

  useEffect(() => {
    window.AP.confluence.getMacroBody((macroBody) => {
      setData((data) => ({...data, diagramCode: macroBody}));
    });
    window.AP.confluence.getMacroData(({__bodyContent: _, ...params}) => {
      setData((data) => ({...data, ...params}));
    });
    window.AP.events.on("dialog.submit", async () => {
      const {diagramCode: _, ...saveData} = dataRef.current
      await window.AP.confluence.saveMacro(saveData, dataRef.current.diagramCode);

      window.AP.confluence.closeMacroEditor();
    })
    window.AP.dialog.disableCloseOnSubmit();

    window.onmessage = function(e) {
      const action = e.data.action;
      switch (action) {
        case "cancel":
          setIframeURL("");
          break;

        case "save":
          setData((prev) => ({...prev, ...e.data.data }));
          setIframeURL("");
          break;
      }
    }
  }, []);

  if (iframeURL) {
    const iframeData = {
      document: data
    };
    return html`
        <iframe src="${iframeURL}" name="${JSON.stringify(iframeData)}" />
    `;
  }

  return html`
      <${Fragment}>
        <div class="wrapper">
            <div class="form-container">
                <div class="form-row">
                    <label class="label">Caption</label>
                    <div class="field">
                        <input 
                          type="text"
                          name="caption" 
                          value="${data.caption}"
                          onInput="${(e) => setData((prev) => ({...prev, caption: e.target.value}))}"
                        />
                    </div>
                </div>
                <div class="form-row">
                    <label class="label">Diagram size</label>
                    <div class="field">
                        <select
                          name="size"
                          value="${data.size}"
                          onChange="${(e) => setData((prev) => ({...prev, size: e.currentTarget.value}))}"
                        >
                            ${Object.keys(IMAGE_SIZES).map((s) => html`<option name="${s}">${s}</option>`)}
                        </select>
                    </div>
                </div>
            </div>
            <div class="diagram">
                <${Diagram} document=${data} onOpenFrame="${onOpenFrame}" />
            </div>
        </div>
      </${Fragment}>
  `;
}

render(html`<${App} />`, document.getElementById('editor-content'));
