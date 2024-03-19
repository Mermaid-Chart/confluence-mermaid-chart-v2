import { h, render, Fragment } from 'https://esm.sh/preact';
import { useState, useEffect, useRef } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';
import {IMAGE_SIZES} from '/js/constatnts.js';

const html = htm.bind(h);
let JWTToken;
window.AP.context.getToken((t) => {
  JWTToken = t;
})

function Diagram (props) {
  let image = '';
  if (props.document.documentID) {
    const svg = encodeURIComponent(props.document.diagramCode)
    image = html`<div class="image">
       <img src="data:image/svg+xml,${svg}" alt="${props.document.title}" />
    </div>`;
    // const params = new URLSearchParams({...props.document, jwt: JWTToken});
    // image = html`<div class="image">
    //     <img src="/diagram?${params.toString()}" alt="${props.document.title}" />
    // </div>`;
  }

  return html`
      <${Fragment}>
        ${image}
        <div class="select ${image ? "selected" : ''}">
          <button type="button" onClick="${props.onOpenFrame}">${image ? "Change" : "Select"} diagram</button>
        </div>
      </${Fragment}>
  `
}

function App () {
  const [isFrame, openIframe] = useState(false);
  const [data, setData] = useState({
    caption: "",
    size: "",
  });
  const dataRef = useRef();
  useEffect(() => {
    dataRef.current = data;
  }, [Object.values(data)])

  const onOpenFrame = () => {
    openIframe(true);
  }

  useEffect(() => {
    window.AP.confluence.getMacroData((params) => {
      setData(params);
    })
    window.AP.dialog.getButton("submit").bind(function () {
      window.AP.confluence.saveMacro({...dataRef.current, diagramCode: ''}, dataRef.current.diagramCode);
      return true;
    });
    window.onmessage = function(e) {
      const action = e.data.action;
      switch (action) {
        case "cancel":
          openIframe(false);
          break;

        case "save":
          setData((prev) => ({...prev, ...e.data.data }));
          openIframe(false);
          break;
      }
    }
  }, []);

  if (isFrame) {
    const iframeData = {
      document: data
    };
    return html`
        <iframe src="${mcEditorUrl}" name="${JSON.stringify(iframeData)}" />
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
