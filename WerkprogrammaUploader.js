(function(){
  const e = React.createElement;
  const LETTER_URL = 'https://www.acwbv.nl/wp-content/uploads/2025/08/Briefpapier-overige-pagina-1.jpg';

  function WerkprogrammaUploader({ onInsert }){
    const [pages, setPages] = React.useState([]);
    const [file, setFile] = React.useState(null);

    async function handleFile(ev){
      const f = ev.target.files[0];
      if(!f) return;
      setFile(f);
      if(!window.pdfjsLib){
        if(window.ensurePdfJs){
          await window.ensurePdfJs();
        }
      }
      if(!window.pdfjsLib){ console.error('pdfjsLib missing'); return; }
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.js/pdf.worker.min.js';
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({data: buffer}).promise;
      const imgs=[];
      for(let i=1;i<=pdf.numPages;i++){
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({scale:1.5});
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({canvasContext: ctx, viewport}).promise;
        imgs.push(canvas.toDataURL('image/png'));
      }
      setPages(imgs);
    }

    async function handleInsert(){
      if(!file) return;
      if(!window.PDFLib || !PDFLib.PDFDocument){
        alert('pdf-lib niet beschikbaar');
        return;
      }
      const existingBytes = await file.arrayBuffer();
      const existingPdf = await PDFLib.PDFDocument.load(existingBytes);
      const newPdf = await PDFLib.PDFDocument.create();
      const letterBytes = await fetch(LETTER_URL, {mode:'cors'}).then(r=>r.arrayBuffer());
      const letterImage = await newPdf.embedJpg(letterBytes);
      const srcPages = existingPdf.getPages();
      for(const p of srcPages){
        const { width, height } = p.getSize();
        const page = newPdf.addPage([width, height]);
        page.drawImage(letterImage, { x:0, y:0, width, height });
        const embedded = await newPdf.embedPage(p);
        page.drawPage(embedded, { x:0, y:0, width, height });
      }
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], {type:'application/pdf'});
      onInsert && onInsert(blob);
    }

    return e('div', null,
      e('p', null, 'Wil je een werkprogramma toevoegen?'),
      e('input', {type:'file', accept:'.pdf', onChange:handleFile}),
      e('div', null, pages.map((src, idx) => e('div', {className:'letter', key:idx},
        e('div', {className:'letter-bg'}, e('img',{src:LETTER_URL, crossOrigin:'anonymous', style:{width:'100%', height:'100%'}})),
        e('div', {className:'letter-body workprog-body'}, e('img',{src, style:{width:'100%'}}))
      ))),
      pages.length>0 && e('div', {className:'actions', style:{marginTop:'10px'}},
        e('button', {className:'btn', onClick:handleInsert}, 'Export/Invoegen')
      )
    );
  }

  window.WerkprogrammaUploader = WerkprogrammaUploader;
  window.initWerkprogrammaUploader = function(){
    const root = document.getElementById('workprogReactRoot');
    if(!root || !window.ReactDOM) return;
    ReactDOM.createRoot(root).render(e(WerkprogrammaUploader, {onInsert: b => { window.workprogPdfBlob = b; }}));
  };
})();
